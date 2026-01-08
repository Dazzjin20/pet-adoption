const volunteerRepository = require('../repositories/volunteerRepository');

const volunteerController = {};

/**
 * Retrieves all volunteers.
 */
volunteerController.getAll = async (req, res) => {
    try {
        const volunteers = await volunteerRepository.findAll();
        res.status(200).json({ data: volunteers });
    } catch (error) {
        console.error('Error fetching volunteers:', error);
        res.status(500).json({ message: 'Failed to fetch volunteers.', error: error.message });
    }
};

/**
 * Updates a volunteer's profile information.
 */
volunteerController.updateProfile = async (req, res) => {
    try {
        const { volunteerId } = req.params;
        const updateData = req.body;

        const updatedVolunteer = await volunteerRepository.updateById(volunteerId, updateData);

        if (!updatedVolunteer) {
            return res.status(404).json({ message: 'Volunteer not found.' });
        }

        res.status(200).json({ message: 'Profile updated successfully!', user: updatedVolunteer });
    } catch (error) {
        console.error('Error updating volunteer profile:', error);
        res.status(500).json({ message: 'Failed to update profile.', error: error.message });
    }
};

module.exports = volunteerController;