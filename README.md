# Airtable-Connected Dynamic Form Builder

A full-stack MERN application that allows users to create dynamic forms based on Airtable schemas, supports conditional logic, and syncs responses between Airtable and MongoDB.

## Features

- **Airtable OAuth Login**: Secure authentication using Airtable.
- **Form Builder**: Create forms by selecting fields from your Airtable bases.
- **Conditional Logic**: Show/hide questions based on previous answers (Equals, Not Equals, Contains).
- **Public Form Viewer**: Shareable links for users to fill out forms.
- **Data Sync**: Responses are saved to both Airtable and MongoDB.
- **Webhooks**: Real-time sync from Airtable to MongoDB (updates/deletes).

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS (via CDN/Vanilla styles)
- **Backend**: Node.js, Express, MongoDB
- **Database**: MongoDB (local or Atlas)

## Setup Instructions

### Prerequisites

- Node.js installed
- MongoDB installed and running
- Airtable Account

### Backend Setup

1. Navigate to `server` directory:
   ```bash
   cd server
   npm install
   ```
2. Create `.env` file based on `.env.example`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/airtable-form-builder
   COOKIE_KEY=your_secret_key
   AIRTABLE_CLIENT_ID=your_airtable_client_id
   AIRTABLE_CLIENT_SECRET=your_airtable_client_secret
   AIRTABLE_REDIRECT_URI=http://localhost:5000/auth/airtable/callback
   ```
3. Start the server:
   ```bash
   npm run dev
   # or
   node src/index.js
   ```

### Frontend Setup

1. Navigate to `client` directory:
   ```bash
   cd client
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

### Airtable OAuth Setup

1. Go to [Airtable Developer Hub](https://airtable.com/create/oauth).
2. Create a new OAuth integration.
3. Set Redirect URI to `http://localhost:5000/auth/airtable/callback`.
4. Add the following scopes:
   - `data.records:read`
   - `data.records:write`
   - `schema.bases:read`
   - `webhook:manage`
5. Copy Client ID and Client Secret to your `.env` file.

### Webhook Configuration

To enable real-time sync, you need to register a webhook for your base.
(Note: The current implementation handles webhook events but registration needs to be done via API or script, which is not included in the UI).

## Data Model

- **User**: Stores Airtable tokens.
- **Form**: Stores form schema and conditional logic.
- **Response**: Stores submission data and Airtable Record ID.

## Conditional Logic

The logic engine supports `AND` / `OR` groups with operators:
- `equals`
- `notEquals`
- `contains`

Logic is evaluated in real-time on the frontend and validated on the backend.

## Deployment

### Backend Deployment (Render/Railway)

1. **Create a new web service** on Render or Railway
2. **Connect your GitHub repository**
3. **Set environment variables**:
   - `PORT` (usually auto-set by platform)
   - `MONGO_URI` (MongoDB Atlas connection string)
   - `COOKIE_KEY` (random secret key)
   - `AIRTABLE_CLIENT_ID`
   - `AIRTABLE_CLIENT_SECRET`
   - `AIRTABLE_REDIRECT_URI` (your deployed backend URL + `/auth/airtable/callback`)
4. **Build command**: `npm install`
5. **Start command**: `npm start` or `node src/index.js`

### Frontend Deployment (Vercel/Netlify)

1. **Create a new project** on Vercel or Netlify
2. **Connect your GitHub repository**
3. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Root directory: `client`
4. **Update backend URL**: After backend is deployed, update API URLs in frontend code to point to your deployed backend

### Post-Deployment

1. **Update Airtable OAuth settings**:
   - Add your deployed backend URL to redirect URIs
2. **Test the application**:
   - Login with Airtable
   - Create a form
   - Submit responses
   - Verify webhook sync (requires webhook registration via Airtable API)

## Project Structure

```
airtable-form-builder/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # Auth context
│   │   └── utils/         # Logic engine
│   └── package.json
├── server/                # Express backend
│   ├── src/
│   │   ├── config/       # Database config
│   │   ├── models/       # MongoDB models
│   │   ├── routes/       # API routes
│   │   ├── services/     # External services
│   │   └── utils/        # Utility functions
│   └── package.json
└── README.md
```
