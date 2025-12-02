import AuthService from './authService.js';

function handleLoginForm(formId, userType, dashboardUrl) {
    const form = document.getElementById(formId);
    if (!form) {
        console.warn(`Form ${formId} not found`);
        return;
    }

    const messageEl = document.getElementById(`loginMessage${userType.charAt(0).toUpperCase() + userType.slice(1)}`);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = form.querySelector('input[name="email"]');
        const passwordInput = form.querySelector('input[name="password"]');
        
        if (!emailInput || !passwordInput) {
            console.error('Email or password input not found in form');
            return;
        }
        
        const email = emailInput.value;
        const password = passwordInput.value;
        const submitButton = form.querySelector('button[type="submit"]');

        // Clear previous message
        if (messageEl) messageEl.innerHTML = '';
        submitButton.disabled = true;
        submitButton.textContent = 'Logging in...';

        try {
            const loginData = await AuthService.login(email, password, userType);
            
            // Kung successful, i-redirect sa tamang dashboard
            window.location.href = dashboardUrl;

        } catch (error) {
            if (messageEl) {
                messageEl.innerHTML = `<div class="alert alert-danger mt-3">${error.message}</div>`;
            }
            console.error(`Login error for ${userType}:`, error);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = `Login as ${userType.charAt(0).toUpperCase() + userType.slice(1)}`;
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // I-setup ang bawat login form
    handleLoginForm(
        'loginFormAdopter', 
        'adopter', 
        '/frontend/pages/adopters/adopter-dashboard.html'
    );
    handleLoginForm(
        'loginFormVolunteer', 
        'volunteer', 
        '/frontend/pages/volunteer/volunteer-dashboard.html'
    );
    handleLoginForm(
        'loginFormStaff', 
        'staff', 
        '/frontend/pages/staff/staff-dashboard.html'
    );
});