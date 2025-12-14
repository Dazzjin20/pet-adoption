const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  pet_id: {
    type: String,
    required: true,
    index: true
  },
  pet_name:{
    type: String,
    default: ''
  },
  recordType: {
    type: String,
    enum: ['Vaccination', 'Checkup', 'Surgery', 'Treatment'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  veterinarian: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure the collection name is 'medical' as requested
const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema, 'medical');

module.exports = MedicalRecord;
