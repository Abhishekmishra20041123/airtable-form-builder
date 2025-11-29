// API Configuration v2.0 - PRODUCTION
// Updated: Using production Render backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Debug: Log the API URL being used
console.log('='.repeat(60));
console.log('🔧 API Configuration v2.0');
console.log('='.repeat(60));
console.log('- VITE_API_URL from env:', import.meta.env.VITE_API_URL);
console.log('- Final API_BASE_URL:', API_BASE_URL);
console.log('='.repeat(60));

export const API_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/auth/airtable`,
    ME: `${API_BASE_URL}/auth/me`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,

    BASES: `${API_BASE_URL}/api/airtable/bases`,
    TABLES: (baseId) => `${API_BASE_URL}/api/airtable/bases/${baseId}/tables`,

    FORMS: `${API_BASE_URL}/api/forms`,
    FORM: (id) => `${API_BASE_URL}/api/forms/${id}`,

    RESPONSES: (formId) => `${API_BASE_URL}/api/responses/${formId}`,
    SUBMIT: (formId) => `${API_BASE_URL}/api/responses/${formId}`,
};

export default API_BASE_URL;
