const volunteerRepository = require('../repositories/volunteerRepository');

class VolunteerController {
    async getAll(req, res) {
        try {
            const volunteers = await volunteerRepository.findAll();
            res.status(200).json({
                message: 'Volunteers retrieved successfully',
                data: volunteers
            });
        } catch (error) {
            console.error('Error getting all volunteers:', error);
            res.status(500).json({ message: 'Failed to retrieve volunteers.', error: error.message });
        }
    }

    async updateProfile(req, res) {
        try {
            const { volunteerId } = req.params;
            const updatedData = req.body;
            const updatedVolunteer = await volunteerRepository.updateById(volunteerId, updatedData);
            if (!updatedVolunteer) {
                return res.status(404).json({ message: 'Volunteer not found' });
            }
            res.status(200).json({ message: 'Profile updated successfully', user: updatedVolunteer });
        } catch (error) {
            res.status(500).json({ message: 'Failed to update profile', error: error.message });
        }
    }
}

module.exports = new VolunteerController();