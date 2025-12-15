const taskRepository = require('../repositories/taskRepository');
const petRepository = require('../repositories/pet.repository');
const staffRepository = require('../repositories/staffRepository');
const volunteerRepository = require('../repositories/volunteerRepository');

class TaskController {
  async getAll(req, res) {
    try {
      const tasks = await taskRepository.findAll();
      res.json({ tasks });
    } catch (err) {
      console.error('Get tasks error:', err);
      res.status(500).json({ message: 'Failed to get tasks', error: err.message });
    }
  }

  async getById(req, res) {
    try {
      const task = await taskRepository.findById(req.params.id);
      if (!task) return res.status(404).json({ message: 'Task not found' });
      res.json({ task });
    } catch (err) {
      console.error('Get task error:', err);
      res.status(500).json({ message: 'Failed to get task', error: err.message });
    }
  }

  async create(req, res) {
    try {
      // Validate that the creator (staff) exists
      const creator = await staffRepository.findById(req.body.created_by);
      if (!creator) {
        return res.status(404).json({ message: 'Creator (staff) not found.' });
      }

      // Validate pet exists
      if (req.body.pet_id) {
        const pet = await petRepository.findById(req.body.pet_id);
        if (!pet) return res.status(404).json({ message: 'Pet not found for the given pet_id' });
      }

      // Validate volunteer exists if assigned
      if (req.body.assigned_to) {
        const volunteer = await volunteerRepository.findById(req.body.assigned_to);
        if (!volunteer) return res.status(404).json({ message: 'Volunteer not found' });
      }

      const task = await taskRepository.create(req.body);
      res.status(201).json({ message: 'Task created', task });
    } catch (err) {
      console.error('Create task error:', err);
      res.status(500).json({ message: 'Failed to create task', error: err.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await taskRepository.updateById(req.params.id, req.body);
      if (!updated) return res.status(404).json({ message: 'Task not found' });
      res.json({ message: 'Task updated', task: updated });
    } catch (err) {
      console.error('Update task error:', err);
      res.status(500).json({ message: 'Failed to update task', error: err.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await taskRepository.deleteById(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Task not found' });
      res.json({ message: 'Task deleted' });
    } catch (err) {
      console.error('Delete task error:', err);
      res.status(500).json({ message: 'Failed to delete task', error: err.message });
    }
  }
}

module.exports = new TaskController();