export class SignupForm {
  constructor() {
    this.msgEl = null;
  }

  signupButton() {
    const form = document.getElementById('signupForm');
    if (!form) return;

    this.createMessageElement(form);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleFormSubmission(form);
    });
  }

  createMessageElement(form) {
    let msgEl = document.getElementById('signupMessage');
    if (!msgEl) {
      msgEl = document.createElement('div');
      msgEl.id = 'signupMessage';
      msgEl.className = 'mt-3';
      form.parentNode.insertBefore(msgEl, form.nextSibling);
    }
    this.msgEl = msgEl;
  }

  async handleFormSubmission(form) {
    const formData = new FormData(form);
    
    const payload = {
      first_name: formData.get('adopter_first_name'),
      last_name: formData.get('adopter_last_name'),
      email: formData.get('adopter_email'),
      phone: formData.get('adopter_phone_number'),
      password: formData.get('adopter_password'),
      living_situation: formData.get('living_situation'),
      pet_experience: formData.getAll('pet_experience'),
      consents: formData.getAll('adopter_consents')
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

    if (!payload.living_situation) {
      this.showMessage('Please select your living situation.', 'danger');
      return false;
    }

    return true;
  }

  async submitToBackend(payload, form) {
    try {
      const response = await fetch('http://localhost:3000/api/auth/register/adopter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        this.showMessage(result.message || 'Registration successful!', 'success');
        form.reset();
        
        // Redirect to login after successful registration
        setTimeout(() => {
          window.location.href = 'login-form.html';
        }, 2000);
      } else {
        this.showMessage(result.message || result.error || 'Registration failed.', 'danger');
      }
    } catch (error) {
      console.error('Registration error:', error);
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