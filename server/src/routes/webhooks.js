const express = require('express');
const router = express.Router();
const Response = require('../models/Response');
const Form = require('../models/Form');
const airtableService = require('../services/airtableService');

// Endpoint for Airtable webhooks
// Note: In a real app, you'd verify the webhook signature
router.post('/airtable', async (req, res) => {
    try {
        const { payloads, base } = req.body;

        if (!payloads) {
            return res.status(200).send('No payload');
        }

        for (const payload of payloads) {
            if (payload.changedTablesById) {
                for (const tableId in payload.changedTablesById) {
                    const changes = payload.changedTablesById[tableId];

                    // Handle Updates
                    if (changes.changedRecordsById) {
                        for (const recordId in changes.changedRecordsById) {
                            // Find response in DB
                            const response = await Response.findOne({ airtableRecordId: recordId });
                            if (response) {
                                // Fetch latest data from Airtable to sync
                                const form = await Form.findById(response.formId).populate('owner');
                                if (form) {
                                    try {
                                        // Fetch record from Airtable
                                        const record = await airtableService.getRecord(
                                            form.owner.accessToken,
                                            form.airtableBaseId,
                                            form.airtableTableId,
                                            recordId
                                        );

                                        // Map Airtable fields back to form question keys
                                        const updatedAnswers = {};
                                        form.questions.forEach(q => {
                                            if (record.fields[q.airtableFieldId] !== undefined) {
                                                updatedAnswers[q.questionKey] = record.fields[q.airtableFieldId];
                                            }
                                        });

                                        // Update response in MongoDB
                                        response.answers = updatedAnswers;
                                        response.updatedAt = new Date();
                                        await response.save();

                                        console.log(`Record ${recordId} synced successfully from Airtable.`);
                                    } catch (syncError) {
                                        console.error(`Failed to sync record ${recordId}:`, syncError.message);
                                    }
                                }
                            }
                        }
                    }

                    // Handle Deletions
                    if (changes.destroyedRecordIds) {
                        for (const recordId of changes.destroyedRecordIds) {
                            await Response.findOneAndUpdate(
                                { airtableRecordId: recordId },
                                { deletedInAirtable: true }
                            );
                            console.log(`Record ${recordId} marked as deleted.`);
                        }
                    }
                }
            }
        }

        res.status(200).send('OK');
    } catch (err) {
        console.error('Webhook Error:', err);
        res.status(500).send('Error processing webhook');
    }
});

module.exports = router;
