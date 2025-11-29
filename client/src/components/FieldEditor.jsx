import React from 'react';

const FieldEditor = ({ field, allFields = [], onChange }) => {
    const handleChange = (key, value) => {
        onChange({ ...field, [key]: value });
    };

    return (
        <div className="border p-4 mb-4 rounded bg-gray-50">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{field.name}</h3>
                <span className="text-sm text-gray-500">{field.type}</span>
            </div>

            <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">Label</label>
                <input
                    type="text"
                    value={field.label || field.name}
                    onChange={(e) => handleChange('label', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
            </div>

            <div className="flex items-center mb-2">
                <input
                    type="checkbox"
                    checked={field.required || false}
                    onChange={(e) => handleChange('required', e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Required</label>
            </div>

            {/* Conditional Logic Config */}
            <div className="mt-4 border-t pt-2">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Conditional Logic</span>
                    <button
                        onClick={() => {
                            const currentRules = field.conditionalRules || { logic: 'AND', conditions: [] };
                            handleChange('conditionalRules', {
                                ...currentRules,
                                conditions: [...currentRules.conditions, { questionKey: '', operator: 'equals', value: '' }]
                            });
                        }}
                        className="text-blue-600 text-xs hover:underline"
                    >
                        + Add Condition
                    </button>
                </div>

                {field.conditionalRules?.conditions?.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-500">Match</span>
                            <select
                                value={field.conditionalRules.logic}
                                onChange={(e) => handleChange('conditionalRules', { ...field.conditionalRules, logic: e.target.value })}
                                className="text-xs border rounded p-1"
                            >
                                <option value="AND">All</option>
                                <option value="OR">Any</option>
                            </select>
                            <span className="text-xs text-gray-500">of the following:</span>
                        </div>

                        {field.conditionalRules.conditions.map((condition, index) => (
                            <div key={index} className="flex gap-2 items-center">
                                <select
                                    value={condition.questionKey}
                                    onChange={(e) => {
                                        const newConditions = [...field.conditionalRules.conditions];
                                        newConditions[index].questionKey = e.target.value;
                                        handleChange('conditionalRules', { ...field.conditionalRules, conditions: newConditions });
                                    }}
                                    className="w-1/3 text-xs border rounded p-1"
                                >
                                    <option value="">Select Field</option>
                                    {allFields
                                        .filter(f => f.questionKey !== field.questionKey)
                                        .map(f => (
                                            <option key={f.questionKey} value={f.questionKey}>
                                                {f.label || f.name}
                                            </option>
                                        ))
                                    }
                                </select>
                                <select
                                    value={condition.operator}
                                    onChange={(e) => {
                                        const newConditions = [...field.conditionalRules.conditions];
                                        newConditions[index].operator = e.target.value;
                                        handleChange('conditionalRules', { ...field.conditionalRules, conditions: newConditions });
                                    }}
                                    className="w-1/4 text-xs border rounded p-1"
                                >
                                    <option value="equals">Equals</option>
                                    <option value="notEquals">Not Equals</option>
                                    <option value="contains">Contains</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Value"
                                    value={condition.value}
                                    onChange={(e) => {
                                        const newConditions = [...field.conditionalRules.conditions];
                                        newConditions[index].value = e.target.value;
                                        handleChange('conditionalRules', { ...field.conditionalRules, conditions: newConditions });
                                    }}
                                    className="w-1/3 text-xs border rounded p-1"
                                />
                                <button
                                    onClick={() => {
                                        const newConditions = field.conditionalRules.conditions.filter((_, i) => i !== index);
                                        handleChange('conditionalRules', { ...field.conditionalRules, conditions: newConditions });
                                    }}
                                    className="text-red-500 text-xs hover:text-red-700"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FieldEditor;
