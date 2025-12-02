const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/database'); // Import the database connection handler
const adopterRepository = require('./repositories/adopterRepository');
const volunteerRepository = require('./repositories/volunteerRepository');
const staffRepository = require('./repositories/staffRepository');

const app = express();
app.use(cors());
app.use(express.json());

// Generic registration handler to reduce code duplication
async function handleRegistration(req, res, repository) {
  try {
    const { email } = req.body;
    const existingUser = await repository.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }
    // Note: In a real app, you should hash the password here before saving.
    // const hashedPassword = await bcrypt.hash(req.body.password, 10);
    // const user = await repository.create({ ...req.body, password: hashedPassword });
    const user = await repository.create(req.body);
    // Avoid sending password back to client
    user.password = undefined;
    return res.status(201).json({ message: 'Registration successful!', user });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'An error occurred during registration.', error: err.message });
  }
}

// --- API ROUTES ---

// Adopter Registration
app.post('/api/auth/register/adopter', (req, res) => {
  handleRegistration(req, res, adopterRepository);
});

// Volunteer Registration
app.post('/api/auth/register/volunteer', (req, res) => {
  handleRegistration(req, res, volunteerRepository);
});

// Staff Registration
app.post('/api/auth/register/staff', (req, res) => {
  handleRegistration(req, res, staffRepository);
});

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