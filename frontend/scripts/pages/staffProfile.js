import AuthService from '../components/authService.js';

class StaffProfile {
    constructor() {
        this.user = null;
        this.profileImageBase64 = null;

        // DOM Elements
        this.profilePic = document.getElementById('profilePic');
        this.navbarProfilePic = document.querySelector('.staff-profile-img');

        // View-mode elements
        this.viewElements = document.querySelectorAll('.info-value');
        // Edit-mode elements
        this.editElements = document.querySelectorAll('.info-input');

        // Buttons
        this.editProfileBtn = document.getElementById('editProfileBtn');
        this.saveChangesBtn = document.getElementById('saveProfileBtn');
        this.cancelBtn = document.getElementById('cancelEditBtn');
        this.changePhotoBtn = document.getElementById('changePhotoBtn');
        this.profileImageInput = document.getElementById('profileImageInput');

        // Message element
        this.profileMessage = document.getElementById('profileMessage'); // Assuming you'll add this div

        this.initialize();
    }

    async initialize() {
        const token = AuthService.getToken();
        if (!token) {
            window.location.href = '/frontend/pages/login-form.html';
            return;
        }

        try {
            this.user = JSON.parse(localStorage.getItem('currentUser'));
            if (!this.user) throw new Error('User not found in localStorage');

            this.populateProfileData();
            this.attachEventListeners();
        } catch (error) {
            console.error('Initialization failed:', error);
            AuthService.logout();
            window.location.href = '/frontend/pages/login-form.html';
        }
    }

    populateProfileData() {
        if (!this.user) return;

        const fullName = `${this.user.first_name || ''} ${this.user.last_name || ''}`.trim();
        document.getElementById('profileName').textContent = fullName || 'Staff Member';
        document.getElementById('navbarUserName').textContent = fullName || 'Staff';
        document.getElementById('profileRole').textContent = this.user.role || 'Staff';
        document.getElementById('navbarUserRole').textContent = this.user.role ? this.user.role.charAt(0).toUpperCase() + this.user.role.slice(1) : 'Staff';

        // Member since
        const joinDate = this.user.created_at || new Date().toISOString();
        document.getElementById('memberSince').textContent = `Member since ${new Date(joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;

        // View mode elements
        document.getElementById('viewFirstName').textContent = this.user.first_name || 'N/A';
        document.getElementById('viewLastName').textContent = this.user.last_name || 'N/A';
        document.getElementById('viewEmail').textContent = this.user.email || 'N/A';
        document.getElementById('viewPhone').textContent = this.user.phone || 'N/A';
        document.getElementById('viewAddress').textContent = this.user.address || 'Not provided';
        document.getElementById('viewBio').textContent = this.user.bio || 'No bio yet.';
        document.getElementById('viewMiddleName').textContent = this.user.middle_name || '-';

        // Edit mode inputs
        document.getElementById('editFirstName').value = this.user.first_name || '';
        document.getElementById('editLastName').value = this.user.last_name || '';
        document.getElementById('editEmail').value = this.user.email || '';
        document.getElementById('editPhone').value = this.user.phone || '';
        document.getElementById('editAddress').value = this.user.address || '';
        document.getElementById('editBio').value = this.user.bio || '';
        document.getElementById('editMiddleName').value = this.user.middle_name || '';

        // Profile picture
        const profileImageUrl = this.user.profile_image || '/frontend/assets/image/photo/BoyIcon.jpg';
        this.profilePic.src = profileImageUrl;
        if (this.navbarProfilePic) this.navbarProfilePic.src = profileImageUrl;
    }

    attachEventListeners() {
        this.editProfileBtn.addEventListener('click', () => this.toggleEditMode(true));
        this.cancelBtn.addEventListener('click', () => this.toggleEditMode(false));
        this.saveChangesBtn.addEventListener('click', () => this.handleSaveChanges());

        // Image upload
        this.changePhotoBtn.addEventListener('click', () => this.profileImageInput.click());
        this.profileImageInput.addEventListener('change', (e) => this.handleImageUpload(e));
    }

    toggleEditMode(isEditing) {
        const viewModeElements = document.querySelectorAll('.info-value');
        const editModeElements = document.querySelectorAll('.info-input');

        viewModeElements.forEach(el => el.classList.toggle('d-none', isEditing));
        editModeElements.forEach(el => el.classList.toggle('d-none', !isEditing));

        this.editProfileBtn.classList.toggle('d-none', isEditing);
        this.saveChangesBtn.classList.toggle('d-none', !isEditing);
        this.cancelBtn.classList.toggle('d-none', !isEditing);

        if (!isEditing) {
            this.populateProfileData(); // Reset changes if cancelled
        }
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.profileImageBase64 = e.target.result;
            this.profilePic.src = this.profileImageBase64;
            // Automatically trigger save when a new photo is selected
            this.handleSaveChanges(); 
        };
        reader.onerror = () => {
            alert('Failed to read image file.');
        };
        reader.readAsDataURL(file);
    }

    async handleSaveChanges() {
        this.saveChangesBtn.disabled = true;
        this.saveChangesBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';

        const updatedData = {
            firstName: document.getElementById('editFirstName').value,
            lastName: document.getElementById('editLastName').value,
            middleName: document.getElementById('editMiddleName').value,
            phone: document.getElementById('editPhone').value,
            address: document.getElementById('editAddress').value,
            bio: document.getElementById('editBio').value,
        };

        if (this.profileImageBase64) {
            updatedData.profile_image = this.profileImageBase64;
        }

        try {
            const token = AuthService.getToken();
            const response = await fetch(`http://localhost:3000/api/auth/profile/staff/${this.user._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to save changes.');

            // The backend should return the updated user object
            const updatedUser = result.data;

            // Update localStorage
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            this.user = updatedUser; // Update the instance's user object

            alert('Profile updated successfully!');
            this.populateProfileData();
            this.toggleEditMode(false);

            // Dispatch event to update navbar
            window.dispatchEvent(new CustomEvent('userUpdated'));

        } catch (error) {
            console.error('Save failed:', error);
            alert(error.message);
        } finally {
            this.saveChangesBtn.disabled = false;
            this.saveChangesBtn.textContent = 'Save Changes';
            this.profileImageBase64 = null; // Reset after save attempt
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new StaffProfile());
