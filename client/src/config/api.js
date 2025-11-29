// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
    // Auth
    LOGIN: `${API_BASE_URL}/auth/airtable`,
    ME: `${API_BASE_URL}/auth/me`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,

    // Airtable
    BASES: `${API_BASE_URL}/api/airtable/bases`,
    TABLES: (baseId) => `${API_BASE_URL}/api/airtable/bases/${baseId}/tables`,

    // Forms
    FORMS: `${API_BASE_URL}/api/forms`,
    FORM: (id) => `${API_BASE_URL}/api/forms/${id}`,

    // Responses
    RESPONSES: (formId) => `${API_BASE_URL}/api/responses/${formId}`,
    SUBMIT: (formId) => `${API_BASE_URL}/api/responses/${formId}`,
};

export default API_BASE_URL;
