import { initializePage, getUserRoleDisplay } from './dashboardUtils.js';
import { initVolunteerDashboard } from '../modules/Capacity';


// Initialize staff dashboard page with user data from localStorage
initializePage(user => {
    // Staff dashboard-specific setup
    updateStaffDashboard(user);
});

function updateStaffDashboard(user) {
    // Update navbar profile with user data
    const navNameEl = document.getElementById('staffNavName');
    const navRoleEl = document.getElementById('staffNavRole');
    
    if (navNameEl) {
        navNameEl.textContent = `${user.first_name} ${user.last_name}`;
    }
    if (navRoleEl) {
        navRoleEl.textContent = getUserRoleDisplay(user.role || 'staff');
    }

    // Update welcome message
    const welcomeHeading = document.querySelector('.staff-overview-box h4');
    if (welcomeHeading) {
        welcomeHeading.textContent = `Welcome, ${user.first_name}`;
    }

    // Update profile image
    const profileImg = document.querySelector('.staff-profile-img');
    if (profileImg) {
        const imagePath = user.profile_image || '../../assets/image/photo/BoyIcon.jpg';
        profileImg.src = imagePath;
        profileImg.onerror = function() {
            this.src = '../../assets/image/photo/BoyIcon.jpg';
        };
    }
}
