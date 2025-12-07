const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    application_id: { type: String, unique: true, required: true },
    pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true }, // Reference to Pet model
    adopter: { type: mongoose.Schema.Types.ObjectId, ref: 'Adopter', required: true }, // Reference to Adopter model
    
    // Fields populated from Pet (for snapshot or easy access)
    pet_name: { type: String, required: true },
    pet_gender: { type: String, required: true }, // e.g., 'male', 'female'

    // Fields populated from Adopter (for snapshot or easy access)
    adopter_first_name: { type: String, required: true },
    adopter_last_name: { type: String, required: true },
    adopter_contact_no: { type: String }, 

    // Application specific fields
    message: { type: String }, // The message from the adopter (maps to 'notes' in old repo)
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Interview Scheduled', 'Adopted'], default: 'Pending' },
    date_submitted: { type: Date, default: Date.now },
    last_update: { type: Date, default: Date.now },
    preferred_interview_date: { type: Date },
    preferred_interview_time: { type: String },
    additional_details: { type: String },

    // Staff-managed fields (initially null)
    interview_date: { type: Date, default: null },
    interview_time: { type: String, default: null },
    next_step: { type: String, default: null },
    staff_notes: { type: String, default: null }, 
});

module.exports = mongoose.model('Application', applicationSchema);