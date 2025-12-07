const express = require('express');
const applicationController = require('../controller/applicationController');

const router = express.Router();

// Route for submitting a new application
router.post('/submit', applicationController.submitApplication);

// Route to get all applications for a specific adopter
router.get('/adopter/:adopterId', applicationController.getAdopterApplications);

// Route to get a single application by its ID
router.get('/:applicationId', applicationController.getApplicationById);

module.exports = router;