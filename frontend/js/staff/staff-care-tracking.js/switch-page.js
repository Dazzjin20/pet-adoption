  // Calendar data and functions
    const calendarData = {
      currentDate: new Date(),
      selectedDate: new Date(),
      
      // This will now be populated from the API
      tasksByDate: {},

      // --- NEW: Fetch and process tasks from the backend ---
      async fetchAndProcessTasks() {
        try {
          const response = await fetch('http://localhost:3000/api/tasks');
          if (!response.ok) throw new Error('Failed to fetch tasks');
          const result = await response.json();
          const tasks = result.tasks || []; // Correctly access the tasks array from the response object
          
          // Reset tasksByDate
          this.tasksByDate = {};

          // Group tasks by date
          tasks.forEach(task => {
            if (task.scheduled_date) {
              const date = new Date(task.scheduled_date);
              // Adjust for timezone to prevent off-by-one day errors
              const userTimezoneOffset = date.getTimezoneOffset() * 60000;
              const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
              const dateString = adjustedDate.toDateString();

              if (!this.tasksByDate[dateString]) {
                this.tasksByDate[dateString] = [];
              }
              this.tasksByDate[dateString].push(task);
            }
          });
        } catch (error) {
          console.error("Error fetching tasks for calendar:", error);
          this.tasksByDate = {}; // Clear on error
        }
      },
      
      // Get tasks for a specific date
      getTasksForDate(date) {
        const dateString = date.toDateString();
        return this.tasksByDate[dateString] || [];
      },
      
      // Get week dates for a given date
      getWeekDates(date) {
        const weekDates = [];
        const currentDay = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const startOfWeek = new Date(date);
        
        // Adjust to start from Monday (if you want Sunday, change to 0)
        const startAdjust = currentDay === 0 ? -6 : 1 - currentDay;
        startOfWeek.setDate(date.getDate() + startAdjust);
        
        // Generate 7 days
        for (let i = 0; i < 7; i++) {
          const dayDate = new Date(startOfWeek);
          dayDate.setDate(startOfWeek.getDate() + i);
          weekDates.push(dayDate);
        }
        
        return weekDates;
      },
      
      // Format date for display
      formatDate(date) {
        const options = { month: 'long', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
      },
      
      // Check if two dates are the same day
      isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
      },
      
      // Check if date is today
      isToday(date) {
        const today = new Date();
        return this.isSameDay(date, today);
      }
    };

    // --- NEW: Functions to render the Overview Tab ---
    async function renderOverviewTab() {
      const recentCareContainer = document.querySelector('#overviewView .recent-care-card');
      const allCareContainer = document.querySelector('#overviewView .all-care-card');

      if (!recentCareContainer || !allCareContainer) return;

      // Show loading state
      recentCareContainer.innerHTML = '<p>Loading recent tasks...</p>';
      allCareContainer.innerHTML = '<p>Loading all tasks...</p>';

      try {
        const response = await fetch('http://localhost:3000/api/tasks');
        if (!response.ok) throw new Error('Failed to fetch tasks');
        const result = await response.json();
        const tasks = result.tasks || [];

        // Sort tasks by creation date, most recent first
        tasks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Render recent tasks (e.g., top 3)
        const recentTasks = tasks.slice(0, 3);
        recentCareContainer.innerHTML = recentTasks.length > 0 
          ? recentTasks.map(createOverviewTaskCard).join('') 
          : '<p class="text-muted">No recent care activities found.</p>';

        // Render all tasks
        allCareContainer.innerHTML = tasks.length > 0 
          ? tasks.map(createOverviewTaskCard).join('') 
          : '<p class="text-muted">No care activities found.</p>';

      } catch (error) {
        console.error("Error rendering overview tab:", error);
        recentCareContainer.innerHTML = '<p class="text-danger">Could not load recent tasks.</p>';
        allCareContainer.innerHTML = '<p class="text-danger">Could not load all tasks.</p>';
      }
    }

    /**
     * Creates the HTML for a single task card for the Overview tab.
     */
    function createOverviewTaskCard(task) {
      const statusClasses = { 'Pending': 'status-pending', 'In Progress': 'status-in-progress', 'Completed': 'status-completed' };
      const status = task.status || 'Pending';

      return `
        <article class="care-activity-item">
          <div class="activity-header">
            <div class="pet-name">${task.pet_id?.pet_name || 'N/A'}</div>
            <span class="status-badge ${statusClasses[status]}">${status}</span>
          </div>
          <div class="activity-details">
            <div class="activity-title">${task.title}</div>
            <div class="activity-meta">
              <div class="activity-assigned">
                <i class="fas fa-user-circle"></i>
                Created by ${task.created_by?.first_name || 'Staff'}
              </div>
              <div class="activity-time">
                <i class="far fa-calendar"></i>
                ${new Date(task.scheduled_date).toLocaleDateString()}
              </div>
            </div>
          </div>
        </article>
      `;
    }

    // --- NEW: Functions to render dynamic content for tabs ---

    /**
     * Fetches all tasks and renders them in the "Tasks" tab.
     */
    async function renderTasksTab() {
      const pendingSection = document.querySelector('#tasksView .task-section[data-status="pending"] .all-care-card');
      const inProgressSection = document.querySelector('#tasksView .task-section[data-status="in-progress"] .all-care-card');
      const completedSection = document.querySelector('#tasksView .task-section[data-status="completed"] .all-care-card');

      if (!pendingSection || !inProgressSection || !completedSection) return;

      // Show loading state
      pendingSection.innerHTML = '<p>Loading pending tasks...</p>';
      inProgressSection.innerHTML = '<p>Loading in-progress tasks...</p>';
      completedSection.innerHTML = '<p>Loading completed tasks...</p>';

      try {
        const response = await fetch('http://localhost:3000/api/tasks');
        if (!response.ok) throw new Error('Failed to fetch tasks');
        const result = await response.json();
        const tasks = result.tasks || [];

        const pendingTasks = tasks.filter(t => (t.status || 'pending').toLowerCase() === 'pending');
        const inProgressTasks = tasks.filter(t => (t.status || '').toLowerCase() === 'in progress');
        const completedTasks = tasks.filter(t => (t.status || '').toLowerCase() === 'completed');

        pendingSection.innerHTML = pendingTasks.length > 0 ? pendingTasks.map(createTaskCard).join('') : '<p class="text-muted">No pending tasks.</p>';
        inProgressSection.innerHTML = inProgressTasks.length > 0 ? inProgressTasks.map(createTaskCard).join('') : '<p class="text-muted">No tasks in progress.</p>';
        completedSection.innerHTML = completedTasks.length > 0 ? completedTasks.map(createTaskCard).join('') : '<p class="text-muted">No completed tasks.</p>';

      } catch (error) {
        console.error("Error rendering tasks tab:", error);
        pendingSection.innerHTML = '<p class="text-danger">Could not load tasks.</p>';
        inProgressSection.innerHTML = '';
        completedSection.innerHTML = '';
      }
    }

    /**
     * Creates the HTML for a single task card.
     */
    function createTaskCard(task) {
      const priorityClasses = { 'High': 'priority-high', 'Medium': 'priority-medium', 'Low': 'priority-low' };
      const statusClasses = { 'Pending': 'status-pending', 'In Progress': 'status-in-progress', 'Completed': 'status-completed' };
      
      return `
        <article class="task-item">
          <div class="task-header">
            <div class="pet-name-section">
              <div class="pet-name">${task.pet_id?.pet_name || 'N/A'}</div>
              <span class="priority-badge ${priorityClasses[task.priority] || 'priority-medium'}">${task.priority}</span>
            </div>
          </div>
          <div class="task-details">
            <div class="task-title">${task.title}</div>
          </div>
          <div class="task-status-section">
            <span class="status-badge ${statusClasses[task.status] || 'status-pending'}">${task.status || 'Pending'}</span>
          </div>
        </article>
      `;
    }

    // Initialize the page
    document.addEventListener('DOMContentLoaded', async function() {
      
      // Tab switching functionality
      const tabs = {
        'overview': { 
          tab: document.getElementById('overviewTab'), 
          view: document.getElementById('overviewView') 
        },
        'tasks': { 
          tab: document.getElementById('tasksTab'), 
          view: document.getElementById('tasksView') 
        },
        'schedule': { 
          tab: document.getElementById('scheduleTab'), 
          view: document.getElementById('scheduleView') 
        }
      };
      
      // Function to switch tabs
      async function switchToTab(tabName) {
        // Hide all views
        Object.values(tabs).forEach(tab => {
          if (tab.view) tab.view.style.display = 'none';
          if (tab.tab) tab.tab.classList.remove('active');
        });
        
        // Show selected view and activate tab
        if (tabs[tabName]) {
          if (tabs[tabName].view) tabs[tabName].view.style.display = 'grid';
          if (tabs[tabName].tab) tabs[tabName].tab.classList.add('active');
        }
        
        // If switching to schedule tab, update the calendar
        if (tabName === 'schedule') {
          await updateCalendar();
        } else if (tabName === 'tasks') {
          // If switching to tasks tab, render the tasks
          await renderTasksTab();
        } else if (tabName === 'overview') {
          // If switching to overview tab, render its content
          await renderOverviewTab();
        }
      }
      
      // Add click events to tabs
      document.getElementById('overviewTab').addEventListener('click', () => switchToTab('overview'));
      document.getElementById('tasksTab').addEventListener('click', () => switchToTab('tasks'));
      document.getElementById('scheduleTab').addEventListener('click', () => switchToTab('schedule'));
      
      // ===== OVERVIEW TAB FUNCTIONALITY =====
      // Logic is now handled by renderOverviewTab()
      
      // ===== TASKS TAB FUNCTIONALITY =====
      // The logic for adding a task is now handled by the modal in staffCareTracking.js
      
      // ===== SCHEDULE TAB FUNCTIONALITY =====
      
      // Calendar navigation
      document.getElementById('prevWeekBtn').addEventListener('click', function() {
        calendarData.currentDate.setDate(calendarData.currentDate.getDate() - 7);
        updateCalendar();
      });
      
      document.getElementById('nextWeekBtn').addEventListener('click', function() {
        calendarData.currentDate.setDate(calendarData.currentDate.getDate() + 7);
        updateCalendar();
      });
      
      // Update calendar display
      async function updateCalendar() {
        const weekDates = calendarData.getWeekDates(calendarData.currentDate);
        const today = new Date();
        
        // Update month/year display
        document.getElementById('calendarMonthYear').textContent = calendarData.formatDate(calendarData.currentDate);
        
        // Update week days header
        const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        let weekDaysHTML = '';
        weekDays.forEach(day => {
          weekDaysHTML += `<div class="week-day">${day}</div>`;
        });
        document.getElementById('weekDaysHeader').innerHTML = weekDaysHTML;
        
        // Update week dates grid
        let weekDatesHTML = '';
        weekDates.forEach(date => {
          const tasks = calendarData.getTasksForDate(date);
          const taskCount = tasks.length;
          const isToday = calendarData.isToday(date);
          const isSelected = calendarData.isSameDay(date, calendarData.selectedDate);
          const isCurrentMonth = date.getMonth() === calendarData.currentDate.getMonth();
          
          let dateClass = 'week-date';
          if (isToday) dateClass += ' today';
          if (isSelected) dateClass += ' selected';
          if (!isCurrentMonth) dateClass += ' other-month';
          
          weekDatesHTML += `
            <div class="${dateClass}" data-date="${date.toDateString()}">
              <div class="date-number">${date.getDate()}</div>
              <div class="date-tasks">${taskCount > 0 ? `${taskCount} task${taskCount !== 1 ? 's' : ''}` : ''}</div>
            </div>
          `;
        });
        document.getElementById('weekDatesGrid').innerHTML = weekDatesHTML;
        
        // Update tasks list for selected date
        updateTasksList();
        
        // Add click events to dates
        document.querySelectorAll('.week-date').forEach(dateEl => {
          dateEl.addEventListener('click', function() {
            const dateString = this.getAttribute('data-date');
            calendarData.selectedDate = new Date(dateString);
            
            // Update calendar to show selected date
            calendarData.currentDate = new Date(calendarData.selectedDate);
            updateCalendar();
          });
        });
      }
      
      // Update tasks list for selected date
      function updateTasksList() {
        const tasks = calendarData.getTasksForDate(calendarData.selectedDate);
        const today = new Date();
        const isToday = calendarData.isToday(calendarData.selectedDate);
        
        let tasksHTML = '';
        
        if (tasks.length > 0) {
          tasks.forEach(task => {
            // Calculate time display from scheduled_date
            const taskDate = new Date(task.scheduled_date);
            let timeDisplay = taskDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            if (isToday) {
              timeDisplay = `Today ${timeDisplay}`;
            } else {
              const dayDiff = Math.floor((calendarData.selectedDate - today) / (1000 * 60 * 60 * 24));
              if (dayDiff === 1) {
                timeDisplay = `Tomorrow ${task.time}`;
              } else if (dayDiff > 1) {
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const dayName = days[calendarData.selectedDate.getDay()];
                timeDisplay = `${dayName} ${timeDisplay}`;
              }
            }
            
            tasksHTML += `
              <article class="upcoming-task-item">
                <div class="upcoming-task-header">
                  <div class="upcoming-pet-name">${task.pet_id?.pet_name || 'N/A'}</div>
                  <div class="upcoming-task-time">${timeDisplay}</div>
                </div>
                
                <div class="upcoming-task-details">
                  <div class="upcoming-task-title">${task.title}</div>
                  <div class="task-meta">
                    <div class="task-assigned">
                      <i class="fas fa-user-circle"></i>
                      Created by Staff
                    </div>
                  </div>
                </div>
              </article>
            `;
          });
        } else {
          tasksHTML = `
            <div style="text-align: center; padding: 2rem; color: #666; font-style: italic;">
              No tasks scheduled for this date
            </div>
          `;
        }
        
        document.getElementById('upcomingTasksList').innerHTML = tasksHTML;
      }
      
      // --- NEW: Listen for task updates from other scripts ---
      window.addEventListener('tasksUpdated', async () => {
        await calendarData.fetchAndProcessTasks();
        await updateCalendar();
        // --- FIX: Refresh the overview and tasks tabs as well ---
        await renderOverviewTab();
        await renderTasksTab();
      });

      // Initialize with Overview tab active
      await calendarData.fetchAndProcessTasks();
      await switchToTab('overview');
    });