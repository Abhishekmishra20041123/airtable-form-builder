import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Login = () => {
    const { user, login } = useAuth();

    if (user) {
        return <Navigate to="/dashboard" />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
                <h1 className="text-2xl font-bold mb-6">Airtable Form Builder</h1>
                <p className="mb-6 text-gray-600">Login to create and manage your forms</p>
                <button
                    onClick={login}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
                >
                    Login with Airtable
                </button>
            </div>
        </div>
    );
};

export default Login;
