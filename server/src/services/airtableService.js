const axios = require('axios');

const getAirtableClient = (accessToken) => {
    return axios.create({
        baseURL: 'https://api.airtable.com/v0',
        headers: { Authorization: `Bearer ${accessToken}` }
    });
};

const listBases = async (accessToken) => {
    const client = getAirtableClient(accessToken);
    try {
        const response = await client.get('/meta/bases');
        return response.data.bases;
    } catch (error) {
        console.error('Error in listBases:', error.response?.data || error.message);
        throw error;
    }
};

const listTables = async (accessToken, baseId) => {
    const client = getAirtableClient(accessToken);
    const response = await client.get(`/meta/bases/${baseId}/tables`);
    return response.data.tables;
};

const createRecord = async (accessToken, baseId, tableId, fields) => {
    const client = getAirtableClient(accessToken);
    console.log('Creating Airtable record:');
    console.log('  Base ID:', baseId);
    console.log('  Table ID:', tableId);
    console.log('  Fields:', JSON.stringify(fields, null, 2));

    try {
        const response = await client.post(`/${baseId}/${tableId}`, {
            fields
        });
        console.log('Airtable record created successfully:', response.data.id);
        return response.data;
    } catch (error) {
        console.error('Airtable API Error Details:');
        console.error('  Status:', error.response?.status);
        console.error('  Error:', JSON.stringify(error.response?.data, null, 2));
        throw error;
    }
};

const getRecord = async (accessToken, baseId, tableId, recordId) => {
    const client = getAirtableClient(accessToken);
    console.log('Fetching Airtable record:');
    console.log('  Base ID:', baseId);
    console.log('  Table ID:', tableId);
    console.log('  Record ID:', recordId);

    try {
        const response = await client.get(`/${baseId}/${tableId}/${recordId}`);
        console.log('Airtable record fetched successfully:', response.data.id);
        return response.data;
    } catch (error) {
        console.error('Airtable API Error Details:');
        console.error('  Status:', error.response?.status);
        console.error('  Error:', JSON.stringify(error.response?.data, null, 2));
        throw error;
    }
};

module.exports = {
    listBases,
    listTables,
    createRecord,
    getRecord
};
