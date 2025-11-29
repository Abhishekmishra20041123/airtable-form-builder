import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [forms, setForms] = useState([]);

    useEffect(() => {
        fetchForms();
    }, []);

    const fetchForms = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/forms', { withCredentials: true });
            setForms(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <div className="flex items-center gap-4">
                    <span>Welcome, {user?.name || user?.email}</span>
                    <button
                        onClick={logout}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {forms.map(form => (
                    <div key={form._id} className="border p-6 rounded-lg shadow-sm bg-white">
                        <h2 className="text-xl font-semibold mb-4">{form.title}</h2>
                        <div className="flex flex-col gap-3">
                            <a
                                href={`/form/${form._id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center block"
                            >
                                📝 View Public Form
                            </a>
                            <Link
                                to={`/forms/${form._id}/responses`}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-center block"
                            >
                                📊 View Responses
                            </Link>
                        </div>
                    </div>
                ))}

                <div className="border p-6 rounded-lg shadow-sm bg-white flex items-center justify-center">
                    <button
                        onClick={() => window.location.href = '/forms/new'}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        + Create New Form
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
