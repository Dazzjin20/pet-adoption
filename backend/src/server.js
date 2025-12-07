const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/database'); // Import the database connection handler
const petRoutes = require('./routes/petRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const authRoutes = require('./routes/authRoutes'); // Import auth routes

const app = express();
app.use(cors());
// Accept larger JSON payloads for base64 image uploads
app.use(express.json({ limit: '12mb' }));
// Also support URL-encoded form bodies at larger size
app.use(express.urlencoded({ limit: '12mb', extended: true }));

// --- API ROUTES ---

// Mount auth routes under the /api/auth prefix
app.use('/api/auth', authRoutes);

// Mount pet routes
app.use('/api/pets', petRoutes);

// Mount application routes
app.use('/api/applications', applicationRoutes);

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await db.connect(); // Use your database class to connect
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();