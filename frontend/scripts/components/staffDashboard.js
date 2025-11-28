import AuthService from '../services/authService.js';
import { Staff } from '../../../backend/src/models/index.js';

class staffDashboard{
    constructor(){
      this.user = []; //Here's the container of data user
      this.init();
    }
    async init(){
      const auth = new AuthService();
      //Check the user if correct 
      if(!auth.AuthService){
         windows.location.href = ''
      }
    }
    //access the renderHTML for dashboard staff
    renderDashboard(user){

    }
}
