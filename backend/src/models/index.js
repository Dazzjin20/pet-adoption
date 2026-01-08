const mongoose = require('mongoose');

// Base User Schema with common fields
// Nagdagdag ako ng profile_image at bio para sa profile data.
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
  profile_image: { type: String, default: null }, // Para sa base64 o URL ng profile image
  bio: { type: String, default: null }, // Para sa biography ng user
  address: { type: String, default: null }, // Para sa address ng user
  role: {
    type: String,
    enum: ['adopter', 'volunteer', 'staff'],
    required: true
  },
  created_at: { type: Date, default: Date.now }, // Ito ay awtomatikong ima-manage ng timestamps
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
    'enum': ['dogs', 'cats','Others'] 
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
    'enum': ['dog_care', 'cat_care', 'administrative', 'event_management'] // COMMENT: This was the line causing the crash.
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
  department: String,
  status: {
    type: String,
    'enum': ['active', 'inactive'],
    default: 'active'
  },
  role:{
    type: String, // Ino-override ang base role para sa mas specific na staff roles
    enum: ['admin', 'manager', 'coordinator', 'staff'], // Dinagdag ang 'staff' para sa general purpose
    default: 'staff'
  }
});

// Add indexes and timestamps for better performance and data management
adopterSchema.index({ email: 1 });
volunteerSchema.index({ email: 1 });
staffSchema.index({ email: 1 });

// Virtual for full name
adopterSchema.virtual('full_name').get(function() {
  return `${this.first_name} ${this.last_name}`;
});

volunteerSchema.virtual('full_name').get(function() {
  return `${this.first_name} ${this.last_name}`;
});

staffSchema.virtual('full_name').get(function() {
  return `${this.first_name} ${this.last_name}`;
});

// Enable automatic `created_at` and `updated_at` timestamps
adopterSchema.set('timestamps', { createdAt: 'created_at', updatedAt: 'updated_at' });
volunteerSchema.set('timestamps', { createdAt: 'created_at', updatedAt: 'updated_at' });
staffSchema.set('timestamps', { createdAt: 'created_at', updatedAt: 'updated_at' });

const Adopter = mongoose.model('Adopter', adopterSchema);
const Volunteer = mongoose.model('Volunteer', volunteerSchema);
const Staff = mongoose.model('Staff', staffSchema);

module.exports = {
  Adopter,
  Volunteer,
  Staff
};