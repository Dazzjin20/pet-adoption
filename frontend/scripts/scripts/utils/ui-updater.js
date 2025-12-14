
function updateSharedUI() {
    const userData = localStorage.getItem('currentUser');
    if (!userData) {
        console.warn('No user data found for UI update.');
        return;
    }

    try {
        const user = JSON.parse(userData);
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        const userRole = user.userType || 'User';
        const profileImage = user.profile_image || '/frontend/assets/image/photo/BoyIcon.jpg';

        // Update Navbar
        const navbarUserName = document.getElementById('navbarUserName');
        const navbarUserRole = document.getElementById('navbarUserRole');
        const navbarProfilePic = document.getElementById('navbarProfilePic');
        if (navbarUserName) navbarUserName.textContent = fullName;
        if (navbarUserRole) navbarUserRole.textContent = userRole.charAt(0).toUpperCase() + userRole.slice(1);
        if (navbarProfilePic) navbarProfilePic.src = profileImage;

        // Update Dropdown
        const dropdownUserName = document.getElementById('dropdownUserName');
        if (dropdownUserName) dropdownUserName.textContent = fullName;

    } catch (error) {
        console.error('Failed to parse user data for UI update:', error);
    }
}

// Run the update function as soon as the script is loaded.
document.addEventListener('DOMContentLoaded', updateSharedUI);

// Export for explicit calls if needed
export { updateSharedUI };