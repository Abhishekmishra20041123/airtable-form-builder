import React from 'react';

const DynamicField = ({ field, value, onChange }) => {
    const handleChange = (e) => {
        onChange(field.questionKey, e.target.value);
    };

    const renderInput = () => {
        switch (field.type) {
            case 'singleLineText':
                return (
                    <input
                        type="text"
                        value={value || ''}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        required={field.required}
                    />
                );
            case 'multilineText':
                return (
                    <textarea
                        value={value || ''}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        rows="4"
                        required={field.required}
                    />
                );
            case 'singleSelect':
                return (
                    <select
                        value={value || ''}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        required={field.required}
                    >
                        <option value="">Select an option</option>
                        {field.options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                );
            case 'multipleSelects':
                // Simple multi-select implementation
                return (
                    <select
                        multiple
                        value={value || []}
                        onChange={(e) => {
                            const options = [...e.target.selectedOptions].map(o => o.value);
                            onChange(field.questionKey, options);
                        }}
                        className="w-full border p-2 rounded"
                        required={field.required}
                    >
                        {field.options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                );
            case 'multipleAttachments':
                // Placeholder for file upload
                return (
                    <div className="border p-4 rounded border-dashed text-center text-gray-500">
                        File upload not implemented in this demo
                    </div>
                );
            default:
                return <div className="text-red-500">Unsupported field type: {field.type}</div>;
        }
    };

    return (
        <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderInput()}
        </div>
    );
};

export default DynamicField;
