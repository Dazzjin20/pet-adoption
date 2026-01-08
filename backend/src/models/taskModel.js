const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  pet_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet', // This can be null for manual/staff tasks
    required: false
  },
  task_type: {
    type: String,
    enum: ['Medical', 'Cleaning', 'Maintenance', 'Special', 'One-time', 'Recurring', 'Urgent', 'Feeding', 'Grooming', 'Exercise', 'Physical Therapy', 'General'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['Facilities', 'Animal Care', 'Administrative'],
    required: false // Make it optional for Care Tasks
  },
  assigned_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Volunteer',
    default: null
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    required: true
  },
  scheduled_date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: false // Optional for care tasks, but good to have
  },
  estimatedHours: {
    type: Number,
    default: 1,
    required: false
  },
  points: {
    type: Number,
    default: 25,
    required: false
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Task', taskSchema);
