const Application = require('../models/application.Schema');
const mongoose = require('mongoose');
const Counter = require('../models/counter.Schema'); 
const { Pet } = require('../models/base/infoPetSchema');
const { Adopter } = require('../models');

class ApplicationRepository{
    async submit(applicationData){
        const newApplicationId = await this.generateNextID();
        
        try{
            // Fetch Pet details
            const pet = await Pet.findById(applicationData.pet);
            if (!pet) {
                throw new Error('Pet not found.');
            }

            // Fetch Adopter details
            const adopter = await Adopter.findById(applicationData.adopter); // This now correctly receives the ID
            if (!adopter) {
                throw new Error('Adopter not found.');
            }

            const newApplication = new Application({
                application_id: newApplicationId,
                pet: applicationData.pet,
                adopter: applicationData.adopter,
                
                // Populate pet details from fetched pet
                pet_name: pet.pet_name,
                pet_gender: pet.sex,

                // Populate adopter details from fetched adopter
                adopter_first_name: adopter.first_name,
                adopter_last_name: adopter.last_name,
                adopter_contact_no: applicationData.phoneNumber, // Use phone from form

                message: applicationData.adoptionReason, // Adopter's message
                status: 'Pending', // Default status
                date_submitted: new Date(),
                last_update: new Date(),
                preferred_interview_date: applicationData.interviewDate,
                preferred_interview_time: applicationData.interviewTime,
                additional_details: applicationData.additionalDetails,
                
                // Staff-managed fields are initially empty
                interview_date: null,
                interview_time: null,
                next_step: null,
                staff_notes: null,
            });

            const savedApplication = await newApplication.save();
            // After saving the application, update the pet's status to 'Pending'
            await Pet.findByIdAndUpdate(pet._id, { status: 'Pending' });

            return savedApplication;
        }catch(error){
             throw new Error(`Failed to submit application: ${error.message}`);
        }
    }

    async generateNextID(){
        const counter = await Counter.findOneAndUpdate(
            { _id: 'applicationId' }, // Use a specific ID for the application counter
            { $inc: { seq: 1 } },
            { new: true, upsert: true } // Create if not exists, return new value
        );
        const currentYear = new Date().getFullYear();
        const sequenceNumber = String(counter.seq).padStart(3, '0');
        return `APP-${currentYear}-${sequenceNumber}`;
    }

    async findById(applicationId) {
        try {
            // Find by the custom application_id string or by MongoDB's _id
            const query = mongoose.Types.ObjectId.isValid(applicationId) 
                ? { _id: applicationId } 
                : { application_id: applicationId };
            return await Application.findOne(query)
                .populate({ path: 'pet', populate: { path: 'posted_by_staff' } }) // Nested populate for staff
                .populate('adopter');
        } catch (error) {
            throw new Error(`Failed to find application: ${error.message}`);
        }
    }

    async findAllForAdopter(adopterId) {
        try {
            return await Application.find({ adopter: adopterId })
                .populate({ path: 'pet', populate: { path: 'posted_by_staff' } }) // Nested populate for staff
                .sort({ date_submitted: -1 });
        } catch (error) {
            throw new Error(`Failed to find applications for adopter: ${error.message}`);
        }
    }

    async findAll() {
        try {
            return await Application.find({})
                .populate({ path: 'pet', populate: { path: 'posted_by_staff' } }) // Nested populate for staff
                .populate('adopter')
                .sort({ date_submitted: -1 });
        } catch (error) {
            throw new Error(`Failed to find all applications: ${error.message}`);
        }
    }

    async updateStatus(applicationId, status, staff_notes) {
        try {
            const query = mongoose.Types.ObjectId.isValid(applicationId) 
                ? { _id: applicationId } 
                : { application_id: applicationId };
            
            return await Application.findOneAndUpdate(
                query,
                { 
                    status, 
                    staff_notes: staff_notes || '',
                    last_update: new Date()
                },
                { new: true }
            ).populate('pet').populate('adopter');
        } catch (error) {
            throw new Error(`Failed to update application status: ${error.message}`);
        }
    }

    async updateApplication(applicationId, updateData) {
        try {
            const query = mongoose.Types.ObjectId.isValid(applicationId) 
                ? { _id: applicationId } 
                : { application_id: applicationId };
            
            return await Application.findOneAndUpdate(
                query,
                { 
                    ...updateData,
                    last_update: new Date()
                },
                { new: true }
            ).populate('pet').populate('adopter');
        } catch (error) {
            throw new Error(`Failed to update application: ${error.message}`);
        }
    }

    async markAsAdopted(applicationId) {
        try {
            const query = mongoose.Types.ObjectId.isValid(applicationId) 
                ? { _id: applicationId } 
                : { application_id: applicationId };

            const app = await Application.findOne(query);
            if (!app) throw new Error('Application not found');

            app.status = 'Adopted';
            app.last_update = new Date();
            await app.save();

            // Update Pet status to Adopted
            await Pet.findByIdAndUpdate(app.pet, { status: 'Adopted' });

            return app;
        } catch (error) {
            throw new Error(`Failed to mark as adopted: ${error.message}`);
        }
    }
}
module.exports = {
    ApplicationRepository
}