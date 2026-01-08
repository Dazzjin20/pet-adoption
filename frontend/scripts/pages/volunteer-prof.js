class VolunteerProfile {
    constructor() {
        this.user = null;
        this.profileImageBase64 = null; // Store new image here

        // DOM Elements
        this.viewElements = document.querySelectorAll('.volunteer-profile-info-value');
        this.editElements = document.querySelectorAll('input.form-control, textarea.form-control');
        
        this.profilePic = document.getElementById('profilePic');
        this.navbarProfilePic = document.getElementById('navbarProfilePic');
        this.uploadPicBtn = document.getElementById('uploadPicBtn');
        this.profileImageInput = document.getElementById('profileImageInput');

        // Buttons
        this.editProfileBtn = document.getElementById('editProfileBtn');
        this.saveChangesBtn = document.getElementById('saveChangesBtn');
        this.cancelBtn = document.getElementById('cancelBtn');

        // Message element
        this.profileMessage = document.getElementById('profileMessage');

        this.initialize();
    }

    async initialize() {
        // Get user from localStorage
        const userData = localStorage.getItem('currentUser');
        
        if (!userData) {
            console.log('No user data in localStorage');
            return;
        }

        try {
            this.user = JSON.parse(userData);
            console.log('User data loaded successfully:', this.user);
            
            this.populateProfileData();
            this.attachEventListeners();
        } catch (error) {
            console.error('Error parsing user data:', error);
            this.showMessage('Error loading profile data', 'danger');
        }
    }

    populateProfileData() {
        if (!this.user) {
            console.log('No user object available');
            return;
        }

        // Get user data
        const firstName = this.user.first_name || '';
        const lastName = this.user.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();
        
        // Update all name displays
        const profileDisplayName = document.getElementById('profileDisplayName');
        if (profileDisplayName) profileDisplayName.textContent = fullName || 'Volunteer';

        // These might not exist on all pages, so check first.
        const navbarUserName = document.getElementById('navbarUserName');
        if (navbarUserName) navbarUserName.textContent = fullName || 'Volunteer';
        const dropdownUserName = document.getElementById('dropdownUserName');
        if (dropdownUserName) dropdownUserName.textContent = fullName || 'Volunteer';

        // Member since
        const joinDate = this.user.created_at || new Date().toISOString();
        document.getElementById('memberSince').textContent = `Member since ${this.formatDate(joinDate)}`;

        // View mode elements
        document.getElementById('viewUserFirstName').textContent = firstName || 'Not set';
        document.getElementById('viewUserLastName').textContent = lastName || 'Not set';
        document.getElementById('viewUserEmail').textContent = this.user.email || 'Not set';
        document.getElementById('viewUserPhone').textContent = this.user.phone || 'Not set';
        document.getElementById('viewUserAddress').textContent = this.user.address || 'Not provided';
        document.getElementById('viewUserBio').textContent = this.user.bio || 'No bio yet';

        // Activities
        this.populateActivities();
        
        // Availability
        this.populateAvailability();

        // Edit mode inputs
        document.getElementById('editUserFirstName').value = firstName || '';
        document.getElementById('editUserLastName').value = lastName || '';
        document.getElementById('editUserEmail').value = this.user.email || '';
        document.getElementById('editUserPhone').value = this.user.phone || '';
        document.getElementById('editUserAddress').value = this.user.address || '';
        document.getElementById('editUserBio').value = this.user.bio || '';
        document.getElementById('editUserSkills').value = this.user.activities ? this.user.activities.join(', ') : '';
        document.getElementById('editUserAvailability').value = this.user.availability ? this.user.availability.join(', ') : '';

        // Profile picture
        const profileImageUrl = this.user.profile_image || '/frontend/assets/image/photo/BoyIcon.jpg';
        if(this.profilePic) this.profilePic.src = profileImageUrl;
        if(this.navbarProfilePic) this.navbarProfilePic.src = profileImageUrl;
    }

    populateActivities() {
        const skillsContainer = document.getElementById('viewUserSkills');
        if (!skillsContainer) return;
        
        skillsContainer.innerHTML = '';
        const activities = this.user.activities || [];
        
        if (activities.length > 0) {
            activities.forEach(activity => {
                const activityBadge = document.createElement('span');
                activityBadge.className = 'badge bg-secondary me-1 mb-1';
                activityBadge.textContent = this.formatActivityText(activity);
                skillsContainer.appendChild(activityBadge);
            });
        } else {
            skillsContainer.textContent = 'No activities listed';
        }
    }

    populateAvailability() {
        const availabilityContainer = document.getElementById('viewUserAvailability');
        if (!availabilityContainer) return;
        
        availabilityContainer.innerHTML = '';
        const availability = this.user.availability || [];
        
        if (availability.length > 0) {
            availability.forEach(avail => {
                const availabilityBadge = document.createElement('span');
                availabilityBadge.className = 'badge bg-secondary me-1 mb-1';
                availabilityBadge.textContent = avail;
                availabilityContainer.appendChild(availabilityBadge);
            });
        } else {
            availabilityContainer.textContent = 'No availability set';
        }
    }

    formatActivityText(activity) {
        return activity.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    attachEventListeners() {
        this.editProfileBtn.addEventListener('click', () => this.toggleEditMode(true));
        this.cancelBtn.addEventListener('click', () => this.toggleEditMode(false));
        this.saveChangesBtn.addEventListener('click', () => this.handleSaveChanges());

        // Image upload listeners
        if(this.uploadPicBtn && this.profileImageInput) {
            this.uploadPicBtn.addEventListener('click', () => this.profileImageInput.click());
            this.profileImageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        }
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.profileImageBase64 = e.target.result;
            if(this.profilePic) this.profilePic.src = this.profileImageBase64;
            this.showMessage('New profile image is ready to be saved.', 'info');
        };
        reader.readAsDataURL(file);
    }

    toggleEditMode(isEditing) {
        if (isEditing) {
            this.viewElements.forEach(el => el.classList.add('d-none'));
            this.editElements.forEach(el => el.classList.remove('d-none'));
            this.editProfileBtn.classList.add('d-none');
            this.saveChangesBtn.classList.remove('d-none');
            this.cancelBtn.classList.remove('d-none');
            
            // Show upload button (Camera overlay)
            if(this.uploadPicBtn) {
                this.uploadPicBtn.classList.remove('d-none');
                this.uploadPicBtn.classList.add('d-flex');
            }
        } else {
            this.viewElements.forEach(el => el.classList.remove('d-none'));
            this.editElements.forEach(el => el.classList.add('d-none'));
            this.editProfileBtn.classList.remove('d-none');
            this.saveChangesBtn.classList.add('d-none');
            this.cancelBtn.classList.add('d-none');
            
            // Hide upload button
            if(this.uploadPicBtn) {
                this.uploadPicBtn.classList.add('d-none');
                this.uploadPicBtn.classList.remove('d-flex');
            }
            
            this.populateProfileData();
            this.hideMessage();
        }
    }

    async handleSaveChanges() {
        this.saveChangesBtn.disabled = true;
        this.saveChangesBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';

        const updatedData = {
            first_name: document.getElementById('editUserFirstName').value,
            last_name: document.getElementById('editUserLastName').value,
            phone: document.getElementById('editUserPhone').value,
            address: document.getElementById('editUserAddress').value,
            bio: document.getElementById('editUserBio').value,
            activities: document.getElementById('editUserSkills').value.split(',').map(s => s.trim()).filter(s => s).map(s => s.toLowerCase().replace(/ /g, '_')),
            availability: document.getElementById('editUserAvailability').value.split(',').map(a => a.trim()).filter(a => a)
        };

        // Add image if changed
        if (this.profileImageBase64) {
            updatedData.profile_image = this.profileImageBase64;
        }

        try {
            // FIX: Your AuthService uses 'authToken' not 'token'
            const token = localStorage.getItem('authToken') || localStorage.getItem('token');
            const userId = this.user._id;
            
            if (!userId) throw new Error('User ID not found');
            if (!token) {
                console.log('Tokens in localStorage:', {
                    authToken: localStorage.getItem('authToken'),
                    token: localStorage.getItem('token')
                });
                throw new Error('Please login again to get authentication token.');
            }

            console.log('Attempting to save to database...', updatedData);

            // Try the adopter-style endpoint pattern since it works for adopters
            const endpoint = `http://localhost:3000/api/auth/profile/volunteer/${userId}`;
            console.log('Using endpoint:', endpoint);

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });

            // Check response
            if (response.status === 404) {
                throw new Error('Backend route not found (404). Check your server routes.');
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server error:', errorText);
                throw new Error(`Server error: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            console.log('Database update successful:', result);

            // Update local data with response from server
            if (result.user) {
                this.user = result.user;
                localStorage.setItem('currentUser', JSON.stringify(this.user));
                
                // Update Navbar Profile Pic immediately
                if (this.navbarProfilePic && this.user.profile_image) {
                    this.navbarProfilePic.src = this.user.profile_image;
                }
            }

            this.showMessage('Profile updated successfully in database!', 'success');
            this.populateProfileData();
            this.toggleEditMode(false);

        } catch (error) {
            console.error('Save failed:', error);
            
            // Removed localStorage fallback to ensure we fix the backend connection
            this.showMessage('Failed to save to server: ' + error.message, 'danger');
        } finally {
            this.profileImageBase64 = null; // Reset after save
            this.saveChangesBtn.disabled = false;
            this.saveChangesBtn.textContent = 'Save Changes';
        }
    }

    saveToLocalStorage(updatedData) {
        this.user = { ...this.user, ...updatedData };
        localStorage.setItem('currentUser', JSON.stringify(this.user));
        console.log('Saved to localStorage:', this.user);
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

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    try {
        new VolunteerProfile();
    } catch (error) {
        console.error('Failed to initialize profile:', error);
    }
});