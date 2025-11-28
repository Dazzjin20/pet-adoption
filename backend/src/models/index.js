const mongoose = require('mongoose');

// Base User Schema with common fields
const baseUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  phone: { type: String, required: true },
  consents: [{
    consent_type: { type: String, required: true },
    consented: { type: Boolean, default: false },
    consented_at: { type: Date, default: Date.now }
  }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Adopter Schema
const adopterSchema = new mongoose.Schema({
  ...baseUserSchema.obj,
  living_situation: {
    type: String,
    'enum': ['own_house', 'rent_house', 'apartment', 'condominium'],                                                          
    required: true
  },
  pet_experience: [{
    type: String,
    'enum': ['dogs', 'cats', '1st_time_owner'] 
  }],
  status: {
    type: String,
    'enum': ['active', 'inactive', 'suspended'],
    default: 'active'
  }
});

// Volunteer Schema
const volunteerSchema = new mongoose.Schema({
  ...baseUserSchema.obj,
  availability: [{
    type: String,
    'enum': ['Weekdays', 'Weekend', 'Morning', 'Night'] 
  }],
  activities: [{
    type: String,
    'enum': ['dog_care', 'cat_care', 'administrative', 'event_management'] 
  }],
  status: {
    type: String,
    'enum': ['active', 'inactive', 'pending'],
    default: 'pending'
  },
  background_check_status: {
    type: String,
    'enum': ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
});

// Staff Schema
const staffSchema = new mongoose.Schema({
  ...baseUserSchema.obj,
  role: {
    type: String,
    'enum': ['admin', 'manager', 'coordinator'], 
    default: 'coordinator'
  },
  department: String,
  status: {
    type: String,
    'enum': ['active', 'inactive'],
    default: 'active'
  }
});

// Add indexes for better performance
adopterSchema.index({ email: 1 });
volunteerSchema.index({ email: 1 });
staffSchema.index({ email: 1 });

// Virtual for full name
baseUserSchema.virtual('full_name').get(function() {
  return `${this.first_name} ${this.last_name}`;
});

const Adopter = mongoose.model('Adopter', adopterSchema);
const Volunteer = mongoose.model('Volunteer', volunteerSchema);
const Staff = mongoose.model('Staff', staffSchema);

module.exports = {
  Adopter,
  Volunteer,
  Staff
};