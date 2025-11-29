require('dotenv').config();
console.log('MONGO_URI:', process.env.MONGO_URI);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieSession = require('cookie-session');

const app = express();

// Trust proxy (required for Render/Heroku/etc)
app.set('trust proxy', 1);

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Frontend URL
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
