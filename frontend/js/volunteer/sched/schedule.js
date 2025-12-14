// schedule.js - Professional version without emojis
document.addEventListener('DOMContentLoaded', function() {
    console.log('Schedule Integration Loaded');
    
    const API_URL = 'http://localhost:3000/api';
    let currentDate = new Date();
    let allTasks = [];
    let tasksByDate = new Map();
    
    // Initialize
    initializeEverything();
    
    async function initializeEverything() {
        const loaded = await loadAllTasks();
        if (loaded) {
            updateCalendar(currentDate);
            loadUpcomingTasks();
            updateDashboardStats();
        }
    }
    
    // Parse task date
    function parseTaskDate(dateString) {
        if (!dateString) return null;
        
        try {
            // Format: "12/08/2025" (MM/DD/YYYY)
            if (dateString.includes('/')) {
                const parts = dateString.split('/');
                if (parts.length === 3) {
                    const month = parseInt(parts[0], 10) - 1;
                    const day = parseInt(parts[1], 10);
                    const year = parseInt(parts[2], 10);
                    
                    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
                        return new Date(year, month, day);
                    }
                }
            }
            
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? null : date;
            
        } catch (e) {
            console.error('Error parsing date:', dateString, e);
            return null;
        }
    }
    
    // Format date as YYYY-MM-DD
    function formatDateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // Load all tasks
    async function loadAllTasks() {
        try {
            console.log('Loading tasks...');
            const response = await fetch(`${API_URL}/tasks`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }
            
            const data = await response.json();
            allTasks = extractTasks(data);
            
            console.log(`Total tasks: ${allTasks.length}`);
            
            // Group tasks by date
            groupAllTasksByDate();
            
            return true;
        } catch (error) {
            console.error('Error loading tasks:', error);
            allTasks = [];
            return false;
        }
    }
    
    // Group all tasks by date
    function groupAllTasksByDate() {
        tasksByDate.clear();
        
        allTasks.forEach(task => {
            const dateString = task.dueDate || task.createdAt;
            if (!dateString) return;
            
            const date = parseTaskDate(dateString);
            if (!date) return;
            
            const dateKey = formatDateKey(date);
            
            if (!tasksByDate.has(dateKey)) {
                tasksByDate.set(dateKey, []);
            }
            
            tasksByDate.get(dateKey).push(task);
        });
        
        // Sort tasks within each date
        for (const [dateKey, tasks] of tasksByDate) {
            tasks.sort((a, b) => {
                const statusA = (a.status || '').toLowerCase();
                const statusB = (b.status || '').toLowerCase();
                const isCompletedA = ['completed', 'complete'].includes(statusA);
                const isCompletedB = ['completed', 'complete'].includes(statusB);
                
                if (isCompletedA && !isCompletedB) return 1;
                if (!isCompletedA && isCompletedB) return -1;
                
                const titleA = (a.title || '').toLowerCase();
                const titleB = (b.title || '').toLowerCase();
                return titleA.localeCompare(titleB);
            });
        }
    }
    
    // Extract tasks from API
    function extractTasks(data) {
        if (Array.isArray(data)) return data;
        if (data && typeof data === 'object') {
            if (Array.isArray(data.tasks)) return data.tasks;
            if (Array.isArray(data.data)) return data.data;
            
            const results = [];
            for (const key in data) {
                const value = data[key];
                if (Array.isArray(value)) {
                    const firstItem = value[0];
                    if (firstItem && typeof firstItem === 'object' && firstItem.title) {
                        results.push(...value);
                    }
                }
            }
            return results;
        }
        return [];
    }
    
    // Generate calendar
    function updateCalendar(date) {
        const calendarGrid = document.getElementById('calendarGrid');
        const currentWeekElement = document.getElementById('currentWeek');
        
        if (!calendarGrid || !currentWeekElement) return;
        
        calendarGrid.innerHTML = '';
        
        // Get start of week (Sunday)
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        
        // Get end of week (Saturday)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        // Update week display
        currentWeekElement.textContent = 
            `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ` +
            `${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ` +
            `${endOfWeek.getFullYear()}`;
        
        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Generate calendar days
        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(startOfWeek);
            currentDay.setDate(startOfWeek.getDate() + i);
            currentDay.setHours(0, 0, 0, 0);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            // Highlight today
            if (currentDay.getTime() === today.getTime()) {
                dayElement.classList.add('today');
            }
            
            // Day name
            const dayName = document.createElement('div');
            dayName.className = 'day-name';
            dayName.textContent = currentDay.toLocaleDateString('en-US', { weekday: 'short' });
            
            // Day number
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = currentDay.getDate();
            
            dayElement.appendChild(dayName);
            dayElement.appendChild(dayNumber);
            
            // Get tasks for this day
            const dateKey = formatDateKey(currentDay);
            const tasksForDay = tasksByDate.get(dateKey) || [];
            const totalTasks = tasksForDay.length;
            
            if (totalTasks > 0) {
                const completedCount = tasksForDay.filter(task => {
                    const status = (task.status || '').toLowerCase();
                    return ['completed', 'complete'].includes(status);
                }).length;
                
                const activeCount = totalTasks - completedCount;
                
                const taskElement = document.createElement('div');
                taskElement.className = 'day-task';
                
                taskElement.innerHTML = `
                    <div class="task-count">${totalTasks} task${totalTasks > 1 ? 's' : ''}</div>
                    <div class="task-breakdown">
                        <span class="active-tasks">${activeCount} active</span>
                        <span class="completed-tasks">${completedCount} completed</span>
                    </div>
                `;
                
                dayElement.appendChild(taskElement);
                dayElement.dataset.dateKey = dateKey;
            } else {
                const noTaskElement = document.createElement('div');
                noTaskElement.className = 'no-tasks';
                noTaskElement.textContent = 'No tasks';
                dayElement.appendChild(noTaskElement);
            }
            
            // Click event
            dayElement.addEventListener('click', function() {
                document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
                this.classList.add('selected');
                
                const selectedDateKey = this.dataset.dateKey;
                if (selectedDateKey) {
                    showTasksForDate(selectedDateKey);
                }
            });
            
            calendarGrid.appendChild(dayElement);
        }
    }
    
    // Show tasks for specific date
    function showTasksForDate(dateKey) {
        const tasks = tasksByDate.get(dateKey) || [];
        
        if (tasks.length === 0) {
            const [year, month, day] = dateKey.split('-');
            const date = new Date(year, month - 1, day);
            const dateStr = date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
            });
            
            alert(`No tasks scheduled for ${dateStr}`);
            return;
        }
        
        const [year, month, day] = dateKey.split('-');
        const date = new Date(year, month - 1, day);
        const dateStr = date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Create task list HTML
        let taskListHTML = `
            <div class="task-modal">
                <div class="modal-header">
                    <h5>Tasks for ${dateStr}</h5>
                    <div class="total-count">${tasks.length} task${tasks.length > 1 ? 's' : ''}</div>
                </div>
                <div class="task-list">
        `;
        
        tasks.forEach((task, index) => {
            const status = (task.status || '').toLowerCase();
            const isCompleted = ['completed', 'complete'].includes(status);
            const statusClass = isCompleted ? 'status-completed' : 'status-active';
            const statusText = isCompleted ? 'Completed' : 'Active';
            
            taskListHTML += `
                <div class="task-item ${statusClass}">
                    <div class="task-header">
                        <div class="task-title">${index + 1}. ${task.title || 'Untitled Task'}</div>
                        <div class="task-status">${statusText}</div>
                    </div>
                    <div class="task-details">
                        <div class="detail-row">
                            <span class="detail-label">Location:</span>
                            <span class="detail-value">${task.location || 'Shelter'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Estimated Time:</span>
                            <span class="detail-value">${task.estimatedHours || 1} hour${task.estimatedHours !== 1 ? 's' : ''}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Category:</span>
                            <span class="detail-value">${task.category || task.type || 'General'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Priority:</span>
                            <span class="detail-value priority-${(task.priority || 'medium').toLowerCase()}">${task.priority || 'Medium'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Points:</span>
                            <span class="detail-value">${task.points || 20}</span>
                        </div>
                        ${task.description ? `
                        <div class="task-description">
                            <div class="detail-label">Description:</div>
                            <div class="description-text">${task.description}</div>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        taskListHTML += `
                </div>
                <div class="modal-footer">
                    <button onclick="viewInTasksPage('${dateKey}')" class="btn-view-tasks">View in Tasks Page</button>
                    <button onclick="closeTaskModal()" class="btn-close">Close</button>
                </div>
            </div>
        `;
        
        // Create modal
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.innerHTML = taskListHTML;
        
        // Add to page
        document.body.appendChild(modalOverlay);
        
        // Add modal styles if not already added
        addModalStyles();
    }
    
    // View tasks in main tasks page
    window.viewInTasksPage = function(dateKey) {
        sessionStorage.setItem('filterByDate', dateKey);
        window.location.href = 'volunteer-tasks.html';
    };
    
    // Close modal
    window.closeTaskModal = function() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }
    };
    
    // Week navigation
    window.changeWeek = function(direction) {
        currentDate.setDate(currentDate.getDate() + (direction * 7));
        updateCalendar(currentDate);
    };
    
    // Load upcoming tasks for sidebar
    function loadUpcomingTasks() {
        const upcomingTasksList = document.getElementById('upcomingTasksList');
        const upcomingCount = document.getElementById('upcomingCount');
        const upcomingTasksNumber = document.getElementById('upcomingTasks');
        const totalHours = document.getElementById('totalHours');
        
        if (!upcomingTasksList) return;
        
        // Get today and upcoming active tasks
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const upcomingTasks = [];
        for (const [dateKey, tasks] of tasksByDate) {
            const [year, month, day] = dateKey.split('-');
            const taskDate = new Date(year, month - 1, day);
            
            if (taskDate >= today) {
                tasks.forEach(task => {
                    const status = (task.status || '').toLowerCase();
                    const isCompleted = ['completed', 'complete'].includes(status);
                    
                    if (!isCompleted) {
                        upcomingTasks.push({
                            ...task,
                            dateKey: dateKey,
                            taskDate: taskDate
                        });
                    }
                });
            }
        }
        
        // Sort and get first 5
        upcomingTasks.sort((a, b) => a.taskDate - b.taskDate);
        const displayTasks = upcomingTasks.slice(0, 5);
        
        // Update stats
        const totalUpcoming = upcomingTasks.length;
        const totalHoursCount = upcomingTasks.reduce((sum, task) => {
            return sum + (parseFloat(task.estimatedHours) || 1);
        }, 0);
        
        if (upcomingCount) upcomingCount.textContent = `${totalUpcoming} task${totalUpcoming !== 1 ? 's' : ''}`;
        if (upcomingTasksNumber) upcomingTasksNumber.textContent = totalUpcoming;
        if (totalHours) totalHours.textContent = `${Math.round(totalHoursCount)}h`;
        
        // Display tasks
        displayUpcomingTasks(displayTasks, upcomingTasksList);
    }
    
    // Display upcoming tasks
    function displayUpcomingTasks(tasks, container) {
        container.innerHTML = '';
        
        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="no-upcoming-tasks">
                    <div class="no-tasks-icon">📅</div>
                    <div class="no-tasks-text">No upcoming tasks scheduled</div>
                </div>
            `;
            return;
        }
        
        tasks.forEach(task => {
            const [year, month, day] = task.dateKey.split('-');
            const taskDate = new Date(year, month - 1, day);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            let dateDisplay = '';
            const diffDays = Math.floor((taskDate - today) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) dateDisplay = 'Today';
            else if (diffDays === 1) dateDisplay = 'Tomorrow';
            else dateDisplay = taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            const description = task.description || 'No description available';
            const shortDesc = description.length > 80 ? description.substring(0, 80) + '...' : description;
            
            const taskElement = document.createElement('div');
            taskElement.className = 'upcoming-task-item';
            taskElement.innerHTML = `
                <div class="upcoming-task-header">
                    <div class="upcoming-task-title">${task.title || 'Untitled Task'}</div>
                    <div class="upcoming-task-date">${dateDisplay}</div>
                </div>
                <div class="upcoming-task-details">
                    <div class="task-category">${task.category || 'General'}</div>
                    <div class="task-duration">${task.estimatedHours || 1}h</div>
                    <div class="task-points">${task.points || 20} points</div>
                </div>
                <div class="upcoming-task-description">${shortDesc}</div>
            `;
            
            taskElement.addEventListener('click', () => {
                showTasksForDate(task.dateKey);
            });
            
            container.appendChild(taskElement);
        });
    }
    
    // Update dashboard stats
    function updateDashboardStats() {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        const monthlyTasks = allTasks.filter(task => {
            const dateStr = task.dueDate || task.createdAt;
            if (!dateStr) return false;
            
            const date = parseTaskDate(dateStr);
            if (!date) return false;
            
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });
        
        const completedTasks = monthlyTasks.filter(task => {
            const status = (task.status || '').toLowerCase();
            return ['completed', 'complete'].includes(status);
        });
        
        const totalHours = completedTasks.reduce((sum, task) => {
            return sum + (parseFloat(task.estimatedHours) || 1);
        }, 0);
        
        const tasksElement = document.getElementById('tasksCompleted');
        const hoursElement = document.getElementById('hoursThisMonth');
        
        if (tasksElement) tasksElement.textContent = completedTasks.length;
        if (hoursElement) hoursElement.textContent = Math.round(totalHours);
    }
    
    // Add modal styles
    function addModalStyles() {
        if (document.getElementById('task-modal-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'task-modal-styles';
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                padding: 20px;
            }
            
            .task-modal {
                background: white;
                border-radius: 12px;
                width: 100%;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            }
            
            .modal-header {
                padding: 20px 24px;
                border-bottom: 1px solid #eaeaea;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .modal-header h5 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                color: #333;
            }
            
            .total-count {
                background: #41b883;
                color: white;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 500;
            }
            
            .task-list {
                padding: 20px 24px;
            }
            
            .task-item {
                background: #fafafa;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 12px;
                border-left: 4px solid #41b883;
            }
            
            .task-item.status-completed {
                border-left-color: #28a745;
                opacity: 0.9;
            }
            
            .task-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 12px;
            }
            
            .task-title {
                font-weight: 600;
                color: #333;
                font-size: 16px;
                flex: 1;
            }
            
            .task-status {
                font-size: 12px;
                font-weight: 500;
                padding: 4px 10px;
                border-radius: 12px;
                background: #e9f7ef;
                color: #2d8057;
            }
            
            .status-completed .task-status {
                background: #d4edda;
                color: #155724;
            }
            
            .task-details {
                font-size: 13px;
            }
            
            .detail-row {
                display: flex;
                margin-bottom: 6px;
                align-items: center;
            }
            
            .detail-label {
                color: #666;
                min-width: 100px;
                font-weight: 500;
            }
            
            .detail-value {
                color: #333;
            }
            
            .priority-high {
                color: #dc3545;
                font-weight: 500;
            }
            
            .priority-medium {
                color: #fd7e14;
                font-weight: 500;
            }
            
            .priority-low {
                color: #28a745;
                font-weight: 500;
            }
            
            .task-description {
                margin-top: 10px;
                padding-top: 10px;
                border-top: 1px solid #eee;
            }
            
            .description-text {
                color: #555;
                line-height: 1.5;
                margin-top: 4px;
            }
            
            .modal-footer {
                padding: 16px 24px;
                border-top: 1px solid #eaeaea;
                display: flex;
                gap: 10px;
                justify-content: flex-end;
            }
            
            .btn-view-tasks {
                background: #41b883;
                color: white;
                border: none;
                padding: 8px 20px;
                border-radius: 6px;
                font-weight: 500;
                cursor: pointer;
                transition: background 0.2s;
            }
            
            .btn-view-tasks:hover {
                background: #369c6e;
            }
            
            .btn-close {
                background: #f8f9fa;
                color: #666;
                border: 1px solid #dee2e6;
                padding: 8px 20px;
                border-radius: 6px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .btn-close:hover {
                background: #e9ecef;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // Add main styles
    function addMainStyles() {
        if (document.getElementById('schedule-main-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'schedule-main-styles';
        style.textContent = `
            /* Calendar Styles */
            .calendar-day {
                background: white;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                padding: 12px;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .calendar-day:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                border-color: #41b883;
            }
            
            .calendar-day.selected {
                border-color: #41b883;
                background-color: #f8fdfa;
                box-shadow: 0 0 0 2px rgba(65, 184, 131, 0.1);
            }
            
            .calendar-day.today {
                border-color: #ff6b6b;
                background-color: #fff5f5;
            }
            
            .day-name {
                font-size: 12px;
                color: #666;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 4px;
            }
            
            .day-number {
                font-size: 20px;
                font-weight: 600;
                color: #333;
                margin-bottom: 8px;
            }
            
            .day-task {
                font-size: 12px;
            }
            
            .task-count {
                font-weight: 600;
                color: #333;
                margin-bottom: 2px;
            }
            
            .task-breakdown {
                display: flex;
                justify-content: space-between;
                font-size: 10px;
                color: #888;
            }
            
            .active-tasks {
                color: #41b883;
            }
            
            .completed-tasks {
                color: #28a745;
            }
            
            .no-tasks {
                color: #999;
                font-size: 11px;
            }
            
            /* Upcoming Tasks Styles */
            .upcoming-task-item {
                background: white;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                padding: 14px;
                margin-bottom: 10px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .upcoming-task-item:hover {
                border-color: #41b883;
                box-shadow: 0 2px 8px rgba(65, 184, 131, 0.1);
            }
            
            .upcoming-task-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 8px;
            }
            
            .upcoming-task-title {
                font-weight: 600;
                color: #333;
                font-size: 15px;
                flex: 1;
            }
            
            .upcoming-task-date {
                color: #41b883;
                font-weight: 500;
                font-size: 12px;
                background: #f0f9f4;
                padding: 2px 10px;
                border-radius: 12px;
            }
            
            .upcoming-task-details {
                display: flex;
                gap: 8px;
                margin-bottom: 8px;
                flex-wrap: wrap;
            }
            
            .task-category, .task-duration, .task-points {
                background: #e9f7ef;
                color: #2d8057;
                padding: 3px 10px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 500;
            }
            
            .upcoming-task-description {
                color: #666;
                font-size: 13px;
                line-height: 1.4;
            }
            
            .no-upcoming-tasks {
                text-align: center;
                padding: 30px 20px;
                color: #999;
            }
            
            .no-tasks-icon {
                font-size: 32px;
                margin-bottom: 10px;
                opacity: 0.5;
            }
            
            .no-tasks-text {
                font-size: 14px;
            }
            
            /* Stat Cards */
            .schedule-stat-card {
                background: white;
                border: 1px solid #e0e0e0;
                border-radius: 10px;
                padding: 20px;
                transition: all 0.3s ease;
            }
            
            .schedule-stat-card:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
            }
            
            .schedule-stat-number {
                font-size: 32px;
                font-weight: 700;
                color: #41b883;
                margin-bottom: 4px;
            }
            
            .schedule-stat-label {
                font-weight: 600;
                color: #333;
                margin-bottom: 2px;
            }
            
            .schedule-stat-sub {
                color: #666;
                font-size: 13px;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // Initialize styles
    addMainStyles();
});