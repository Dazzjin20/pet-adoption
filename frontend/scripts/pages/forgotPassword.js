document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const messageDiv = document.getElementById('message');

    // Optional: Pre-fill email if passed in URL (e.g. from a failed login attempt)
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    if (emailParam) {
        const emailInput = document.getElementById('email');
        if (emailInput) emailInput.value = emailParam;
    }

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const emailInput = document.getElementById('email');
            const email = emailInput.value.trim();

            if (!email) {
                showMessage('Please enter your email address.', 'danger');
                return;
            }

            // UI Loading State
            const submitBtn = forgotPasswordForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            showMessage('Sending reset link...', 'info');

            try {
                // Call backend API
                const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();

                if (response.ok) {
                    showMessage(data.message || 'Password reset link sent! Check your email.', 'success');
                    forgotPasswordForm.reset();

                    // Auto-redirect for testing/demo purposes
                    if (data.resetLink) {
                        setTimeout(() => {
                            window.location.href = data.resetLink;
                        }, 1500);
                    }
                } else {
                    showMessage(data.message || 'Failed to send reset link. Please try again.', 'danger');
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage('Unable to connect to server. Please try again later.', 'danger');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }

    function showMessage(text, type) {
        if (!messageDiv) return;
        
        messageDiv.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${text}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    }
});