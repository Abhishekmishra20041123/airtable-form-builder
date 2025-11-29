const express = require('express');
const router = express.Router();
const Form = require('../models/Form');
const Response = require('../models/Response');
const User = require('../models/User');
const airtableService = require('../services/airtableService');
const { shouldShowQuestion } = require('../utils/logicEngine');

// Submit a response
router.post('/:formId', async (req, res) => {
    try {
        console.log('=== Form Submission Started ===');
        const { formId } = req.params;
        const { answers } = req.body;
        console.log('Form ID:', formId);
        console.log('Answers:', JSON.stringify(answers, null, 2));

        const form = await Form.findById(formId).populate('owner');
        if (!form) {
            console.log('ERROR: Form not found');
            return res.status(404).json({ error: 'Form not found' });
        }
        console.log('Form found:', form.title);

        // Validate required fields (only if they're visible based on conditional logic)
        for (const question of form.questions) {
            const isVisible = shouldShowQuestion(question.conditionalRules, answers);
            if (question.required && isVisible && !answers[question.questionKey]) {
                console.log('ERROR: Missing required field:', question.label);
                return res.status(400).json({ error: `Missing required field: ${question.label}` });
            }
        }
        console.log('Validation passed');

        // Prepare fields for Airtable
        const airtableFields = {};
        form.questions.forEach(q => {
            if (answers[q.questionKey]) {
                airtableFields[q.airtableFieldId] = answers[q.questionKey];
            }
        });
        console.log('Airtable fields:', JSON.stringify(airtableFields, null, 2));

        // Save to Airtable
        const owner = form.owner;
        console.log('Owner access token present:', !!owner.accessToken);

        // Check for token expiration (buffer 5 minutes)
        const { refreshAccessToken } = require('../services/tokenService');
        if (owner.tokenExpiresAt && new Date() > new Date(owner.tokenExpiresAt.getTime() - 5 * 60 * 1000)) {
            console.log('Token expired or expiring soon, refreshing...');
            try {
                await refreshAccessToken(owner);
            } catch (refreshErr) {
                console.error('Failed to refresh token:', refreshErr);
                return res.status(401).json({ error: 'Authentication session expired. Please login again.' });
            }
        }

        let airtableRecord;
        try {
            airtableRecord = await airtableService.createRecord(owner.accessToken, form.airtableBaseId, form.airtableTableId, airtableFields);
            console.log('Airtable record created:', airtableRecord.id);
        } catch (airtableErr) {
            console.error('Airtable Error:', airtableErr.response?.data || airtableErr.message);
            const details = airtableErr.response?.data || airtableErr.message;
            return res.status(500).json({ error: 'Failed to save to Airtable', details });
        }

        // Save to MongoDB
        const response = await Response.create({
            formId,
            airtableRecordId: airtableRecord.id,
            answers
        });
        console.log('MongoDB response created:', response._id);
        console.log('=== Form Submission Completed ===');

        res.status(201).json(response);
    } catch (err) {
        console.error('SUBMISSION ERROR:', err);
        const errorDetails = err.response?.data || err.message;
        res.status(500).json({ error: JSON.stringify(errorDetails) });
    }
});

// Get responses for a form (for dashboard)
router.get('/:formId', async (req, res) => {
    // Add auth check here
    try {
        const responses = await Response.find({ formId: req.params.formId }).sort({ createdAt: -1 });
        res.json(responses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
