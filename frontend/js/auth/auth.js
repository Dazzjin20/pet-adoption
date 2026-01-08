function populateNavbar() {
     const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const body = document.body;

    // Determine the required role from a data attribute on the body tag
    const requiredRole = body.dataset.requiredRole;

    // If a role is required for this page
    if (requiredRole) {
        // 1. Check if a user is logged in
        if (!currentUser) {
            alert('You must be logged in to view this page.');
            window.location.href = '/frontend/pages/login-form.html';
            return;
        }

        // 2. Check if the logged-in user has the correct role
        if (currentUser.role !== requiredRole) {
            alert(`Access Denied. This page is for ${requiredRole}s only.`);
            // Clear the invalid session and redirect to login
            localStorage.removeItem('currentUser');
            window.location.href = '/frontend/pages/login-form.html';
            return;
        }
    }

    // If the user is logged in and has the correct role, populate the navbar
    if (currentUser) {
        const userFullName = `${currentUser.first_name} ${currentUser.last_name}`;
        const userRole = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);

        // Generic IDs for navbar elements
        const navbarUserName = document.getElementById('navbarUserName');
        const navbarUserRole = document.getElementById('navbarUserRole');
        const dropdownUserName = document.getElementById('dropdownUserName');
        const dropdownUserRole = document.getElementById('dropdownUserRole');
        // Select all possible profile images in navbars
        const profileImages = document.querySelectorAll('.profile-image, .staff-profile-img'); 

        if (navbarUserName) navbarUserName.textContent = userFullName;
        if (navbarUserRole) navbarUserRole.textContent = userRole;
        if (dropdownUserName) dropdownUserName.textContent = userFullName;
        if (dropdownUserRole) dropdownUserRole.textContent = userRole;

        // Update profile picture if element exists
        if (profileImages.length > 0) {
            const imageUrl = currentUser.profile_image || '/frontend/assets/image/photo/BoyIcon.jpg';
            profileImages.forEach(img => {
                img.src = imageUrl;
                img.onerror = () => { img.src = '/frontend/assets/image/photo/BoyIcon.jpg'; };
            });
        }
    }
}

function initStickyNavbar() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.classList.add('sticky-top');
        
        // Add shadow on scroll for better visibility
        window.addEventListener('scroll', () => {
            if (window.scrollY > 10) {
                navbar.classList.add('shadow-sm');
            } else {
                navbar.classList.remove('shadow-sm');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    populateNavbar();
    initStickyNavbar();
});

// Listen for a custom event to re-populate the navbar after a profile update
window.addEventListener('userUpdated', populateNavbar);