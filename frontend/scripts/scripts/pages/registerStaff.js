export class RegisterStaff {
  constructor() {
    this.field = {
      staffFName: 'staff_first_name',
      staffLName: 'staff_last_name',
      staffEmail: 'staff_email',
      staffPhone: 'staff_phone',
      staffPassword: 'staff_password',
      staffConsent: 'staff_consents'
    };
    this.msgEl = null; // make message element accessible
  }

  staffSignUp() {
    const staffForm = document.getElementById('js-staff-signup');
    if (!staffForm) return;

    let msgEl = staffForm.querySelector('.signupMessage');
    if (!msgEl) {
      msgEl = document.createElement('div');
      msgEl.classList.add('signupMessage');
      // Insert message element before the first form element
      staffForm.insertBefore(msgEl, staffForm.firstChild);
    }
    this.msgEl = msgEl;

    staffForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      this.submitForm(staffForm);
    });
  }

  submitForm(staffForm) {
    const formData = new FormData(staffForm);

    const payload = {
      staffFName: formData.get(this.field.staffFName),
      staffLName: formData.get(this.field.staffLName),
      staffEmail: formData.get(this.field.staffEmail),
      staffPhone: formData.get(this.field.staffPhone),
      staffPassword: formData.get(this.field.staffPassword),
      staffConsent: formData.getAll(this.field.staffConsent)
    };

    if (this.validate(payload)) {
      this.handlerFetchingBackend(payload, staffForm);
    }
  }

  validate(payload) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^09\d{9}$/;

    if (!payload.staffFName || !payload.staffLName) {
      this.showMessage('Please enter your full name.', 'danger');
      return false;
    }
    if (!emailRegex.test(payload.staffEmail)) {
      this.showMessage('Please enter a valid email address.', 'danger');
      return false;
    }
    if (!payload.staffPassword || payload.staffPassword.length < 6) {
      this.showMessage('Password must be at least 6 characters.', 'danger');
      return false;
    }
    if (!phoneRegex.test(payload.staffPhone)) {
      this.showMessage('Phone number must start with 09 and have exactly 11 digits.', 'danger');
      return false;
    }
    return true;
  }

  async handlerFetchingBackend(payload, staffForm) {
    try {
      const res = await fetch('http://localhost:5000/api/staff/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (res.ok) {
        this.showMessage(result.message || 'Registration successful!', 'success');
        staffForm.reset();
      } else {
        this.showMessage(result.message || result.error || 'Registration failed.', 'danger');
      }

      console.log('Staff Signup response:', result);
    } catch (err) {
      console.error('Connection error', err);
      this.showMessage('Unable to connect to server. Please try again later.', 'danger');
    }
  }

  showMessage(text, type = 'info') {
    if (!this.msgEl) return;
    this.msgEl.innerText = text;
    this.msgEl.className = '';
    this.msgEl.classList.add('alert');
    this.msgEl.classList.add(
      type === 'success' ? 'alert-success' :
      type === 'danger' ? 'alert-danger' :
      'alert-info'
    );
    this.msgEl.setAttribute('role', 'alert');
  }
}