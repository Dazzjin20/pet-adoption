
const { Staff } = require('../models');
const Application = require('../models/application.Schema');
const Task = require('../models/taskModel');

class StaffRepository {
    async create(staffData) {
        try {
            const staff = new Staff({
                email: staffData.email,
                password: staffData.password,
                first_name: staffData.first_name,
                last_name: staffData.last_name,
                phone: staffData.phone,
                role: staffData.role || 'staff',
                consents: this.buildConsents(staffData.consents || [])
            });

            return await staff.save();
        } catch (error) {
            throw new Error(`Failed to create staff: ${error.message}`);
        }
    }

    async findByEmail(email) {
        try {
            return await Staff.findOne({ email: email.toLowerCase() });
        } catch (error) {
            throw new Error(`Failed to find staff by email: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            return await Staff.findById(id);
        } catch (error) {
            throw new Error(`Failed to find staff by ID: ${error.message}`);
        }
    }

    async updateById(id, updateData) {
        try {
            const updateFields = {};
            
            // Map frontend field names to backend field names
            if (updateData.firstName) updateFields.first_name = updateData.firstName;
            if (updateData.middleName) updateFields.middle_name = updateData.middleName;
            if (updateData.lastName) updateFields.last_name = updateData.lastName;
            if (updateData.phone) updateFields.phone = updateData.phone;
            if (updateData.address) updateFields.address = updateData.address;
            if (updateData.bio) updateFields.bio = updateData.bio;
            if (updateData.profile_image) updateFields.profile_image = updateData.profile_image;

            return await Staff.findByIdAndUpdate(id, updateFields, { new: true });
        } catch (error) {
            throw new Error(`Failed to update staff: ${error.message}`);
        }
    }

    async getStaffStats(staffId) {
        try {
            const stats = {
                animalsHelped: 0,
                adoptionsApproved: 0,
                serviceDuration: 0
            };

            // Get count of approved applications (adoptions)
            const adoptions = await Application.countDocuments({ 
                status: 'approved',
                reviewed_by: staffId 
            });
            stats.adoptionsApproved = adoptions;

            // Get count of tasks assigned (animals helped/cared for)
            const tasks = await Task.countDocuments({ 
                created_by: staffId,
                status: { $in: ['Completed', 'In Progress'] }
            });
            stats.animalsHelped = tasks;

            // Get service duration in days
            const staff = await Staff.findById(staffId);
            if (staff && staff.createdAt) {
                const createdDate = new Date(staff.createdAt);
                const now = new Date();
                const daysOfService = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
                stats.serviceDuration = daysOfService;
            }

            return stats;
        } catch (error) {
            throw new Error(`Failed to get staff stats: ${error.message}`);
        }
    }

    buildConsents(consentTypes) {
        const consentMap = {
            agreed_terms: 'Terms of Service and Privacy Policy',
            consents_background_check: 'Background Check',
            wants_updates: 'Receive Updates'
        };

        return consentTypes.map(consentType => ({
            consent_type: consentMap[consentType] || consentType,
            consented: true,
            consented_at: new Date()
        }));
    }
}

module.exports = new StaffRepository();