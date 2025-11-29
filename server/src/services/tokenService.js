const axios = require('axios');

const refreshAccessToken = async (user) => {
    try {
        const encodedCredentials = Buffer.from(`${process.env.AIRTABLE_CLIENT_ID}:${process.env.AIRTABLE_CLIENT_SECRET}`).toString('base64');

        const response = await axios.post('https://airtable.com/oauth2/v1/token', new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: user.refreshToken
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${encodedCredentials}`
            }
        });

        const { access_token, refresh_token, expires_in } = response.data;

        user.accessToken = access_token;
        user.refreshToken = refresh_token; // Airtable rotates refresh tokens
        user.tokenExpiresAt = new Date(Date.now() + expires_in * 1000);
        await user.save();

        console.log('Token refreshed successfully for user:', user._id);

        return access_token;
    } catch (error) {
        console.error('Error refreshing token:', error.response?.data || error.message);
        throw error;
    }
};

module.exports = { refreshAccessToken };
