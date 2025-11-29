const mongoose = require('mongoose');

const ConditionSchema = new mongoose.Schema({
    questionKey: String,
    operator: { type: String, enum: ['equals', 'notEquals', 'contains'] },
    value: mongoose.Schema.Types.Mixed
});

const ConditionalRulesSchema = new mongoose.Schema({
    logic: { type: String, enum: ['AND', 'OR'] },
    conditions: [ConditionSchema]
});

const QuestionSchema = new mongoose.Schema({
    questionKey: { type: String, required: true },
    airtableFieldId: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, required: true }, // shortText, longText, singleSelect, multiSelect, attachment
    required: { type: Boolean, default: false },
    options: [String], // For select fields
    conditionalRules: ConditionalRulesSchema
});

const FormSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    airtableBaseId: { type: String, required: true },
    airtableTableId: { type: String, required: true },
    title: { type: String, default: 'Untitled Form' },
    questions: [QuestionSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Form', FormSchema);
