// Only load dotenv in local development (not on Render)
const isLocal = !process.env.RENDER && !process.env.PORT;
if (isLocal) {
    require('dotenv').config();
    console.log('🔧 Running in LOCAL mode - dotenv loaded');
} else {
    console.log('🚀 Running in PRODUCTION mode - using Render env vars');
}

// Debug: Log critical environment variables
console.log('='.repeat(60));
console.log('🚀 AIRTABLE FORM BUILDER SERVER STARTING');
console.log('='.repeat(60));
console.log('Environment Check:');
console.log('- AIRTABLE_REDIRECT_URI:', process.env.AIRTABLE_REDIRECT_URI || '❌ NOT SET');
console.log('- FRONTEND_URL:', process.env.FRONTEND_URL || '❌ NOT SET');
console.log('- RENDER:', process.env.RENDER || '❌ NOT SET');
console.log('- PORT:', process.env.PORT || '❌ NOT SET');
console.log('='.repeat(60));

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieSession = require('cookie-session');

const app = express();

// Trust proxy (required for Render/Heroku/etc)
app.set('trust proxy', 1);

// Middleware
// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true
}));
app.use(express.json());
app.use(cookieSession({
    name: 'session',
    keys: [process.env.COOKIE_KEY || 'secret'],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Database Connection
const connectDB = require('./config/db');
connectDB();

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/api/airtable', require('./routes/airtable'));
app.use('/api/forms', require('./routes/forms'));
app.use('/api/responses', require('./routes/responses'));
app.use('/webhooks', require('./routes/webhooks'));

app.get('/', (req, res) => {
    res.send('Airtable Form Builder API');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
