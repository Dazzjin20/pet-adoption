const { Volunteer } = require('../models');

class VolunteerRepository {
    async create(volunteerData) {
        try {
            const volunteer = new Volunteer({
                email: volunteerData.email,
                password: volunteerData.password,
                first_name: volunteerData.first_name,
                last_name: volunteerData.last_name,
                phone: volunteerData.phone,
                availability: volunteerData.availability || [],
                activities: volunteerData.interested_activities || [],
                consents: this.buildConsents(volunteerData.consents || []),
                role: volunteerData.role || 'volunteer'
            });

            return await volunteer.save();
        } catch (error) {   
            throw new Error(`Failed to create volunteer: ${error.message}`);
        }
    }

    async findByEmail(email) {
        try {
            return await Volunteer.findOne({ email: email.toLowerCase() });
        } catch (error) {
            throw new Error(`Failed to find volunteer by email: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            return await Volunteer.findById(id);
        } catch (error) {
            throw new Error(`Failed to find volunteer by ID: ${error.message}`);
        }
    }

    async updateById(id, updateData) {
        try {
            // Hanapin at i-update ang volunteer, at ibalik ang bagong document
            console.log(`Updating volunteer ${id} in MongoDB...`);
            const volunteer = await Volunteer.findByIdAndUpdate(id, { $set: updateData }, { new: true });
            if (volunteer) volunteer.password = undefined; // Huwag ibalik ang password
            return volunteer;
        } catch (error) {
            throw new Error(`Failed to update volunteer by ID: ${error.message}`);
        }
    }

    buildConsents(consentTypes) {
        const consentMap = {
            agreed_terms: 'Terms of Service and Privacy Policy',
            consent_background_check: 'Background Check',
            wants_updates: 'Receive Updates'
        };

        return consentTypes.map(consentType => ({
            consent_type: consentMap[consentType] || consentType,
            consented: true,
            consented_at: new Date()
        }));
    }

    async findAll() {
        try {
            // Kunin ang lahat ng volunteers na hindi 'inactive' para makita ang active at pending.
            return await Volunteer.find({ status: { $in: ['active', 'pending'] } }).select('-password -consents');
        } catch (error) {
            throw new Error(`Failed to find all volunteers: ${error.message}`);
        }
    }
}

module.exports = new VolunteerRepository();