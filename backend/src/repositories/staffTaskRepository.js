const StaffTask = require('../models/staffTaskModel');

class StaffTaskRepository {
  async create(data) {
    const task = new StaffTask(data);
    return await task.save();
  }

  async findAll() {
    return await StaffTask.find()
      .populate('assignedTo', 'first_name last_name')
      .populate('created_by', 'first_name last_name')
      .sort({ createdAt: -1 });
  }

  async findById(id) {
    return await StaffTask.findById(id).populate('assignedTo');
  }

  async update(id, data) {
    return await StaffTask.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true }
    ).populate('assignedTo');
  }

  async delete(id) {
    return await StaffTask.findByIdAndDelete(id);
  }

  async findByStatus(status) {
    return await StaffTask.find({ status }).sort({ createdAt: -1 });
  }
}

module.exports = new StaffTaskRepository();
