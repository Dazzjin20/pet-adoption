document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('resetPasswordForm');
    const messageEl = document.getElementById('message');
    const loginLinkContainer = document.getElementById('loginLinkContainer');

    // Get token from URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
        showMessage('Invalid or missing reset token. Please request a new link.', 'alert alert-danger');
        form.style.display = 'none';
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = form.elements.password.value;
        const confirmPassword = form.elements.confirmPassword.value;
        const submitButton = form.querySelector('button[type="submit"]');

        if (password !== confirmPassword) {
            showMessage('Passwords do not match.', 'alert alert-danger');
            return;
        }

        showMessage('', 'd-none');
        submitButton.disabled = true;
        submitButton.textContent = 'Resetting...';

        try {
            const response = await fetch('http://localhost:3000/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const result = await response.json();

            if (response.ok) {
                showMessage(result.message, 'alert alert-success');
                form.style.display = 'none';
                loginLinkContainer.classList.remove('d-none');
            } else {
                showMessage(result.message || 'An error occurred.', 'alert alert-danger');
            }
        } catch (error) {
            console.error('Reset Password Error:', error);
            showMessage('Failed to connect to the server. Please try again later.', 'alert alert-danger');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Reset Password';
        }
    });

    function showMessage(text, className) {
        messageEl.textContent = text;
        messageEl.className = className;
        if (text) {
            messageEl.setAttribute('role', 'alert');
        } else {
            messageEl.removeAttribute('role');
        }
    }
});