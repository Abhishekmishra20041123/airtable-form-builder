import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ResponseList = () => {
    const { formId } = useParams();
    const [responses, setResponses] = useState([]);
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [formId]);

    const fetchData = async () => {
        try {
            const [formRes, responsesRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/forms/${formId}`, { withCredentials: true }),
                axios.get(`http://localhost:5000/api/responses/${formId}`, { withCredentials: true })
            ]);
            setForm(formRes.data);
            setResponses(responsesRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!form) return <div className="p-8">Form not found</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">{form.title} - Responses</h1>

            <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Submitted At
                            </th>
                            {form.questions.map(q => (
                                <th key={q.questionKey} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {q.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {responses.map(response => (
                            <tr key={response._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(response.createdAt).toLocaleString()}
                                </td>
                                {form.questions.map(q => (
                                    <td key={q.questionKey} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {JSON.stringify(response.answers[q.questionKey])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ResponseList;
