 // Load staff profile when page opens
  document.addEventListener('DOMContentLoaded', function() {
      // Get user data from localStorage
      const userData = localStorage.getItem('currentUser');
      
      if (!userData) {
          // Redirect to login if no user data
          window.location.href = 'login-form.html';
          return;
      }

      const user = JSON.parse(userData);
      updateStaffProfile(user);
      loadStaffDashboardData(user);
      setupEventListeners();
  });

  function updateStaffProfile(user) {
      // Update staff name and role
      const fullName = `${user.first_name} ${user.last_name}`;
      const userRole = getUserRoleDisplay(user.role || user.user_type);
      
      // Update navbar profile
      const navbarName = document.getElementById('staffNavbarName');
      const navbarRole = document.getElementById('staffNavbarRole');
      if (navbarName) navbarName.textContent = fullName;
      if (navbarRole) navbarRole.textContent = userRole;
      
      // Update welcome message
      const welcomeMessage = document.getElementById('staffWelcomeMessage');
      if (welcomeMessage) {
          welcomeMessage.textContent = `Welcome, ${user.first_name}`;
      }
  }

  function loadStaffDashboardData(user) {
      // Load dashboard statistics (you can fetch these from your backend)
      const dashboardData = JSON.parse(localStorage.getItem('staffDashboardData')) || {
          animalsInCare: 156,
          activeVolunteers: 223,
          monthlyAdoptions: 34,
          urgentCare: 8,
          subtitle: "Managing care for 156 animals with 23 active volunteers",
          alerts: [
              "Bella needs medication in 2 hours",
              "Max has vet appointment tomorrow", 
              "New volunteer application received"
          ]
      };
      
      // Update statistics
      document.getElementById('animalsInCare').textContent = dashboardData.animalsInCare;
      document.getElementById('activeVolunteers').textContent = dashboardData.activeVolunteers;
      document.getElementById('monthlyAdoptions').textContent = dashboardData.monthlyAdoptions;
      document.getElementById('urgentCare').textContent = dashboardData.urgentCare;
      
      // Update subtitle
      const subtitle = document.getElementById('staffSubtitle');
      if (subtitle) subtitle.textContent = dashboardData.subtitle;
      
      // Update alerts
      document.getElementById('alert1').textContent = dashboardData.alerts[0] || '';
      document.getElementById('alert2').textContent = dashboardData.alerts[1] || '';
      document.getElementById('alert3').textContent = dashboardData.alerts[2] || '';
  }

  function setupEventListeners() {
      // Quick action buttons
      const addPetBtn = document.getElementById('addPetBtn');
      if (addPetBtn) {
          addPetBtn.addEventListener('click', function() {
              alert('Redirecting to Add New Pet page...');
              // window.location.href = 'add-pet.html';
          });
      }

      const manageVolunteerBtn = document.getElementById('manageVolunteerBtn');
      if (manageVolunteerBtn) {
          manageVolunteerBtn.addEventListener('click', function() {
              alert('Redirecting to Volunteer Management...');
              // window.location.href = 'manage-volunteers.html';
          });
      }

      const generateReportsBtn = document.getElementById('generateReportsBtn');
      if (generateReportsBtn) {
          generateReportsBtn.addEventListener('click', function() {
              alert('Generating reports...');
              // Generate reports functionality
          });
      }

      const scheduledTasksBtn = document.getElementById('scheduledTasksBtn');
      if (scheduledTasksBtn) {
          scheduledTasksBtn.addEventListener('click', function() {
              alert('Viewing scheduled care tasks...');
              // window.location.href = 'scheduled-tasks.html';
          });
      }

      // View care dashboard button
      const viewCareDashboardBtn = document.getElementById('viewCareDashboardBtn');
      if (viewCareDashboardBtn) {
          viewCareDashboardBtn.addEventListener('click', function(e) {
              e.preventDefault();
              alert('Redirecting to Care Dashboard...');
              // window.location.href = 'care-dashboard.html';
          });
      }
  }

  function getUserRoleDisplay(role) {
      const roles = {
          'adopter': 'Pet Adopter',
          'volunteer': 'Volunteer',
          'staff': 'Staff Member',
          'coordinator': 'Coordinator',
          'admin': 'Administrator'
      };
      return roles[role] || 'Staff Member';
  }