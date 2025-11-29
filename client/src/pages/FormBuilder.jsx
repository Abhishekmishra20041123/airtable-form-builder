import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import FieldEditor from '../components/FieldEditor';

const FormBuilder = () => {
    const [bases, setBases] = useState([]);
    const [tables, setTables] = useState([]);
    const [fields, setFields] = useState([]);

    const [selectedBase, setSelectedBase] = useState('');
    const [selectedTable, setSelectedTable] = useState('');
    const [formTitle, setFormTitle] = useState('Untitled Form');
    const [selectedFields, setSelectedFields] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        fetchBases();
    }, []);

    const fetchBases = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/airtable/bases', { withCredentials: true });
            setBases(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchTables = async (baseId) => {
        setSelectedBase(baseId);
        try {
            const res = await axios.get(`http://localhost:5000/api/airtable/bases/${baseId}/tables`, { withCredentials: true });
            setTables(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleTableSelect = (tableId) => {
        setSelectedTable(tableId);
        const table = tables.find(t => t.id === tableId);
        if (table) {
            // Filter supported field types
            const supportedTypes = ['singleLineText', 'multilineText', 'singleSelect', 'multipleSelects', 'multipleAttachments'];
            const supportedFields = table.fields.filter(f => supportedTypes.includes(f.type));

            // Map to internal format
            const mappedFields = supportedFields.map(f => ({
                questionKey: f.id,
                airtableFieldId: f.id,
                label: f.name,
                name: f.name,
                type: f.type,
                required: false,
                options: f.options?.choices?.map(c => c.name) || []
            }));
            setFields(mappedFields);
        }
    };

    const toggleField = (field) => {
        if (selectedFields.find(f => f.questionKey === field.questionKey)) {
            setSelectedFields(selectedFields.filter(f => f.questionKey !== field.questionKey));
        } else {
            setSelectedFields([...selectedFields, field]);
        }
    };

    const updateFieldConfig = (updatedField) => {
        setSelectedFields(selectedFields.map(f => f.questionKey === updatedField.questionKey ? updatedField : f));
    };

    const saveForm = async () => {
        try {
            await axios.post('http://localhost:5000/api/forms', {
                airtableBaseId: selectedBase,
                airtableTableId: selectedTable,
                title: formTitle,
                questions: selectedFields
            }, { withCredentials: true });
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            alert('Failed to save form');
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Create New Form</h1>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Form Title</label>
                <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full border p-2 rounded"
                />
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Base</label>
                    <select
                        className="w-full border p-2 rounded"
                        value={selectedBase}
                        onChange={(e) => fetchTables(e.target.value)}
                    >
                        <option value="">Select a Base</option>
                        {bases.map(base => (
                            <option key={base.id} value={base.id}>{base.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Table</label>
                    <select
                        className="w-full border p-2 rounded"
                        value={selectedTable}
                        onChange={(e) => handleTableSelect(e.target.value)}
                        disabled={!selectedBase}
                    >
                        <option value="">Select a Table</option>
                        {tables.map(table => (
                            <option key={table.id} value={table.id}>{table.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedTable && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Available Fields</h2>
                        <div className="space-y-2">
                            {fields.map(field => (
                                <div
                                    key={field.questionKey}
                                    className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${selectedFields.find(f => f.questionKey === field.questionKey) ? 'bg-blue-50 border-blue-200' : ''}`}
                                    onClick={() => toggleField(field)}
                                >
                                    <div className="font-medium">{field.name}</div>
                                    <div className="text-xs text-gray-500">{field.type}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-4">Form Preview & Config</h2>
                        {selectedFields.length === 0 ? (
                            <p className="text-gray-500">Select fields to add them to the form.</p>
                        ) : (
                            <div className="space-y-4">
                                {selectedFields.map(field => (
                                    <FieldEditor
                                        key={field.questionKey}
                                        field={field}
                                        allFields={selectedFields}
                                        onChange={updateFieldConfig}
                                    />
                                ))}
                            </div>
                        )}

                        <button
                            onClick={saveForm}
                            className="mt-6 w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 font-semibold"
                            disabled={selectedFields.length === 0}
                        >
                            Save Form
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FormBuilder;
