export class ToggleLogin {
  constructor() {
    this.buttonLogin = {
      loginBtnVolunteer: 'loginFormVolunteer',
      loginBtnAdopters: 'loginFormAdopters',
      loginBtnVolunteer2: 'loginFormVolunteer',
      loginBtnAdopters2: 'loginFormAdopters',
      loginBtnVolunteer3: 'loginFormVolunteer',
      loginBtnAdopters3: 'loginFormAdopters',
      loginBtnStaff: 'loginFormStaff',
      loginBtnStaff2: 'loginFormStaff',
      loginBtnStaff3: 'loginFormStaff',
    };

    this.FormLogin = {
      loginFormVolunteer: document.getElementById('loginFormVolunteer'),
      loginFormAdopters: document.getElementById('loginFormAdopters'),
      loginFormStaff: document.getElementById('loginFormStaff'),
    };
  }

  ToggleLoginButton() {
    Object.entries(this.buttonLogin).forEach(([btnId, targetFormId]) => {
      const button = document.getElementById(btnId);
      if (button) {
        button.addEventListener('click', () => {
          Object.entries(this.FormLogin).forEach(([formId, formEl]) => {
            formEl.classList.toggle('d-none', formId !== targetFormId);
          });
        });
      }
    });
  }
}