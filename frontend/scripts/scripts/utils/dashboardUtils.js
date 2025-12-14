/**
 * Naglalaman ng mga shared functions para sa lahat ng dashboard pages.
 */

/**
 * Kinukuha ang user data, nag-che-check kung valid, at tinatawag ang page-specific logic.
 * @param {function} pageSpecificSetup - Isang callback function na tatakbo pagkatapos ng initial setup.
 */
export function initializePage(pageSpecificSetup) {
    document.addEventListener('DOMContentLoaded', () => {
        const userData = localStorage.getItem('currentUser');
        
        if (!userData) {
            window.location.href = 'login-form.html';
            return;
        }

        const user = JSON.parse(userData);
        
        // I-setup ang mga common elements
        updateCommonUI(user);
        setupCommonEventListeners();

        // I-run ang specific logic para sa page na ito
        if (pageSpecificSetup && typeof pageSpecificSetup === 'function') {
            pageSpecificSetup(user);
        }
    });
}

/**
 * Ina-update ang mga common UI elements tulad ng navbar at dropdown.
 * @param {object} user - Ang user object mula sa localStorage.
 */
export function updateCommonUI(user) {
    const fullName = `${user.first_name} ${user.last_name}`;
    const userRole = getUserRoleDisplay(user.role || user.user_type);
    const profilePicture = user.profile_image || '/frontend/assets/image/photo/BoyIcon.jpg'; // Default image

    // Update navbar (check elements exist)
    const navbarUserNameEl = document.getElementById('navbarUserName');
    const navbarUserRoleEl = document.getElementById('navbarUserRole');
    const navbarProfilePicEl = document.getElementById('navbarProfilePic');
    if (navbarUserNameEl) navbarUserNameEl.textContent = fullName;
    if (navbarUserRoleEl) navbarUserRoleEl.textContent = userRole;
    if (navbarProfilePicEl) navbarProfilePicEl.src = profilePicture;

    // Update dropdown (check elements exist)
    const dropdownUserNameEl = document.getElementById('dropdownUserName');
    const dropdownUserRoleEl = document.getElementById('dropdownUserRole');
    const dropdownProfilePicEl = document.getElementById('dropdownProfilePic');
    if (dropdownUserNameEl) dropdownUserNameEl.textContent = fullName;
    if (dropdownUserRoleEl) dropdownUserRoleEl.textContent = userRole;
    if (dropdownProfilePicEl) dropdownProfilePicEl.src = profilePicture;
}

/**
 * Sine-setup ang mga common event listeners tulad ng logout.
 */
export function setupCommonEventListeners() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('userType');
            window.location.href = 'pages/login-form.html';
        });
    }
}

export function getUserRoleDisplay(role) {
    const roles = { 'adopter': 'Pet Adopter', 'volunteer': 'Volunteer', 'staff': 'Staff Member', 'coordinator': 'Coordinator' };
    return roles[role] || 'User';
}