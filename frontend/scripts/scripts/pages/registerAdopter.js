export class SignupForm {
  constructor() {
    // mapping from form field names to API property names
    this.fieldMap = {
      adopterFName: 'adopter_first_name',
      adopterLName: 'adopter_last_name',
      adopterEmail: 'adopter_email',
      adopterPhone: 'adopter_phone_number',
      adopterPassword: 'adopter_password',
      livingSituation: 'living_situation'
    };
    this.msgEl = null;
  }

  signupButton() {
    const form = document.getElementById('signupForm');
    if (!form) return;

    // feedback element
    let msgEl = document.getElementById('signupMessage');
    if (!msgEl) {
      msgEl = document.createElement('div');
      msgEl.id = 'signupMessage';
      // Insert message element before the first form element for better visibility
      form.appendChild(msgEl);
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);

      const payload = {
        adopterFName: formData.get(this.fieldMap.adopterFName),
        adopterLName: formData.get(this.fieldMap.adopterLName),
        adopterEmail: formData.get(this.fieldMap.adopterEmail),
        adopterPhone: formData.get(this.fieldMap.adopterPhone),
        adopterPassword: formData.get(this.fieldMap.adopterPassword),
        livingSituation: formData.get(this.fieldMap.livingSituation),
        petExperience: formData.getAll('pet_experience'),
        consents: formData.getAll('adopter_consents')
      };

      // Basic client-side validation
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRe = /^09\d{9}$/;

      if (!payload.adopterFName || !payload.adopterLName) {
        this.showMessage('Please enter your full name.', 'danger');
        return;
      }
      if (!emailRe.test(payload.adopterEmail)) {
        this.showMessage('Please enter a valid email address.', 'danger');
        return;
      }
      if (!payload.adopterPassword || payload.adopterPassword.length < 6) {
        this.showMessage('Password must be at least 6 characters.', 'danger');
        return;
      }
     if (!phoneRe.test(payload.adopterPhone)) {
      this.showMessage('Phone number must start with 09 and have exactly 11 digits', 'danger');
      return;
      }

      // send flat load that matches backend expectations
      try {
        const res = await fetch('http://localhost:5000/api/adopters/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await res.json();
        if (res.ok) {
          this.showMessage(result.message || 'Registration successful', 'success');
          form.reset();
        } else {
          this.showMessage(result.message || result.error || 'Registration failed', 'danger');
        }
        console.log('Signup response:', result);
      } catch (err) {
        console.error('Connection error:', err);
        this.showMessage('Unable to connect to server. Please try again later.', 'danger');
      }
    });

    this.msgEl = msgEl;
  }

  showMessage(text, type = 'info') {
    if (!this.msgEl) return;
    this.msgEl.innerText = text;
    this.msgEl.className = 'signupMessage alert'; // Reset classes
    this.msgEl.classList.add(type === 'success' ? 'alert-success' : 'alert-danger');
    this.msgEl.setAttribute('role', 'alert');
  }
}
