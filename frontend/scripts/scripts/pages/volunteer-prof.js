  class VolunteerProfile {
      constructor() {
        this.user = null;
        this.profileImageBase64 = null;

        // DOM Elements
        this.profilePic = document.getElementById('profilePic');
        this.navbarProfilePic = document.getElementById('navbarProfilePic');

        // View-mode elements
        this.viewElements = document.querySelectorAll('.volunteer-profile-info-value');
        // Edit-mode elements
        this.editElements = document.querySelectorAll('input.form-control, textarea.form-control, textarea.volunteer-tags-input');
        
        // Password section
        this.passwordSection = document.getElementById('passwordSection');


        // Buttons
        this.editProfileBtn = document.getElementById('editProfileBtn');
        this.saveChangesBtn = document.getElementById('saveChangesBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.profileImageInput = document.getElementById('profileImageInput');

        // Message element
        this.profileMessage = document.getElementById('profileMessage');

        this.initialize();
      }

      async initialize() {
        // Check for user authentication
        const userData = localStorage.getItem('currentUser');
        if (!userData) {
          window.location.href = '/frontend/pages/login-form.html';
          return;
        }

        try {
          // FIXED: Safely parse JSON with error handling
          this.user = this.safeParseJSON(userData);
          if (!this.user) {
            console.error('Invalid user data in localStorage');
            localStorage.removeItem('currentUser');
            window.location.href = '/frontend/pages/login-form.html';
            return;
          }

          this.populateProfileData();
          this.attachEventListeners();
          await this.loadVolunteerStats();
        } catch (error) {
          console.error('Initialization failed:', error);
          this.showMessage('Failed to load profile. Please try again.', 'danger');
        }
      }

      // FIXED: Safe JSON parsing function
      safeParseJSON(jsonString) {
        try {
          return JSON.parse(jsonString);
        } catch (error) {
          console.error('JSON parse error:', error);
          return null;
        }
      }

      populateProfileData() {
        if (!this.user) return;

        // Populate text and input fields
        const firstName = this.user.first_name || this.user.firstName || '';
        const lastName = this.user.last_name || this.user.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        
        document.getElementById('profileDisplayName').textContent = fullName;
        document.getElementById('navbarUserName').textContent = fullName;
        document.getElementById('dropdownUserName').textContent = fullName;

        // Profile picture
        const profileImageUrl = this.user.profile_image || '/frontend/assets/image/photo/BoyIcon.jpg';
        this.profilePic.src = profileImageUrl;
        this.navbarProfilePic.src = profileImageUrl;

        // Member since
        const joinDate = this.user.createdAt || this.user.join_date || new Date().toISOString();
        document.getElementById('memberSince').textContent = `Member since ${this.formatDate(joinDate)}`;

        // View mode elements
        document.getElementById('viewFirstName').textContent = firstName || 'N/A';
        document.getElementById('viewLastName').textContent = lastName || 'N/A';
        document.getElementById('viewEmail').textContent = this.user.email || 'N/A';
        document.getElementById('viewPhone').textContent = this.user.phone_number || this.user.phone || 'N/A';
        document.getElementById('viewAddress').textContent = this.user.address || 'Not provided';
        document.getElementById('viewBio').textContent = this.user.bio || 'No bio yet.';

        // Edit mode inputs
        document.getElementById('editFirstName').value = firstName || '';
        document.getElementById('editLastName').value = lastName || '';
        document.getElementById('editEmail').value = this.user.email || '';
        document.getElementById('editPhone').value = this.user.phone_number || this.user.phone || '';
        document.getElementById('editAddress').value = this.user.address || '';
        document.getElementById('editBio').value = this.user.bio || '';

        // Skills
        this.populateSkills();
        
        // Availability
        this.populateAvailability();
      }

      populateSkills() {
        const skillsContainer = document.getElementById('viewSkills');
        skillsContainer.innerHTML = '';
        
        const skills = this.user.skills || [];
        if (skills.length > 0) {
          skills.forEach(skill => {
            const skillTag = document.createElement('div');
            skillTag.className = 'volunteer-tag';
            skillTag.textContent = skill;
            skillsContainer.appendChild(skillTag);
          });
        } else {
          const emptyTag = document.createElement('div');
          emptyTag.className = 'volunteer-tag';
          emptyTag.textContent = 'No skills listed';
          emptyTag.style.opacity = '0.6';
          skillsContainer.appendChild(emptyTag);
        }
        
        document.getElementById('editSkills').value = skills.join(', ');
      }

      populateAvailability() {
        const availabilityContainer = document.getElementById('viewAvailability');
        availabilityContainer.innerHTML = '';
        
        const availability = this.user.availability || [];
        if (availability.length > 0) {
          availability.forEach(avail => {
            const availabilityTag = document.createElement('div');
            availabilityTag.className = 'volunteer-tag';
            availabilityTag.textContent = avail;
            availabilityContainer.appendChild(availabilityTag);
          });
        } else {
          const emptyTag = document.createElement('div');
          emptyTag.className = 'volunteer-tag';
          emptyTag.textContent = 'No availability set';
          emptyTag.style.opacity = '0.6';
          availabilityContainer.appendChild(emptyTag);
        }
        
        document.getElementById('editAvailability').value = availability.join(', ');
      }

      attachEventListeners() {
        this.editProfileBtn.addEventListener('click', () => this.toggleEditMode(true));
        this.cancelBtn.addEventListener('click', () => this.toggleEditMode(false));
        this.saveChangesBtn.addEventListener('click', () => this.handleSaveChanges());



        // Password toggle
        document.querySelectorAll('.volunteer-toggle-password').forEach(button => {
          button.addEventListener('click', (e) => {
            const targetId = e.currentTarget.dataset.target;
            const input = document.getElementById(targetId);
            if (input.type === 'password') {
              input.type = 'text';
              e.currentTarget.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
              input.type = 'password';
              e.currentTarget.innerHTML = '<i class="fas fa-eye"></i>';
            }
          });
        });
      }

      toggleEditMode(isEditing) {
        if (isEditing) {
          // Show edit fields, hide view fields
          this.viewElements.forEach(el => el.classList.add('d-none'));
          this.editElements.forEach(el => el.classList.remove('d-none'));
          // Show password section
          this.passwordSection.style.display = 'block';
          // Show upload button for profile picture

          // Toggle buttons
          this.editProfileBtn.classList.add('d-none');
          this.saveChangesBtn.classList.remove('d-none');
          this.cancelBtn.classList.remove('d-none');
        } else {
          // Show view fields, hide edit fields
          this.viewElements.forEach(el => el.classList.remove('d-none'));
          this.editElements.forEach(el => el.classList.add('d-none'));
          // Hide password section
          this.passwordSection.style.display = 'none';
          // Hide upload button

          // Toggle buttons
          this.editProfileBtn.classList.remove('d-none');
          this.saveChangesBtn.classList.add('d-none');
          this.cancelBtn.classList.add('d-none');
          // Reset form to original data
          this.populateProfileData();
          this.hideMessage();
          // Clear password fields
          document.getElementById('currentPassword').value = '';
          document.getElementById('newPassword').value = '';
          document.getElementById('confirmPassword').value = '';
        }
      }

      handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
          this.profileImageBase64 = e.target.result;
          this.profilePic.src = this.profileImageBase64;
          this.showMessage('New profile image is ready to be saved.', 'info');
        };
        reader.onerror = () => {
          this.showMessage('Failed to read image file.', 'danger');
        };
        reader.readAsDataURL(file);
      }

      async handleSaveChanges() {
        this.saveChangesBtn.disabled = true;
        this.saveChangesBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';

        const updatedData = {
          first_name: document.getElementById('editFirstName').value,
          last_name: document.getElementById('editLastName').value,
          phone_number: document.getElementById('editPhone').value,
          address: document.getElementById('editAddress').value,
          bio: document.getElementById('editBio').value,
          skills: document.getElementById('editSkills').value.split(',').map(s => s.trim()).filter(s => s),
          availability: document.getElementById('editAvailability').value.split(',').map(a => a.trim()).filter(a => a)
        };

        // Add profile image if changed
        if (this.profileImageBase64) {
          updatedData.profile_image = this.profileImageBase64;
        }

        try {
          const token = localStorage.getItem('token');
          const userId = this.user._id || this.user.id;
          
          const response = await fetch(`http://localhost:3000/api/volunteers/${userId}/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedData)
          });

          // FIXED: Check if response is valid JSON
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Server returned non-JSON response');
          }

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.message || 'Failed to save changes.');
          }

          // Update user data
          this.user = result.user || this.user;
          localStorage.setItem('currentUser', JSON.stringify(this.user));

          // Handle password change if provided
          const passwordChanged = await this.handlePasswordChange();
          
          if (passwordChanged) {
            this.showMessage('Profile and password updated successfully!', 'success');
          } else {
            this.showMessage('Profile updated successfully!', 'success');
          }
          
          this.populateProfileData();
          this.toggleEditMode(false);

        } catch (error) {
          console.error('Save failed:', error);
          this.showMessage(error.message || 'Failed to save changes. Please try again.', 'danger');
        } finally {
          this.saveChangesBtn.disabled = false;
          this.saveChangesBtn.textContent = 'Save Changes';
          this.profileImageBase64 = null;
        }
      }

      async handlePasswordChange() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Check if any password field is filled
        if (!currentPassword && !newPassword && !confirmPassword) {
          return false; // No password change requested
        }

        // Validate password change
        if (!currentPassword) {
          this.showMessage('Please enter current password to change password', 'warning');
          return false;
        }

        if (newPassword !== confirmPassword) {
          this.showMessage('New passwords do not match', 'danger');
          return false;
        }

        if (newPassword.length < 8) {
          this.showMessage('Password must be at least 8 characters', 'danger');
          return false;
        }

        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:3000/api/volunteers/${this.user._id}/change-password`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              current_password: currentPassword,
              new_password: newPassword
            })
          });

          // FIXED: Check if response is valid JSON
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Server returned non-JSON response');
          }

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.message || 'Failed to change password');
          }

          // Clear password fields
          document.getElementById('currentPassword').value = '';
          document.getElementById('newPassword').value = '';
          document.getElementById('confirmPassword').value = '';

          return true; // Password changed successfully

        } catch (error) {
          this.showMessage(error.message || 'Failed to change password', 'danger');
          return false;
        }
      }

      async loadVolunteerStats() {
        try {
          const token = localStorage.getItem('token');
          const userId = this.user._id || this.user.id;
          
          const response = await fetch(`http://localhost:3000/api/volunteers/${userId}/stats`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            // FIXED: Check if response is valid JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const stats = await response.json();
              this.updateStatsDisplay(stats);
            } else {
              this.calculateStats();
            }
          } else {
            this.calculateStats();
          }
        } catch (error) {
          console.error('Error loading stats:', error);
          this.calculateStats();
        }
      }

      calculateStats() {
        const activities = this.user.activities || [];
        const totalHours = activities.reduce((sum, activity) => sum + (activity.hours || 0), 0);
        const completedTasks = activities.filter(act => act.status === 'completed').length;
        const uniquePets = new Set(activities.map(act => act.pet_id).filter(id => id)).size;
        
        this.updateStatsDisplay({
          total_hours: totalHours,
          completed_tasks: completedTasks,
          pets_helped: uniquePets
        });
      }

      updateStatsDisplay(stats) {
        document.getElementById('statHours').textContent = stats.total_hours || stats.hours || 0;
        document.getElementById('statTasks').textContent = stats.completed_tasks || stats.tasks || 0;
        document.getElementById('statPets').textContent = stats.pets_helped || stats.pets || 0;
      }

      showMessage(text, type = 'info') {
        this.profileMessage.textContent = text;
        this.profileMessage.className = `alert alert-${type}`;
        this.profileMessage.classList.remove('d-none');
        setTimeout(() => this.hideMessage(), 5000);
      }

      hideMessage() {
        this.profileMessage.classList.add('d-none');
      }

      formatDate(dateString) {
        if (!dateString) return 'Unknown date';
        
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return 'Unknown date';
          
          const options = { month: 'short', day: 'numeric', year: 'numeric' };
          return date.toLocaleDateString('en-US', options);
        } catch (error) {
          return 'Unknown date';
        }
      }
    }

    // Initialize the profile when page loads
    document.addEventListener('DOMContentLoaded', () => {
      // FIXED: Add error handling for initialization
      try {
        new VolunteerProfile();
      } catch (error) {
        console.error('Failed to initialize profile:', error);
        alert('Failed to load profile. Please refresh the page.');
      }
    });

    // FIXED: Add global error handler for JSON parsing
    window.addEventListener('error', function(event) {
      if (event.error && event.error.toString().includes('JSON')) {
        console.error('Global JSON error:', event.error);
        // Clear invalid data from localStorage
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
      }
    });