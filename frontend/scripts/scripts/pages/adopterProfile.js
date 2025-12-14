import AuthService from '../components/authService.js';

class AdopterProfile {
    constructor() {
        this.user = null;
        this.profileImageBase64 = null; // Para i-store ang bagong image

        // DOM Elements
        this.profilePic = document.getElementById('profilePic');
        this.navbarProfilePic = document.getElementById('navbarProfilePic');

        // View-mode elements
        this.viewElements = document.querySelectorAll('.adopter-profile-info-value');
        // Edit-mode elements
        this.editElements = document.querySelectorAll('input.form-control, textarea.form-control, select.form-select');

        // Buttons
        this.editProfileBtn = document.getElementById('editProfileBtn');
        this.saveChangesBtn = document.getElementById('saveChangesBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.uploadPicBtn = document.getElementById('uploadPicBtn');
        this.profileImageInput = document.getElementById('profileImageInput');

        // Message element
        this.profileMessage = document.getElementById('profileMessage');

        this.initialize();
    }

    async initialize() {
        // Check for user authentication
        const token = AuthService.getToken();
        if (!token) {
            window.location.href = '/frontend/pages/login-form.html';
            return;
        }

        try {
            // Fetch user data from backend (or get from localStorage)
            // For now, we'll use localStorage as a fallback
            this.user = JSON.parse(localStorage.getItem('currentUser'));
            if (!this.user) throw new Error('User not found');

            this.populateProfileData();
            this.attachEventListeners();
        } catch (error) {
            console.error('Initialization failed:', error);
            // Redirect to login if user data is corrupt or missing
            AuthService.logout();
            window.location.href = '/frontend/pages/login-form.html';
        }
    }

    populateProfileData() {
        if (!this.user) return;

        // Populate text and input fields
        document.getElementById('profileDisplayName').textContent = `${this.user.first_name} ${this.user.last_name}`;
        document.getElementById('navbarUserName').textContent = `${this.user.first_name} ${this.user.last_name}`;
        document.getElementById('dropdownUserName').textContent = `${this.user.first_name} ${this.user.last_name}`;

        // View mode elements
        document.getElementById('viewUserFirstName').textContent = this.user.first_name || 'N/A';
        document.getElementById('viewUserLastName').textContent = this.user.last_name || 'N/A';
        document.getElementById('viewUserEmail').textContent = this.user.email || 'N/A';
        document.getElementById('viewUserPhone').textContent = this.user.phone || 'N/A';
        document.getElementById('viewUserAddress').textContent = this.user.address || 'Not provided';
        document.getElementById('viewUserBio').textContent = this.user.bio || 'No bio yet.';
        document.getElementById('viewLivingSituation').textContent = this.user.living_situation?.replace('_', ' ') || 'N/A';

        // Edit mode inputs
        document.getElementById('editUserFirstName').value = this.user.first_name || '';
        document.getElementById('editUserLastName').value = this.user.last_name || '';
        document.getElementById('editUserEmail').value = this.user.email || '';
        document.getElementById('editUserPhone').value = this.user.phone || '';
        document.getElementById('editUserAddress').value = this.user.address || '';
        document.getElementById('editUserBio').value = this.user.bio || '';
        document.getElementById('editLivingSituation').value = this.user.living_situation || 'own_house';

        // Profile picture
        const profileImageUrl = this.user.profile_image || '/frontend/assets/image/photo/BoyIcon.jpg';
        this.profilePic.src = profileImageUrl;
        this.navbarProfilePic.src = profileImageUrl;
    }

    attachEventListeners() {
        this.editProfileBtn.addEventListener('click', () => this.toggleEditMode(true));
        this.cancelBtn.addEventListener('click', () => this.toggleEditMode(false));
        this.saveChangesBtn.addEventListener('click', () => this.handleSaveChanges());

        // Image upload
        this.uploadPicBtn.addEventListener('click', () => this.profileImageInput.click());
        this.profileImageInput.addEventListener('change', (e) => this.handleImageUpload(e));
    }

    toggleEditMode(isEditing) {
        if (isEditing) {
            // Show edit fields, hide view fields
            this.viewElements.forEach(el => el.classList.add('d-none'));
            this.editElements.forEach(el => el.classList.remove('d-none'));
            // Toggle buttons
            this.editProfileBtn.classList.add('d-none');
            this.saveChangesBtn.classList.remove('d-none');
            this.cancelBtn.classList.remove('d-none');
        } else {
            // Show view fields, hide edit fields
            this.viewElements.forEach(el => el.classList.remove('d-none'));
            this.editElements.forEach(el => el.classList.add('d-none'));
            // Toggle buttons
            this.editProfileBtn.classList.remove('d-none');
            this.saveChangesBtn.classList.add('d-none');
            this.cancelBtn.classList.add('d-none');
            // Reset form to original data
            this.populateProfileData();
            this.hideMessage();
        }
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // I-convert ang image sa Base64 para ma-save sa database
        const reader = new FileReader();
        reader.onload = (e) => {
            this.profileImageBase64 = e.target.result;
            this.profilePic.src = this.profileImageBase64; // Ipakita ang preview
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
            first_name: document.getElementById('editUserFirstName').value,
            last_name: document.getElementById('editUserLastName').value,
            phone: document.getElementById('editUserPhone').value,
            address: document.getElementById('editUserAddress').value,
            bio: document.getElementById('editUserBio').value,
            living_situation: document.getElementById('editLivingSituation').value,
        };

        // Idagdag lang ang image kung may bagong in-upload
        if (this.profileImageBase64) {
            updatedData.profile_image = this.profileImageBase64;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/auth/profile/adopter/${this.user._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to save changes.');
            }

            // I-update ang localStorage at ang current user object
            this.user = result.user;
            localStorage.setItem('currentUser', JSON.stringify(this.user));

            this.showMessage('Profile updated successfully!', 'success');
            this.populateProfileData(); // I-refresh ang display
            this.toggleEditMode(false); // Bumalik sa view mode

        } catch (error) {
            console.error('Save failed:', error);
            this.showMessage(error.message, 'danger');
        } finally {
            this.saveChangesBtn.disabled = false;
            this.saveChangesBtn.textContent = 'Save Changes';
            this.profileImageBase64 = null; // I-reset pagkatapos mag-save
        }
    }

    showMessage(text, type = 'info') {
        this.profileMessage.textContent = text;
        this.profileMessage.className = `alert alert-${type}`;
        this.profileMessage.classList.remove('d-none');
        setTimeout(() => this.hideMessage(), 5000); // Mawawala after 5 seconds
    }

    hideMessage() {
        this.profileMessage.classList.add('d-none');
    }
}

new AdopterProfile();