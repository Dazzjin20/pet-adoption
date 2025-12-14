const { Volunteer } = require('../models/index');
const volunteerRepository = require('../repositories/volunteerRepository');

// @desc    Get available volunteers based on current time
// @route   GET /api/volunteers/available
const getAvailableVolunteers = async (req, res) => {
    try {
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
        const hour = now.getHours(); // 0-23

        let availabilityQuery = ['anytime'];

        // Check for weekdays (Monday-Friday)
        if (dayOfWeek >= 1 && dayOfWeek <= 5) availabilityQuery.push('weekdays');
        // Check for weekends (Saturday-Sunday)
        else availabilityQuery.push('weekends');

        // Check for nights (e.g., 6 PM to 6 AM)
        if (hour >= 18 || hour < 6) availabilityQuery.push('nights');

        const availableVolunteers = await Volunteer.find({
            availability: { $in: availabilityQuery }
        });
        res.status(200).json(availableVolunteers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching available volunteers', error: error.message });
    }
};

/**
 * Updates a volunteer's profile information.
 */
const updateProfile = async (req, res) => {
    try {
        const { volunteerId } = req.params;
        const updateData = req.body;

        // Ensure the user is not trying to change their role
        if (updateData.role) {
            delete updateData.role;
        }

        const updatedVolunteer = await volunteerRepository.updateById(volunteerId, updateData);

        if (!updatedVolunteer) {
            return res.status(404).json({ message: 'Volunteer not found.' });
        }

        // Send back the updated user object, excluding the password
        updatedVolunteer.password = undefined;
        res.status(200).json({ message: 'Profile updated successfully!', user: updatedVolunteer });
    } catch (error) {
        console.error('Error updating volunteer profile:', error);
        res.status(500).json({ message: 'Failed to update profile.', error: error.message });
    }
};

module.exports = { getAvailableVolunteers, updateProfile };