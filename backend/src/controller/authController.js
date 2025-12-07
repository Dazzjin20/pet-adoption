const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adopterRepository = require('../repositories/adopterRepository');
const volunteerRepository = require('../repositories/volunteerRepository');
const staffRepository = require('../repositories/staffRepository');

const SALT_ROUNDS = 10;

async function handleRegistration(req, res, repository) {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await repository.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await repository.create({ ...req.body, password: hashedPassword });

    // IMPORTANT: Do not send the password back to the client
    user.password = undefined;

    return res.status(201).json({ message: 'Registration successful!', user });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'An error occurred during registration.', error: err.message });
  }
}


async function handleLogin(req, res, repository, role) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await repository.findByEmail(email);

    // Securely compare the provided password with the stored hash
    // First, check if a user was found, then securely compare the password.
    const isMatch = user && await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // Use a generic error message for security to avoid revealing which part (email/password) was wrong.
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Do not send the password to the client
    user.password = undefined;

    // Create a JWT payload
    const payload = {
      id: user._id, // or user.id depending on your DB schema
      role: user.role,
    };

    // Sign the token
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_default_secret_key', { expiresIn: '1h' });

    return res.status(200).json({ message: 'Login successful!', user, token });
  } catch (err) {
    console.error(`${role} Login error:`, err);
    return res.status(500).json({ message: 'An error occurred during login.', error: err.message });
  }
}

// Exported Controller Functions

// Registration Controllers
exports.registerAdopter = (req, res) => handleRegistration(req, res, adopterRepository);
exports.registerVolunteer = (req, res) => handleRegistration(req, res, volunteerRepository);
exports.registerStaff = (req, res) => handleRegistration(req, res, staffRepository);

// Login Controllers
exports.loginAdopter = (req, res) => handleLogin(req, res, adopterRepository, 'adopter');
exports.loginVolunteer = (req, res) => handleLogin(req, res, volunteerRepository, 'volunteer');
exports.loginStaff = (req, res) => handleLogin(req, res, staffRepository, 'staff');

// Profile Controller (Placeholder)
exports.getProfile = async (req, res) => {
  try {
    const { userType, userId } = req.params;
    let repository;

    if (userType === 'adopter') repository = adopterRepository;
    else if (userType === 'volunteer') repository = volunteerRepository;
    else if (userType === 'staff') repository = staffRepository;
    else return res.status(400).json({ message: 'Invalid user type.' });

    const user = await repository.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.password = undefined; // Ensure password is not sent
    res.status(200).json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to retrieve profile.', error: error.message });
  }
};