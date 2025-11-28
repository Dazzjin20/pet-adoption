const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/database'); // Import the database connection handler

// Repositories
const adopterRepository = require('./repositories/adopterRepository');
const volunteerRepository = require('./repositories/volunteerRepository');
const staffRepository = require('./repositories/staffRepository');

// Controllers
const authController = require('./services/authController');

const app = express();
app.use(cors());
app.use(express.json());

// --- API ROUTES ---

// Adopter Registration
app.post('/api/auth/register/adopter', (req, res) => authController.handleRegistration(req, res, adopterRepository));

// Volunteer Registration
app.post('/api/auth/register/volunteer', (req, res) => authController.handleRegistration(req, res, volunteerRepository));

// Staff Registration
app.post('/api/auth/register/staff', (req, res) => authController.handleRegistration(req, res, staffRepository));

// Universal Login
app.post('/api/auth/login', authController.handleLogin);

// Password Reset Routes
app.post('/api/auth/forgot-password', authController.handleForgotPassword);
app.post('/api/auth/reset-password', authController.handleResetPassword);

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