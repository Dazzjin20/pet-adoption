const staffRepository = require('../repositories/staffRepository');

class StaffController {
  async getProfile(req, res) {
    try {
      const { staffId } = req.params;

      if (!staffId) {
        return res.status(400).json({ message: 'Staff ID is required' });
      }

      // Try to find by ID first
      let staff = await staffRepository.findById(staffId);
      
      // If not found by ID and looks like an email, try finding by email
      if (!staff && staffId.includes('@')) {
        staff = await staffRepository.findByEmail(staffId);
      }

      if (!staff) {
        return res.status(404).json({ message: 'Staff not found' });
      }

   
      const profileData = {
        _id: staff._id,
        firstName: staff.first_name || '',
        middleName: staff.middle_name || '',
        lastName: staff.last_name || '',
        email: staff.email || '',
        phone: staff.phone || '',
        address: staff.address || '',
        bio: staff.bio || '',
        profilePic: staff.profilePic || '/frontend/assets/image/photo/BoyIcon.jpg',
        role: staff.role || 'staff',
        createdAt: staff.createdAt,
        // Include old field names for compatibility
        first_name: staff.first_name || '',
        last_name: staff.last_name || '',
        middle_name: staff.middle_name || ''
      };

      return res.json({ 
        message: 'Staff profile retrieved', 
        data: profileData 
      });
    } catch (err) {
      console.error('Get staff profile error:', err);
      return res.status(500).json({ 
        message: 'Failed to get staff profile', 
        error: err.message 
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const { staffId } = req.params;

      if (!staffId) {
        return res.status(400).json({ message: 'Staff ID is required' });
      }

      // Map frontend field names to backend field names
      const updateData = {
        first_name: req.body.firstName,
        middle_name: req.body.middleName,
        last_name: req.body.lastName,
        phone: req.body.phone,
        address: req.body.address,
        bio: req.body.bio,
        profilePic: req.body.profilePic
      };
      const updated = await staffRepository.updateById(staffId, updateData);

      if (!updated) {
        return res.status(404).json({ message: 'Staff not found' });
      }

      // Format response
      const profileData = {
        _id: updated._id,
        firstName: updated.first_name || '',
        middleName: updated.middle_name || '',
        lastName: updated.last_name || '',
        email: updated.email || '',
        phone: updated.phone || '',
        address: updated.address || '',
        bio: updated.bio || '',
        profilePic: updated.profilePic || '/frontend/assets/image/photo/BoyIcon.jpg',
        createdAt: updated.createdAt
      };

      return res.json({ 
        message: 'Staff profile updated', 
        data: profileData 
      });
    } catch (err) {
      console.error('Update staff profile error:', err);
      return res.status(500).json({ 
        message: 'Failed to update staff profile', 
        error: err.message 
      });
    }
  }

  async getStats(req, res) {
    try {
      const { staffId } = req.params;

      if (!staffId) {
        return res.status(400).json({ message: 'Staff ID is required' });
      }

      // Try to find by ID first, then by email
      let staff = await staffRepository.findById(staffId);
      
      if (!staff && staffId.includes('@')) {
        staff = await staffRepository.findByEmail(staffId);
      }

      if (!staff) {
        return res.status(404).json({ message: 'Staff not found' });
      }

      const stats = await staffRepository.getStaffStats(staff._id);

      return res.json({ 
        message: 'Staff stats retrieved', 
        data: stats 
      });
    } catch (err) {
      console.error('Get staff stats error:', err);
      return res.status(500).json({ 
        message: 'Failed to get staff stats', 
        error: err.message 
      });
    }
  }
}

module.exports = new StaffController();
