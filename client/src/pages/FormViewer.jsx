import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import DynamicField from '../components/DynamicField';
import { shouldShowQuestion } from '../utils/logicEngine';

const FormViewer = () => {
    const { id } = useParams();
    const [form, setForm] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        fetchForm();
    }, [id]);

    const fetchForm = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/forms/${id}`);
            setForm(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionKey, value) => {
        setAnswers(prev => ({ ...prev, [questionKey]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`http://localhost:5000/api/responses/${id}`, { answers });
            setSubmitted(true);
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.error || 'Failed to submit form';
            alert(errorMessage);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading form...</div>;
    if (!form) return <div className="p-8 text-center text-red-500">Form not found</div>;
    if (submitted) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <h1 className="text-2xl font-bold text-green-600 mb-4">Thank You!</h1>
                <p>Your response has been recorded.</p>
            </div>
        </div>
    );

    const visibleQuestions = form.questions.filter(q => shouldShowQuestion(q.conditionalRules, answers));

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-2">{form.title}</h1>
                <div className="h-1 w-20 bg-blue-600 mb-8"></div>

                <form onSubmit={handleSubmit}>
                    {visibleQuestions.map(question => (
                        <DynamicField
                            key={question.questionKey}
                            field={question}
                            value={answers[question.questionKey]}
                            onChange={handleAnswerChange}
                        />
                    ))}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 font-semibold transition duration-200"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FormViewer;
