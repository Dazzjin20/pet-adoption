const express = require('express');
const authController = require('../controller/authController');
const dashboardController = require('../controller/dashboardController');
const adopterController = require('../controller/adopterController');
const volunteerController = require('../controller/volunteerController');
const staffController = require('../controller/staffController');

const router = express.Router();

// Registration routes
router.post('/register/adopter', authController.registerAdopter);
router.post('/register/volunteer', authController.registerVolunteer);
router.post('/register/staff', authController.registerStaff);

// Login routes
router.post('/login/adopter', authController.loginAdopter);
router.post('/login/volunteer', authController.loginVolunteer);
router.post('/login/staff', authController.loginStaff);

// Password Reset Routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Profile routes
router.get('/profile/:userType/:userId', authController.getProfile);

// Adopter Dashboard Route
router.get('/dashboard/adopter/:adopterId', dashboardController.getAdopterDashboardStats);

// Staff Dashboard Route
router.get('/dashboard/staff', dashboardController.getStaffDashboardStats);

// Adopter Profile Update Route
router.put('/profile/adopter/:adopterId', adopterController.updateProfile);

// Staff Profile Update Route
router.put('/profile/staff/:staffId', staffController.updateProfile);

module.exports = router;