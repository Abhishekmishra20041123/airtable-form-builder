const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
const crypto = require('crypto');

// Store code verifiers temporarily (in production, use Redis or similar)
const codeVerifiers = new Map();

// Generate PKCE code verifier and challenge
function generatePKCE() {
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
    return { codeVerifier, codeChallenge };
}

router.get('/airtable', (req, res) => {
    const state = crypto.randomBytes(16).toString('hex');
    const { codeVerifier, codeChallenge } = generatePKCE();

    // Store code verifier with state
    codeVerifiers.set(state, codeVerifier);

    // Clean up old verifiers after 10 minutes
    setTimeout(() => codeVerifiers.delete(state), 10 * 60 * 1000);

    const scope = 'data.records:read data.records:write schema.bases:read';
    const redirectUri = process.env.AIRTABLE_REDIRECT_URI;
    const clientId = process.env.AIRTABLE_CLIENT_ID;

    const authUrl = `https://airtable.com/oauth2/v1/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

    res.redirect(authUrl);
});

router.get('/airtable/callback', async (req, res) => {
    const { code, error, state } = req.query;

    if (error) {
        return res.status(400).send(`Error: ${error}`);
    }

    const codeVerifier = codeVerifiers.get(state);
    if (!codeVerifier) {
        return res.status(400).send('Invalid state or expired session');
    }

    // Clean up the verifier
    codeVerifiers.delete(state);

    try {
        // Exchange code for tokens with PKCE using Basic Auth
        const encodedCredentials = Buffer.from(`${process.env.AIRTABLE_CLIENT_ID}:${process.env.AIRTABLE_CLIENT_SECRET}`).toString('base64');

        const tokenResponse = await axios.post('https://airtable.com/oauth2/v1/token', new URLSearchParams({
            code,
            redirect_uri: process.env.AIRTABLE_REDIRECT_URI,
            grant_type: 'authorization_code',
            code_verifier: codeVerifier
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${encodedCredentials}`
            }
        });

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        // Get user info
        const userResponse = await axios.get('https://api.airtable.com/v0/meta/whoami', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const { id: airtableUserId, email } = userResponse.data;

        // Save or update user
        let user = await User.findOne({ airtableUserId });
        const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);

        if (user) {
            user.accessToken = access_token;
            user.refreshToken = refresh_token;
            user.tokenExpiresAt = tokenExpiresAt;
            await user.save();
        } else {
            user = await User.create({
                airtableUserId,
                email,
                accessToken: access_token,
                refreshToken: refresh_token,
                tokenExpiresAt
            });
        }

        // Set session
        req.session.userId = user._id;

        res.redirect('http://localhost:5173/dashboard');
    } catch (err) {
        console.error('OAuth Error:', err.response?.data || err.message);
        res.status(500).send('Authentication failed: ' + (err.response?.data?.error || err.message));
    }
});

router.get('/me', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/logout', (req, res) => {
    req.session = null;
    res.json({ success: true });
});

module.exports = router;
