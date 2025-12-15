const staffTaskRepository = require('../repositories/staffTaskRepository');
const volunteerRepository = require('../repositories/volunteerRepository');

class StaffTaskController {
  async create(req, res) {
    try {
      const { title, description, type, category, priority, estimatedHours, points, dueDate, location, created_by } = req.body;

      if (!title || !category || !dueDate || !location) {
        return res.status(400).json({
          message: 'Missing required fields: title, category, dueDate, location'
        });
      }

      const taskData = {
        title,
        description: description || '',
        type: type || 'Special',
        category,
        priority: priority || 'Medium',
        estimatedHours: estimatedHours || 1,
        points: points || 25,
        dueDate,
        location,
        status: 'Unassigned',
        created_by: created_by // Add the creator's ID
      };

      const created = await staffTaskRepository.create(taskData);
      return res.status(201).json({
        message: 'Staff task created successfully',
        _id: created._id,
        ...created.toObject()
      });
    } catch (err) {
      console.error('Create staff task error:', err);
      return res.status(500).json({
        message: 'Failed to create staff task',
        error: err.message
      });
    }
  }

  async getAll(req, res) {
    try {
      const tasks = await staffTaskRepository.findAll();
      return res.json({
        message: 'Staff tasks retrieved',
        tasks
      });
    } catch (err) {
      console.error('Get staff tasks error:', err);
      return res.status(500).json({
        message: 'Failed to get staff tasks',
        error: err.message
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const task = await staffTaskRepository.findById(id);

      if (!task) {
        return res.status(404).json({ message: 'Staff task not found' });
      }

      return res.json({
        message: 'Staff task retrieved',
        task
      });
    } catch (err) {
      console.error('Get staff task error:', err);
      return res.status(500).json({
        message: 'Failed to get staff task',
        error: err.message
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const task = await staffTaskRepository.update(id, req.body);

      if (!task) {
        return res.status(404).json({ message: 'Staff task not found' });
      }

      return res.json({
        message: 'Staff task updated',
        task
      });
    } catch (err) {
      console.error('Update staff task error:', err);
      return res.status(500).json({
        message: 'Failed to update staff task',
        error: err.message
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await staffTaskRepository.delete(id);

      if (!deleted) {
        return res.status(404).json({ message: 'Staff task not found' });
      }

      return res.json({
        message: 'Staff task deleted',
        data: deleted
      });
    } catch (err) {
      console.error('Delete staff task error:', err);
      return res.status(500).json({
        message: 'Failed to delete staff task',
        error: err.message
      });
    }
  }

  async assignVolunteer(req, res) {
    try {
      const { id } = req.params;
      const { volunteerId } = req.body;

      if (!volunteerId) {
        return res.status(400).json({ message: 'Volunteer ID is required' });
      }

      // Validate volunteer exists
      const volunteer = await volunteerRepository.findById(volunteerId);
      if (!volunteer) {
        return res.status(404).json({ message: 'Volunteer not found' });
      }

      const task = await staffTaskRepository.update(id, {
        assignedTo: volunteerId,
        status: 'Assigned'
      });

      if (!task) {
        return res.status(404).json({ message: 'Staff task not found' });
      }

      return res.json({
        message: 'Volunteer assigned to task',
        task
      });
    } catch (err) {
      console.error('Assign volunteer error:', err);
      return res.status(500).json({
        message: 'Failed to assign volunteer',
        error: err.message
      });
    }
  }
}

module.exports = new StaffTaskController();
