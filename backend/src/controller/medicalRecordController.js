const medicalRecordRepository = require('../repositories/medicalRecordRepository');
const petRepository = require('../repositories/pet.repository');

class MedicalRecordController {
  async create(req, res) {
    try {
      const { pet_id, recordType, date, description, veterinarian, notes } = req.body;

      if (!pet_id || !recordType || !date) {
        return res.status(400).json({ 
          message: 'Missing required fields: pet_id, recordType, date' 
        });
      }

      // Fetch the pet to get its name
      const pet = await petRepository.findById(pet_id);
      if (!pet) {
        return res.status(404).json({
          message: 'Pet not found for the given pet_id'
        });
      }

      const medicalData = {
        pet_id,
        pet_name: pet.pet_name, 
        recordType,
        date: new Date(date),
        description: description || '',
        veterinarian: veterinarian || '',
        notes: notes || ''
      };

      const created = await medicalRecordRepository.create(medicalData);
      return res.status(201).json({ 
        message: 'Medical record created successfully', 
        data: created 
      });
    } catch (err) {
      console.error('Create medical record error:', err);
      return res.status(500).json({ 
        message: 'Failed to create medical record', 
        error: err.message 
      });
    }
  }

  async getByPetId(req, res) {
    try {
      const { petId } = req.params;

      if (!petId) {
        return res.status(400).json({ message: 'Pet ID is required' });
      }

      const records = await medicalRecordRepository.findByPetId(petId);
      return res.json({ 
        message: 'Medical records retrieved', 
        data: records 
      });
    } catch (err) {
      console.error('Get medical records error:', err);
      return res.status(500).json({ 
        message: 'Failed to retrieve medical records', 
        error: err.message 
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { recordType, date, description, veterinarian, notes } = req.body;

      const updated = await medicalRecordRepository.update(id, {
        recordType,
        date: date ? new Date(date) : undefined,
        description,
        veterinarian,
        notes
      });

      if (!updated) {
        return res.status(404).json({ message: 'Medical record not found' });
      }

      return res.json({ 
        message: 'Medical record updated', 
        data: updated 
      });
    } catch (err) {
      console.error('Update medical record error:', err);
      return res.status(500).json({ 
        message: 'Failed to update medical record', 
        error: err.message 
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const deleted = await medicalRecordRepository.delete(id);

      if (!deleted) {
        return res.status(404).json({ message: 'Medical record not found' });
      }

      return res.json({ 
        message: 'Medical record deleted', 
        data: deleted 
      });
    } catch (err) {
      console.error('Delete medical record error:', err);
      return res.status(500).json({ 
        message: 'Failed to delete medical record', 
        error: err.message 
      });
    }
  }
}

module.exports = new MedicalRecordController();
