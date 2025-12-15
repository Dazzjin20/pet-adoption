const mongoose = require('mongoose');

const staffTaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['Special', 'Recurring', 'Urgent'],
    default: 'Special'
  },
  category: {
    type: String,
    enum: ['Facilities', 'Animal Care', 'Administrative'],
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  estimatedHours: {
    type: Number,
    default: 1
  },
  points: {
    type: Number,
    default: 25
  },
  dueDate: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Unassigned', 'Assigned', 'In Progress', 'Completed'],
    default: 'Unassigned'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Volunteer',
    default: null
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
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

// Explicitly set collection name to 'staff_tasks'
const StaffTask = mongoose.model('StaffTask', staffTaskSchema, 'staff_tasks');

module.exports = StaffTask;
