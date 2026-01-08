  // Helper to fetch both Care Tasks and Staff Tasks
  async function fetchCombinedTasks() {
    try {
      const [careRes, staffRes] = await Promise.all([
        fetch('http://localhost:3000/api/tasks'),
        fetch('http://localhost:3000/api/staff-tasks')
      ]);

      let tasks = [];

      if (careRes.ok) {
        const data = await careRes.json();
        tasks = [...tasks, ...(data.tasks || data.data || [])];
      }

      if (staffRes.ok) {
        const data = await staffRes.json();
        const staffTasks = Array.isArray(data) ? data : (data.tasks || data.data || []);
        tasks = [...tasks, ...staffTasks];
      }

      return tasks;
    } catch (error) {
      console.error("Error fetching combined tasks:", error);
      return [];
    }
  }

  // Calendar data and functions
    const calendarData = {
      currentDate: new Date(),
      selectedDate: new Date(),
      
      // This will now be populated from the API
      tasksByDate: {},

      // --- NEW: Fetch and process tasks from the backend ---
      async fetchAndProcessTasks() {
        try {
          const tasks = await fetchCombinedTasks();
          
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

    // --- NEW: Helper function to update stats ---
    function updateDashboardStats(tasks) {
      const urgentCount = tasks.filter(t => t.priority === 'High' && (t.status || 'Pending').toLowerCase() !== 'completed').length;
      const pendingCount = tasks.filter(t => (t.status || 'Pending').toLowerCase() === 'pending').length;
      const progressCount = tasks.filter(t => (t.status || '').toLowerCase() === 'in progress').length;
      
      // Calculate completed today
      const today = new Date();
      // NOTE: Kung gusto mo ng TOTAL completed, alisin ang date check.
      // Sa ngayon, ito ay "Completed Today" logic:
      const completedCount = tasks.filter(t => {
          if ((t.status || '').toLowerCase() !== 'completed') return false;
          const taskDate = new Date(t.updated_at || t.created_at);
          return taskDate.getDate() === today.getDate() &&
                 taskDate.getMonth() === today.getMonth() &&
                 taskDate.getFullYear() === today.getFullYear();
      }).length;

      const elUrgent = document.getElementById('statUrgent');
      const elPending = document.getElementById('statPending');
      const elProgress = document.getElementById('statProgress');
      const elCompleted = document.getElementById('statCompleted');

      if (elUrgent) elUrgent.textContent = urgentCount;
      if (elPending) elPending.textContent = pendingCount;
      if (elProgress) elProgress.textContent = progressCount;
      if (elCompleted) elCompleted.textContent = completedCount;
    }

    // --- Overview Pagination State ---
    let overviewTasksCache = [];
    let overviewCurrentPage = 1;
    const overviewItemsPerPage = 5;

    // --- NEW: Functions to render the Overview Tab ---
    async function renderOverviewTab() {
      const recentCareContainer = document.getElementById('recentTasksList');
      const allCareContainer = document.getElementById('overviewTasksList');

      if (!recentCareContainer || !allCareContainer) return;

      // Show loading state
      recentCareContainer.innerHTML = '<p>Loading recent tasks...</p>';
      allCareContainer.innerHTML = '<p>Loading all tasks...</p>';

      try {
        const tasks = await fetchCombinedTasks();

        // Update stats immediately when Overview loads
        updateDashboardStats(tasks);

        // Sort tasks: High priority first, then by creation date
        tasks.sort((a, b) => {
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          const pA = priorityOrder[a.priority] || 0;
          const pB = priorityOrder[b.priority] || 0;
          
          if (pA !== pB) return pB - pA; // Higher priority first
          return new Date(b.created_at) - new Date(a.created_at); // Most recent first
        });

        // Cache for pagination
        overviewTasksCache = tasks;
        overviewCurrentPage = 1;

        // Render recent tasks (e.g., top 3)
        const recentTasks = tasks.slice(0, 3);
        recentCareContainer.innerHTML = recentTasks.length > 0 
          ? recentTasks.map(createOverviewTaskCard).join('') 
          : '<p class="text-muted">No recent care activities found.</p>';

        // Render all tasks
        updateOverviewTasksList();

      } catch (error) {
        console.error("Error rendering overview tab:", error);
        recentCareContainer.innerHTML = '<p class="text-danger">Could not load recent tasks.</p>';
        allCareContainer.innerHTML = '<p class="text-danger">Could not load all tasks.</p>';
      }
    }

    function updateOverviewTasksList() {
        const container = document.getElementById('overviewTasksList');
        if (!container) return;
        
        const totalItems = overviewTasksCache.length;
        const start = (overviewCurrentPage - 1) * overviewItemsPerPage;
        const end = start + overviewItemsPerPage;
        const paginatedTasks = overviewTasksCache.slice(start, end);
        
        container.innerHTML = paginatedTasks.length > 0 
            ? paginatedTasks.map(createOverviewTaskCard).join('') 
            : '<p class="text-muted">No care activities found.</p>';
            
        renderOverviewPaginationControls(totalItems);
    }

    function renderOverviewPaginationControls(totalItems) {
        const totalPages = Math.ceil(totalItems / overviewItemsPerPage);
        const start = totalItems === 0 ? 0 : (overviewCurrentPage - 1) * overviewItemsPerPage + 1;
        const end = Math.min(overviewCurrentPage * overviewItemsPerPage, totalItems);
        
        const infoEl = document.getElementById('overviewPaginationInfo');
        const prevItem = document.getElementById('overviewPrevPageItem');
        const nextItem = document.getElementById('overviewNextPageItem');
        
        if (infoEl) infoEl.textContent = `Showing ${start}-${end} of ${totalItems} tasks`;
        if (prevItem) prevItem.classList.toggle('disabled', overviewCurrentPage <= 1);
        if (nextItem) nextItem.classList.toggle('disabled', overviewCurrentPage >= totalPages);
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

    let allTasksCache = []; // Moved to global scope so renderTasksTab can access it
    let tasksCurrentPage = 1;
    const tasksItemsPerPage = 10;

    /**
     * Fetches all tasks and renders them in the "Tasks" tab.
     */
    async function renderTasksTab() {
      // FIX: Use IDs directly to ensure we select the correct containers
      const pendingSection = document.getElementById('pendingTasksContainer');
      const inProgressSection = document.getElementById('inProgressTasksContainer');
      // Completed section might not exist in HTML yet, so we make it optional to prevent errors
      const completedSection = document.querySelector('#tasksView .all-care-card[data-status="completed"]');

      if (!pendingSection || !inProgressSection) return;

      // Show loading state
      pendingSection.innerHTML = '<p>Loading pending tasks...</p>';
      inProgressSection.innerHTML = '<p>Loading in-progress tasks...</p>';
      if (completedSection) completedSection.innerHTML = '<p>Loading completed tasks...</p>';

      try {
        const tasks = await fetchCombinedTasks();

        // --- NEW: Update Cache ---
        allTasksCache = tasks;

        // Update stats using the shared function
        updateDashboardStats(tasks);

        // Apply filters (which will render the tasks)
        applyFilters();

      } catch (error) {
        console.error("Error rendering tasks tab:", error);
        pendingSection.innerHTML = '<p class="text-danger">Could not load tasks.</p>';
        inProgressSection.innerHTML = '';
        if (completedSection) completedSection.innerHTML = '';
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

    // --- NEW: Filter Logic for Tasks Tab (Moved to global scope) ---
    function applyFilters(resetPage = true) {
      if (resetPage) tasksCurrentPage = 1;

      const searchInput = document.getElementById('searchInput');
      const priorityFilter = document.getElementById('priorityFilter');
      const categoryFilter = document.getElementById('categoryFilter');
      
      const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
      const priorityVal = priorityFilter ? priorityFilter.value : 'All';
      const categoryVal = categoryFilter ? categoryFilter.value : 'All';

      let filtered = allTasksCache.filter(task => {
          // Search by Title or Pet Name
          const title = (task.title || '').toLowerCase();
          const petName = (task.pet_id?.pet_name || '').toLowerCase();
          const matchesSearch = title.includes(searchTerm) || petName.includes(searchTerm);

          // Filter by Priority
          const matchesPriority = priorityVal === 'All' || task.priority === priorityVal;

          // Filter by Task Title (Category Dropdown)
          const matchesCategory = (categoryVal === 'All' || categoryVal === '') || task.title === categoryVal;

          return matchesSearch && matchesPriority && matchesCategory;
      });

      // Sort tasks: High priority first, then by creation date
      filtered.sort((a, b) => {
        const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        const pA = priorityOrder[a.priority] || 0;
        const pB = priorityOrder[b.priority] || 0;
        
        if (pA !== pB) return pB - pA; 
        return new Date(b.created_at) - new Date(a.created_at);
      });

      // Pagination Logic
      const totalItems = filtered.length;
      const startIndex = (tasksCurrentPage - 1) * tasksItemsPerPage;
      const endIndex = startIndex + tasksItemsPerPage;
      const paginatedTasks = filtered.slice(startIndex, endIndex);

      renderFilteredTasks(paginatedTasks);
      renderTasksPaginationControls(totalItems);
    }

    function renderTasksPaginationControls(totalItems) {
      const totalPages = Math.ceil(totalItems / tasksItemsPerPage);
      const start = totalItems === 0 ? 0 : (tasksCurrentPage - 1) * tasksItemsPerPage + 1;
      const end = Math.min(tasksCurrentPage * tasksItemsPerPage, totalItems);
      
      const infoEl = document.getElementById('tasksPaginationInfo');
      const prevItem = document.getElementById('tasksPrevPageItem');
      const nextItem = document.getElementById('tasksNextPageItem');
      
      if (infoEl) infoEl.textContent = `Showing ${start}-${end} of ${totalItems} tasks`;
      
      if (prevItem) prevItem.classList.toggle('disabled', tasksCurrentPage <= 1);
      if (nextItem) nextItem.classList.toggle('disabled', tasksCurrentPage >= totalPages);
    }

    function renderFilteredTasks(tasks) {
      // Sort tasks: High priority first, then by creation date
      tasks.sort((a, b) => {
        const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        const pA = priorityOrder[a.priority] || 0;
        const pB = priorityOrder[b.priority] || 0;
        
        if (pA !== pB) return pB - pA; 
        return new Date(b.created_at) - new Date(a.created_at);
      });

      const pendingSection = document.getElementById('pendingTasksContainer');
      const inProgressSection = document.getElementById('inProgressTasksContainer');
      const completedSection = document.querySelector('#tasksView .all-care-card[data-status="completed"]');

      const pendingTasks = tasks.filter(t => (t.status || 'pending').toLowerCase() === 'pending');
      const inProgressTasks = tasks.filter(t => (t.status || '').toLowerCase() === 'in progress');
      const completedTasks = tasks.filter(t => (t.status || '').toLowerCase() === 'completed');

      if (pendingSection) pendingSection.innerHTML = pendingTasks.length > 0 ? pendingTasks.map(createTaskCard).join('') : '<p class="text-muted p-3">No pending tasks found matching criteria.</p>';
      if (inProgressSection) inProgressSection.innerHTML = inProgressTasks.length > 0 ? inProgressTasks.map(createTaskCard).join('') : '<p class="text-muted p-3">No tasks in progress found matching criteria.</p>';
      if (completedSection) completedSection.innerHTML = completedTasks.length > 0 ? completedTasks.map(createTaskCard).join('') : '<p class="text-muted p-3">No completed tasks found matching criteria.</p>';
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

      // Go to Today button
      document.getElementById('todayBtn').addEventListener('click', function() {
        const today = new Date();
        calendarData.currentDate = new Date(today);
        calendarData.selectedDate = new Date(today);
        scheduleCurrentPage = 1; // Reset pagination
        updateCalendar();
      });
      
      // Schedule Pagination State
      let scheduleCurrentPage = 1;
      const scheduleItemsPerPage = 5;

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
        // Get tasks and create a copy to sort
        let tasks = [...calendarData.getTasksForDate(calendarData.selectedDate)];
        
        // Sort tasks: High priority first for the schedule list
        tasks.sort((a, b) => {
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          const pA = priorityOrder[a.priority] || 0;
          const pB = priorityOrder[b.priority] || 0;
          return pB - pA;
        });

        // Pagination Logic
        const totalItems = tasks.length;
        const start = (scheduleCurrentPage - 1) * scheduleItemsPerPage;
        const end = start + scheduleItemsPerPage;
        const paginatedTasks = tasks.slice(start, end);

        const today = new Date();
        const isToday = calendarData.isToday(calendarData.selectedDate);
        
        let tasksHTML = '';
        
        if (paginatedTasks.length > 0) {
          paginatedTasks.forEach(task => {
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
        renderSchedulePaginationControls(totalItems);
      }

      function renderSchedulePaginationControls(totalItems) {
        const totalPages = Math.ceil(totalItems / scheduleItemsPerPage);
        const start = totalItems === 0 ? 0 : (scheduleCurrentPage - 1) * scheduleItemsPerPage + 1;
        const end = Math.min(scheduleCurrentPage * scheduleItemsPerPage, totalItems);
        
        const infoEl = document.getElementById('schedulePaginationInfo');
        const prevItem = document.getElementById('schedulePrevPageItem');
        const nextItem = document.getElementById('scheduleNextPageItem');
        
        if (infoEl) infoEl.textContent = `Showing ${start}-${end} of ${totalItems} tasks`;
        
        if (prevItem) prevItem.classList.toggle('disabled', scheduleCurrentPage <= 1);
        if (nextItem) nextItem.classList.toggle('disabled', scheduleCurrentPage >= totalPages);
      }
      
      // --- NEW: Listen for task updates from other scripts ---
      window.addEventListener('tasksUpdated', async () => {
        await calendarData.fetchAndProcessTasks();
        await updateCalendar();
        // --- FIX: Refresh the overview and tasks tabs as well ---
        await renderOverviewTab();
        await renderTasksTab();
      });

      // --- NEW: Filter Event Listeners ---
      const searchInput = document.getElementById('searchInput');
      if (searchInput) searchInput.addEventListener('input', applyFilters);
      
      const priorityFilter = document.getElementById('priorityFilter');
      if (priorityFilter) priorityFilter.addEventListener('change', applyFilters);
      
      const categoryFilter = document.getElementById('categoryFilter');
      if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);

      const resetBtn = document.getElementById('resetFiltersBtn');
      if (resetBtn) {
          resetBtn.addEventListener('click', () => {
              if (searchInput) searchInput.value = '';
              if (priorityFilter) priorityFilter.value = 'All';
              if (categoryFilter) categoryFilter.value = 'All';
              applyFilters();
          });
      }

      // --- NEW: Tasks Tab Pagination Event Listeners ---
      const tasksPrevBtn = document.getElementById('tasksPrevPageBtn');
      const tasksNextBtn = document.getElementById('tasksNextPageBtn');
      
      if (tasksPrevBtn) {
          tasksPrevBtn.addEventListener('click', (e) => {
              e.preventDefault();
              if (tasksCurrentPage > 1) {
                  tasksCurrentPage--;
                  applyFilters(false); // Don't reset page
              }
          });
      }
      
      if (tasksNextBtn) {
          tasksNextBtn.addEventListener('click', (e) => {
              e.preventDefault();
              // Check if disabled class is present on parent li
              if (!e.target.parentElement.classList.contains('disabled')) {
                  tasksCurrentPage++;
                  applyFilters(false); // Don't reset page
              }
          });
      }

      // --- NEW: Schedule Pagination Event Listeners ---
      const schedulePrevBtn = document.getElementById('schedulePrevPageBtn');
      const scheduleNextBtn = document.getElementById('scheduleNextPageBtn');
      
      if (schedulePrevBtn) {
          schedulePrevBtn.addEventListener('click', (e) => {
              e.preventDefault();
              if (scheduleCurrentPage > 1) {
                  scheduleCurrentPage--;
                  updateTasksList();
              }
          });
      }
      
      if (scheduleNextBtn) {
          scheduleNextBtn.addEventListener('click', (e) => {
              e.preventDefault();
              if (!e.target.parentElement.classList.contains('disabled')) {
                  scheduleCurrentPage++;
                  updateTasksList();
              }
          });
      }

      // --- NEW: Overview Pagination Event Listeners ---
      const overviewPrevBtn = document.getElementById('overviewPrevPageBtn');
      const overviewNextBtn = document.getElementById('overviewNextPageBtn');
      
      if (overviewPrevBtn) {
          overviewPrevBtn.addEventListener('click', (e) => {
              e.preventDefault();
              if (overviewCurrentPage > 1) {
                  overviewCurrentPage--;
                  updateOverviewTasksList();
              }
          });
      }
      
      if (overviewNextBtn) {
          overviewNextBtn.addEventListener('click', (e) => {
              e.preventDefault();
              // Check if disabled class is present on parent li
              if (!e.target.parentElement.classList.contains('disabled')) {
                  overviewCurrentPage++;
                  updateOverviewTasksList();
              }
          });
      }

      // Initialize with Overview tab active
      await calendarData.fetchAndProcessTasks();
      await switchToTab('overview');
    });