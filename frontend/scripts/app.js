import { SignupForm } from './modules/registerAdopter.js';
import { RegisterStaff } from './modules/registerStaff.js';
import { VolunteerSignUp } from './modules/registerVolunteer.js';
import {ToggleLogin} from './utils/toggleLoginForm.js';
import {toggleButton} from './utils/toggleRegistration.js';

class App {
  constructor() {
    this.currentSection = 'adopters';
    this.init();
  }

  init() {
    this.initializeRegistrationForms();
    this.setupRoleSwitching();
    this.setupLoginRoleSwitching();
    this.setupFormValidation();
  }

  initializeRegistrationForms() {
    // Initialize adopter registration
    const adopterForm = new SignupForm();
    adopterForm.signupButton();

    // Initialize staff registration
    const staffForm = new RegisterStaff();
    staffForm.staffSignUp();

    // Initialize volunteer registration
    const volunteerForm = new VolunteerSignUp();
    volunteerForm.volunteerSignUp();
  }

  setupRoleSwitching() {
    // Registration form switching
    const registerButtons = {
      adopters: ['registerBtnAdopters', 'registerBtnAdopters2', 'registerBtnAdopters3'],
      volunteer: ['registerBtnVolunteer', 'registerBtnVolunteer2', 'registerBtnVolunteer3'],
      staff: ['registerBtnStaff', 'registerBtnStaff2', 'registerBtnStaff3']
    };

    this.setupButtonListeners(registerButtons, this.showRegistrationForm.bind(this));
  }

  setupLoginRoleSwitching() {
    // Login form switching
    const loginButtons = {
      adopters: ['loginBtnAdopters', 'loginBtnAdopters2', 'loginBtnAdopters3'],
      volunteer: ['loginBtnVolunteer', 'loginBtnVolunteer2', 'loginBtnVolunteer3'],
      staff: ['loginBtnStaff', 'loginBtnStaff2', 'loginBtnStaff3']
    };

    this.setupButtonListeners(loginButtons, this.showLoginForm.bind(this));
  }

  setupButtonListeners(buttonGroups, handler) {
    Object.entries(buttonGroups).forEach(([role, buttonIds]) => {
      buttonIds.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
          button.addEventListener('click', (e) => {
            e.preventDefault();
            handler(role);
            this.updateActiveButton(buttonId, buttonGroups, role);
          });
        }
      });
    });
  }

  showRegistrationForm(role) {
    // Hide all registration forms
    document.getElementById('registerFormAdopters')?.classList.add('d-none');
    document.getElementById('registerFormVolunteer')?.classList.add('d-none');
    document.getElementById('registerFormStaff')?.classList.add('d-none');

    // Show selected registration form
    const formId = `registerForm${role.charAt(0).toUpperCase() + role.slice(1)}`;
    document.getElementById(formId)?.classList.remove('d-none');
    
    this.currentSection = role;
  }

  showLoginForm(role) {
    // Hide all login forms
    document.getElementById('loginFormAdopters')?.classList.add('d-none');
    document.getElementById('loginFormVolunteer')?.classList.add('d-none');
    document.getElementById('loginFormStaff')?.classList.add('d-none');

    // Show selected login form
    const formId = `loginForm${role.charAt(0).toUpperCase() + role.slice(1)}`;
    document.getElementById(formId)?.classList.remove('d-none');
    
    this.currentSection = role;
  }

  updateActiveButton(activeButtonId, buttonGroups, role) {
    // Reset all buttons in this group to default state
    Object.values(buttonGroups).flat().forEach(buttonId => {
      const button = document.getElementById(buttonId);
      if (button) {
        button.classList.remove('btn-dark');
        button.classList.add('btn-outline-dark');
      }
    });

    // Set active button to dark
    const activeButton = document.getElementById(activeButtonId);
    if (activeButton) {
      activeButton.classList.add('btn-dark');
      activeButton.classList.remove('btn-outline-dark');
    }
  }

  setupFormValidation() {
    // Real-time phone number validation
    const phoneInputs = document.querySelectorAll('input[type="tel"], input[name*="phone"]');
    phoneInputs.forEach(input => {
      input.addEventListener('input', (e) => {
        const value = e.target.value;
        if (value && !/^09\d{0,9}$/.test(value)) {
          e.target.setCustomValidity('Phone number must start with 09 and have 11 digits');
        } else {
          e.target.setCustomValidity('');
        }
      });
    });

    // Real-time email validation
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
      input.addEventListener('input', (e) => {
        const value = e.target.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
          e.target.setCustomValidity('Please enter a valid email address');
        } else {
          e.target.setCustomValidity('');
        }
      });
    });

    // Password strength indicator
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
      input.addEventListener('input', (e) => {
        const value = e.target.value;
        const strength = this.checkPasswordStrength(value);
        this.updatePasswordStrengthIndicator(e.target, strength);
      });
    });
  }

  checkPasswordStrength(password) {
    if (!password) return 'empty';
    
    let strength = 0;
    
    // Length check
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    
    // Character variety checks
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  }

  updatePasswordStrengthIndicator(input, strength) {
    // Remove existing indicator
    const existingIndicator = input.parentNode.querySelector('.password-strength');
    if (existingIndicator) {
      existingIndicator.remove();
    }

    if (strength === 'empty') return;

    const indicator = document.createElement('div');
    indicator.className = 'password-strength mt-1';
    
    let text, color;
    switch (strength) {
      case 'weak':
        text = 'Weak password';
        color = 'danger';
        break;
      case 'medium':
        text = 'Medium password';
        color = 'warning';
        break;
      case 'strong':
        text = 'Strong password';
        color = 'success';
        break;
    }
    
    indicator.innerHTML = `<small class="text-${color}">${text}</small>`;
    input.parentNode.appendChild(indicator);
  }
}

toggleButton(); 
const LoginToggler = new ToggleLogin();
LoginToggler.ToggleLoginButton()


// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new App();
});

// Export for testing
export default App;