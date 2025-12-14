document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgotPasswordForm');
    const messageEl = document.getElementById('message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = form.elements.email.value;
        const submitButton = form.querySelector('button[type="submit"]');

        showMessage('', 'd-none'); // Clear previous messages
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        try {
            const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (response.ok) {
                showMessage(result.message, 'alert alert-success');
                form.reset();
            } else {
                showMessage(result.message || 'An error occurred.', 'alert alert-danger');
            }
        } catch (error) {
            console.error('Forgot Password Error:', error);
            showMessage('Failed to connect to the server. Please try again later.', 'alert alert-danger');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Send Reset Link';
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