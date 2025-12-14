export class VolunteerSignUp {
  constructor() {
    this.field = {
      volunteerFName: 'volunteer_first_name',
      volunteerLName: 'volunteer_last_name',
      volunteerEmail: 'volunteer_email',
      volunteerPhone: 'volunteer_phone',
      volunteerPassword: 'volunteer_password',
      availability: 'availability',
      interestedActivities: 'interested_activities'
    };
    this.msgEl = null; // make message element accessible
  }

  volunteerSignUp() {
    //Get the signup to the 
    const volunteerForm = document.querySelector('.js-volunteer-signup');
    if (!volunteerForm) return;

    let msgEl = document.querySelector('.signupMessage');
    if (!msgEl) {
      msgEl = document.createElement('div');
      msgEl.classList.add('signupMessage');
      volunteerForm.appendChild(msgEl);
    }
    this.msgEl = msgEl;

    volunteerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      this.SubmitForm(volunteerForm);
    });
  }

  SubmitForm(volunteerForm) {
    const formData = new FormData(volunteerForm);

    const load = {
      volunteerFName: formData.get(this.field.volunteerFName),
      volunteerLName: formData.get(this.field.volunteerLName),
      volunteerEmail: formData.get(this.field.volunteerEmail),
      volunteerPhone: formData.get(this.field.volunteerPhone),
      volunteerPassword: formData.get(this.field.volunteerPassword),
      availability: formData.getAll(this.field.availability),
      interestedActivities: formData.getAll(this.field.interestedActivities),
      consents: formData.getAll('volunteer_consents')
    };

    if (this.validate(load)) {
      this.handlerFetchingBackend(load, volunteerForm);
    }
  }

  validate(load) {
    const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const re = /^(\+639|09)\d{9}$/;

    if (!load.volunteerFName || !load.volunteerLName) {
      this.showMessage('Please enter your full name.', 'danger');
      return false;
    }
    if (!email.test(load.volunteerEmail)) {
      this.showMessage('Please enter a valid email address.', 'danger');
      return false;
    }
    if (!load.volunteerPassword || load.volunteerPassword.length < 6) {
      this.showMessage('Password must be at least 6 characters.', 'danger');
      return false;
    }
    if (!re.test(load.volunteerPhone) || load.volunteerPhone.length !== 11) {
      this.showMessage('Phone number must start with 09 and have exactly 11 digits.', 'danger');
      return false;
    }
    return true;
  }

  async handlerFetchingBackend(load, volunteerForm) {
    try {
      const res = await fetch('http://localhost:5000/api/volunteers/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(load)
      });

      const result = await res.json();

      if (res.ok) {
        this.showMessage(result.message || 'Registration successful!', 'success');
        volunteerForm.reset();
      } else {
        this.showMessage(result.message || result.error || 'Registration failed.', 'danger');
      }

      console.log('Signup response:', result);
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
