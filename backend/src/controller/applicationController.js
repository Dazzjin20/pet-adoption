const { ApplicationRepository } = require('../repositories/applicationRepository');

const applicationRepository = new ApplicationRepository();

/**
 * Handles the submission of a new adoption application.
 */
exports.submitApplication = async (req, res) => {
    try {
        // Assuming an auth middleware has added the user to the request
        // For now, we'll get it from the body for simplicity.
        const { adopter: adopterId } = req.body; // Correctly get the 'adopter' field
        if (!adopterId) { // Check if it exists
            return res.status(400).json({ message: 'Adopter ID is missing.' });
        }

        // The entire req.body is the applicationData
        const applicationData = req.body;
        const newApplication = await applicationRepository.submit(applicationData);

        res.status(201).json({ message: 'Application submitted successfully!', application: newApplication });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ message: 'Failed to submit application.', error: error.message });
    }
};

/**
 * Retrieves all applications for a specific adopter.
 */
exports.getAdopterApplications = async (req, res) => {
    try {
        const { adopterId } = req.params;
        if (!adopterId) {
            return res.status(400).json({ message: 'Adopter ID is required.' });
        }

        const applications = await applicationRepository.findAllForAdopter(adopterId);
        res.status(200).json({ applications });
    } catch (error) {
        console.error('Error fetching adopter applications:', error);
        res.status(500).json({ message: 'Failed to retrieve applications.', error: error.message });
    }
};

/**
 * Retrieves a single application by its ID.
 */
exports.getApplicationById = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const application = await applicationRepository.findById(applicationId);

        if (!application) {
            return res.status(404).json({ message: 'Application not found.' });
        }

        res.status(200).json({ application });
    } catch (error) {
        console.error('Error fetching application by ID:', error);
        res.status(500).json({ message: 'Failed to retrieve application.', error: error.message });
    }
};

/**
 * Retrieves all applications for staff view.
 */
exports.getAllApplications = async (req, res) => {
    try {
        // In the future, you can add filters here, e.g., req.query.status
        const applications = await applicationRepository.findAll();
        res.status(200).json({ applications });
    } catch (error) {
        console.error('Error fetching all applications:', error);
        res.status(500).json({ message: 'Failed to retrieve all applications.', error: error.message });
    }
};