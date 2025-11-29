const express = require('express');
const router = express.Router();
const airtableService = require('../services/airtableService');
const User = require('../models/User');

const requireAuth = async (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    const user = await User.findById(req.session.userId);
    if (!user) {
        return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    next();
};

router.use(requireAuth);

router.get('/bases', async (req, res) => {
    try {
        const bases = await airtableService.listBases(req.user.accessToken);
        res.json(bases);
    } catch (err) {
        console.error('Error fetching bases:', err.response?.data || err.message);
        res.status(500).json({ error: 'Failed to fetch bases' });
    }
});

router.get('/bases/:baseId/tables', async (req, res) => {
    try {
        const tables = await airtableService.listTables(req.user.accessToken, req.params.baseId);
        res.json(tables);
    } catch (err) {
        console.error('Error fetching tables:', err.response?.data || err.message);
        res.status(500).json({ error: 'Failed to fetch tables' });
    }
});

module.exports = router;
