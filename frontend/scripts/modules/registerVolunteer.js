export class VolunteerSignUp {
  constructor() {
    this.msgEl = null;
  }

  volunteerSignUp() {
    const volunteerForm = document.querySelector('.js-volunteer-signup');
    if (!volunteerForm) return;

    this.createMessageElement(volunteerForm);

    volunteerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleFormSubmission(volunteerForm);
    });
  }

  createMessageElement(form) {
    let msgEl = document.getElementById('volunteerSignupMessage');
    if (!msgEl) {
      msgEl = document.createElement('div');
      msgEl.id = 'volunteerSignupMessage';
      msgEl.className = 'mt-3';
      form.parentNode.insertBefore(msgEl, form.nextSibling);
    }
    this.msgEl = msgEl;
  }

  async handleFormSubmission(form) {
    const formData = new FormData(form);
    
    const payload = {
      first_name: formData.get('volunteer_first_name'),
      last_name: formData.get('volunteer_last_name'),
      email: formData.get('volunteer_email'),
      phone: formData.get('volunteer_phone'),
      password: formData.get('volunteer_password'),
      availability: formData.getAll('availability'),
      interested_activities: formData.getAll('interested_activities'),
      consents: formData.getAll('volunteer_consents')
    };

    if (!this.validatePayload(payload)) {
      return;
    }

    await this.submitToBackend(payload, form);
  }

  validatePayload(payload) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^09\d{9}$/;

    if (!payload.first_name?.trim() || !payload.last_name?.trim()) {
      this.showMessage('Please enter your full name.', 'danger');
      return false;
    }

    if (!emailRegex.test(payload.email)) {
      this.showMessage('Please enter a valid email address.', 'danger');
      return false;
    }

    if (!payload.password || payload.password.length < 6) {
      this.showMessage('Password must be at least 6 characters.', 'danger');
      return false;
    }

    if (!phoneRegex.test(payload.phone)) {
      this.showMessage('Phone number must start with 09 and have exactly 11 digits.', 'danger');
      return false;
    }

    // Validate availability (at least one selection)
    if (payload.availability.length === 0) {
      this.showMessage('Please select at least one availability option.', 'danger');
      return false;
    }

    // Validate activities (at least one selection)
    if (payload.interested_activities.length === 0) {
      this.showMessage('Please select at least one interested activity.', 'danger');
      return false;
    }

    // Check required consents
    const requiredConsents = ['agreed_terms', 'consent_background_check'];
    const missingConsents = requiredConsents.filter(consent => 
      !payload.consents.includes(consent)
    );

    if (missingConsents.length > 0) {
      this.showMessage('Please agree to the Terms of Service and Background Check consent.', 'danger');
      return false;
    }

    return true;
  }

  async submitToBackend(payload, form) {
    try {
      const response = await fetch('http://localhost:3000/api/auth/register/volunteer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        this.showMessage(result.message || 'Volunteer registration successful!', 'success');
        form.reset();
        
        // Redirect to login after successful registration
        setTimeout(() => {
          window.location.href = 'login-form.html';
        }, 2000);
      } else {
        this.showMessage(result.message || result.error || 'Volunteer registration failed.', 'danger');
      }
    } catch (error) {
      console.error('Volunteer registration error:', error);
      this.showMessage('Unable to connect to server. Please try again later.', 'danger');
    }
  }

  showMessage(text, type) {
    if (!this.msgEl) return;

    this.msgEl.textContent = text;
    this.msgEl.className = `alert alert-${type} mt-3`;
    this.msgEl.setAttribute('role', 'alert');

    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        this.msgEl.textContent = '';
        this.msgEl.className = '';
      }, 5000);
    }
  }
}