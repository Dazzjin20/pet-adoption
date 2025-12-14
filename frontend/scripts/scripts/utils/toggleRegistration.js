const buttons = {
  registerBtnVolunteer: 'registerFormVolunteer',
  registerBtnVolunteer2: 'registerFormVolunteer',
  registerBtnVolunteer3: 'registerFormVolunteer',
  registerBtnAdopters: 'registerFormAdopters',
  registerBtnAdopters2: 'registerFormAdopters',
  registerBtnAdopters3: 'registerFormAdopters',
  registerBtnStaff: 'registerFormStaff',
  registerBtnStaff2: 'registerFormStaff',
  registerBtnStaff3: 'registerFormStaff',
};

const forms = {
  registerFormVolunteer: document.getElementById('registerFormVolunteer'),
  registerFormAdopters: document.getElementById('registerFormAdopters'),
  registerFormStaff: document.getElementById('registerFormStaff'),
};

export function toggleButton() {
  Object.entries(buttons).forEach(([btnId, targetFormId]) => {
    const button = document.getElementById(btnId);
    if (button) {
      button.addEventListener('click', () => {
        Object.entries(forms).forEach(([formId, formEl]) => {
          if (formId === targetFormId) {
            formEl.classList.remove('d-none');
          } else {
            formEl.classList.add('d-none');
          }
        });
      });
    }
  });
}