 // Load volunteer profile when page opens
  document.addEventListener('DOMContentLoaded', function() {
      // Get user data from localStorage
      const userData = localStorage.getItem('currentUser');
      
      if (!userData) {
          // Redirect to login if no user data
          window.location.href = 'login-form.html';
          return;
      }

      const user = JSON.parse(userData);
      updateVolunteerProfile(user);
      loadVolunteerData(user);
      setupEventListeners();
  });

  function updateVolunteerProfile(user) {
      // Update volunteer name and role
      const fullName = `${user.first_name} ${user.last_name}`;
      const userRole = getUserRoleDisplay(user.role || user.user_type);
      
      // Update navbar profile
      const navbarName = document.getElementById('volunteerNavbarName');
      const navbarRole = document.getElementById('volunteerNavbarRole');
      if (navbarName) navbarName.textContent = fullName;
      if (navbarRole) navbarRole.textContent = userRole;
      
      // Update welcome message
      const welcomeMessage = document.getElementById('volunteerWelcomeMessage');
      if (welcomeMessage) {
          welcomeMessage.textContent = `Welcome back, ${user.first_name}!`;
      }
  }

  function loadVolunteerData(user) {
      // Load volunteer data (you can fetch these from your backend)
      const volunteerData = JSON.parse(localStorage.getItem('volunteerData')) || {
          hoursThisMonth: 124,
          petsHelped: 47,
          tasksCompleted: 15,
          successfulAdoptions: 8,
          subtitle: "You've made a difference in 47 pets' lives this month",
          todaysSchedule: [
              { task: "Dog Walking - Morning Shift", time: "9:00 AM - 11:00 AM" },
              { task: "Cat Socialization", time: "2:00 PM - 4:00 PM" }
          ],
          performanceItems: [
              "Completed 3 dog walks this week",
              "Assisted 2 adoptions successfully", 
              "Helped with 1 vaccination clinic"
          ]
      };
      
      // Update statistics
      document.getElementById('hoursThisMonth').textContent = volunteerData.hoursThisMonth;
      document.getElementById('petsHelped').textContent = volunteerData.petsHelped;
      document.getElementById('tasksCompleted').textContent = volunteerData.tasksCompleted;
      document.getElementById('successfulAdoptions').textContent = volunteerData.successfulAdoptions;
      
      // Update subtitle
      const subtitle = document.getElementById('volunteerSubtitle');
      if (subtitle) subtitle.textContent = volunteerData.subtitle;
      
      // Update today's schedule
      const scheduleItem1 = document.getElementById('scheduleItem1');
      const scheduleItem2 = document.getElementById('scheduleItem2');
      
      if (scheduleItem1 && volunteerData.todaysSchedule[0]) {
          scheduleItem1.querySelector('.fw-semibold').textContent = volunteerData.todaysSchedule[0].task;
          scheduleItem1.querySelector('.volunteer-schedule-time').textContent = volunteerData.todaysSchedule[0].time;
      }
      
      if (scheduleItem2 && volunteerData.todaysSchedule[1]) {
          scheduleItem2.querySelector('.fw-semibold').textContent = volunteerData.todaysSchedule[1].task;
          scheduleItem2.querySelector('.volunteer-schedule-time').textContent = volunteerData.todaysSchedule[1].time;
      }
      
      // Update performance list
      const performanceList = document.getElementById('performanceList');
      if (performanceList && volunteerData.performanceItems) {
          performanceList.innerHTML = '';
          volunteerData.performanceItems.forEach(item => {
              const li = document.createElement('li');
              li.className = 'mb-2';
              li.textContent = `✔ ${item}`;
              performanceList.appendChild(li);
          });
      }
  }

  function setupEventListeners() {
      // View full schedule button
      const viewScheduleBtn = document.getElementById('viewFullScheduleBtn');
      if (viewScheduleBtn) {
          viewScheduleBtn.addEventListener('click', function() {
              // Redirect to schedule page
              window.location.href = 'volunteer-schedule.html';
          });
      }

      // Schedule items click events
      const scheduleItems = document.querySelectorAll('.volunteer-schedule-item');
      scheduleItems.forEach((item, index) => {
          item.addEventListener('click', function() {
              const task = this.querySelector('.fw-semibold').textContent;
              const time = this.querySelector('.volunteer-schedule-time').textContent;
              alert(`Schedule Item ${index + 1}:\n${task}\n${time}`);
          });
      });
  }

  function getUserRoleDisplay(role) {
      const roles = {
          'adopter': 'Pet Adopter',
          'volunteer': 'Volunteer',
          'staff': 'Staff Member',
          'coordinator': 'Coordinator',
          'admin': 'Administrator'
      };
      return roles[role] || 'Volunteer';
  }