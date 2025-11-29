const express = require('express');
const router = express.Router();
const Form = require('../models/Form');
const User = require('../models/User');

const requireAuth = async (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    req.user = await User.findById(req.session.userId);
    next();
};

// Create a new form
router.post('/', requireAuth, async (req, res) => {
    try {
        const { airtableBaseId, airtableTableId, title, questions } = req.body;
        const form = await Form.create({
            owner: req.user._id,
            airtableBaseId,
            airtableTableId,
            title,
            questions
        });
        res.status(201).json(form);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all forms for the logged-in user
router.get('/', requireAuth, async (req, res) => {
    try {
        const forms = await Form.find({ owner: req.user._id }).sort({ createdAt: -1 });
        res.json(forms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single form by ID (public access for viewer, but we might want a separate route for that)
// For builder, we need auth.
router.get('/:id', async (req, res) => {
    try {
        console.log('Fetching form with ID:', req.params.id);
        const form = await Form.findById(req.params.id);
        console.log('Form found:', !!form);
        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }
        res.json(form);
    } catch (err) {
        console.error('Error fetching form:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Update a form
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const form = await Form.findOneAndUpdate(
            { _id: req.params.id, owner: req.user._id },
            req.body,
            { new: true }
        );
        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }
        res.json(form);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
