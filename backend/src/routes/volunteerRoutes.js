const express = require('express');
const volunteerController = require('../controller/volunteerController');
// Assuming you have an auth middleware to protect routes
// const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all volunteers (e.g., for staff to view)
router.get('/', volunteerController.getAll);

// Update a volunteer's own profile
router.put('/profile/:volunteerId', volunteerController.updateProfile);

module.exports = router;