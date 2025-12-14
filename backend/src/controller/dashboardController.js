const { ApplicationRepository } = require('../repositories/applicationRepository');
const mongoose = require('mongoose');
const { Volunteer } = require('../models/index');
const { Pet } = require('../models/base/infoPetSchema'); // Correctly import the Pet model
const Application = require('../models/application.Schema');
const MedicalRecord = require('../models/medicalRecordModel');

const applicationRepository = new ApplicationRepository();

/**
 * Gathers and returns statistics for the adopter dashboard.
 */
exports.getAdopterDashboardStats = async (req, res) => {
    try {
        const { adopterId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(adopterId)) {
            return res.status(400).json({ message: 'Invalid Adopter ID.' });
        }

        // Use the existing repository to find all applications for the adopter
        const applications = await applicationRepository.findAllForAdopter(adopterId);

        const stats = {
            totalApplications: applications.length,
            approved: 0,
            adopted: 0,
        };

        // Calculate counts from the fetched applications
        applications.forEach(app => {
            if (app.status === 'Approved') {
                stats.approved++;
            }
            if (app.status === 'Adopted') {
                stats.adopted++;
            }
        });

        // For the activity feed, we can send the 5 most recent applications
        const recentActivities = applications
            .slice(0, 5) // Get the 5 most recent since the query is already sorted
            .map(app => ({
                action: `Applied for ${app.pet_name}`,
                status: app.status,
                timestamp: app.date_submitted,
            }));

        res.status(200).json({ stats, recentActivities });

    } catch (error) {
        console.error('Error fetching adopter dashboard stats:', error);
        res.status(500).json({ message: 'Failed to get dashboard stats.', error: error.message });
    }
};

/**
 * Gathers and returns statistics and recent activities for the staff dashboard.
 */
exports.getStaffDashboardStats = async (req, res) => {
    try {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        // --- STATS ---
        const totalPets = await Pet.countDocuments();
        const dogsInCare = await Pet.countDocuments({ pet_type: 'dog', status: { $ne: 'Adopted' } });
        const catsInCare = await Pet.countDocuments({ pet_type: 'cat', status: { $ne: 'Adopted' } });
        const activeVolunteers = await Volunteer.countDocuments({ status: 'active' });
        const adoptionsThisMonth = await Application.countDocuments({
            status: 'Adopted',
            last_update: { $gte: oneMonthAgo }
        });
        const urgentCare = await Pet.countDocuments({ status: 'medical' });

        // --- RECENT ACTIVITIES (ALERTS) ---
        const recentApplications = await Application.find()
            .sort({ date_submitted: -1 })
            .limit(3)
            .populate('pet', 'pet_name')
            .populate('adopter', 'first_name last_name');

        const recentMedicalRecords = await MedicalRecord.find()
            .sort({ date: -1 })
            .limit(2)
            .populate('pet_id', 'pet_name');

        let recentActivities = [];

        recentApplications.forEach(app => {
            // Defensive check: Ensure adopter and pet are not null
            const adopterName = app.adopter ? `${app.adopter.first_name} ${app.adopter.last_name}`.trim() : 'an unknown adopter';
            const petName = app.pet ? app.pet.pet_name : 'an unknown pet';

            recentActivities.push({
                type: 'new_application',
                message: `New application from ${adopterName} for ${petName}`,
                date: app.date_submitted
            });
        });

        recentMedicalRecords.forEach(rec => {
            // Defensive check for pet
            const petName = rec.pet_id ? rec.pet_id.pet_name : 'an unknown pet';
            recentActivities.push({
                type: 'medical_record',
                message: `${rec.description || 'Medical record'} added for ${petname}`,
                message: `${rec.description || 'Medical record'} added for ${petName}`,
                date: rec.date
            });
        });

        // Sort all activities together by date
        recentActivities.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json({
            stats: { totalPets, dogsInCare, catsInCare, activeVolunteers, adoptionsThisMonth, urgentCare },
            recentActivities: recentActivities.slice(0, 5) // Return top 5 overall
        });

    } catch (error) {
        console.error('Error fetching staff dashboard stats:', error);
        res.status(500).json({ message: 'Failed to get staff dashboard stats.', error: error.message });
    }
};