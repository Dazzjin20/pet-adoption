document.addEventListener('DOMContentLoaded', () => {
    initVolunteerSchedule();
});

const calendarData = {
    currentDate: new Date(),
    selectedDate: new Date(),
    tasksByDate: {},
};

async function initVolunteerSchedule() {
    // Initialize Calendar Navigation
    const prevBtn = document.getElementById('prevWeekBtn');
    const nextBtn = document.getElementById('nextWeekBtn');

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            calendarData.currentDate.setDate(calendarData.currentDate.getDate() - 7);
            updateCalendar();
        });

        nextBtn.addEventListener('click', () => {
            calendarData.currentDate.setDate(calendarData.currentDate.getDate() + 7);
            updateCalendar();
        });
    }

    // Fetch tasks and render initial view
    await fetchAndProcessTasks();
    updateCalendar();
}

async function fetchAndProcessTasks() {
    try {
        const API_URL = 'http://localhost:3000/api';
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!currentUser) {
            console.warn('No logged in user found for schedule filtering.');
            // Optionally redirect to login or show empty
            // return; 
        }
        
        // Fetch from both endpoints
        const [staffTasksRes, careTasksRes] = await Promise.all([
            fetch(`${API_URL}/staff-tasks`),
            fetch(`${API_URL}/tasks`)
        ]);

        let allTasks = [];

        if (staffTasksRes.ok) {
            const data = await staffTasksRes.json();
            const tasks = Array.isArray(data) ? data : (data.tasks || data.data || []);
            allTasks = [...allTasks, ...tasks];
        }

        if (careTasksRes.ok) {
            const data = await careTasksRes.json();
            const tasks = Array.isArray(data) ? data : (data.tasks || data.data || []);
            allTasks = [...allTasks, ...tasks];
        }

        // Filter tasks for the current volunteer
        if (currentUser) {
            allTasks = allTasks.filter(task => {
                // Check assignment (handle populated object or direct ID)
                const assignedId = task.assigned_to?._id || task.assigned_to || task.assignedTo?._id || task.assignedTo;
                const isAssigned = assignedId === currentUser._id;
                const isCompletedBy = task.completedBy === currentUser._id;
                
                return isAssigned || isCompletedBy;
            });
        }

        // Reset and Group tasks by date
        calendarData.tasksByDate = {};

        allTasks.forEach(task => {
            // Normalize date field (scheduled_date for Care Tasks, dueDate for Staff Tasks)
            const rawDate = task.scheduled_date || task.dueDate;
            
            if (rawDate) {
                const date = new Date(rawDate);
                // Validate date
                if (!isNaN(date.getTime())) {
                    const dateString = date.toDateString(); // "Mon Jan 01 2024"

                    if (!calendarData.tasksByDate[dateString]) {
                        calendarData.tasksByDate[dateString] = [];
                    }
                    calendarData.tasksByDate[dateString].push(task);
                }
            }
        });

        console.log('Tasks processed for schedule:', calendarData.tasksByDate);

    } catch (error) {
        console.error('Error fetching tasks for schedule:', error);
    }
}

function updateCalendar() {
    const monthYearEl = document.getElementById('calendarMonthYear');
    const weekDaysEl = document.getElementById('weekDaysHeader');
    const weekDatesEl = document.getElementById('weekDatesGrid');

    if (!monthYearEl || !weekDaysEl || !weekDatesEl) return;

    // Update Month/Year Display
    const options = { month: 'long', year: 'numeric' };
    monthYearEl.textContent = calendarData.currentDate.toLocaleDateString('en-US', options);

    // Generate Week Dates
    const weekDates = getWeekDates(calendarData.currentDate);
    
    // Render Days Header (Mon, Tue...)
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    weekDaysEl.innerHTML = weekDays.map(day => `<div class="week-day text-center fw-bold text-muted small py-2">${day}</div>`).join('');

    // Render Dates Grid
    let datesHTML = '';
    weekDates.forEach(date => {
        const dateString = date.toDateString();
        const tasks = calendarData.tasksByDate[dateString] || [];
        const taskCount = tasks.length;
        
        const isToday = isSameDay(date, new Date());
        const isSelected = isSameDay(date, calendarData.selectedDate);
        
        let classes = 'week-date p-2 rounded text-center cursor-pointer position-relative';
        if (isToday) classes += ' bg-primary text-white shadow-sm';
        else if (isSelected) classes += ' bg-light border border-primary text-primary';
        else classes += ' hover-bg-light';

        datesHTML += `
            <div class="${classes}" onclick="selectDate('${dateString}')">
                <div class="fw-bold fs-5">${date.getDate()}</div>
                ${taskCount > 0 ? `
                    <div class="badge rounded-pill ${isToday ? 'bg-white text-primary' : 'bg-primary text-white'} mt-1" style="font-size: 0.7rem;">
                        ${taskCount} Task${taskCount > 1 ? 's' : ''}
                    </div>
                ` : '<div class="mt-1" style="height: 18px;"></div>'}
            </div>
        `;
    });
    weekDatesEl.innerHTML = datesHTML;

    // Update the list below based on selected date
    renderTasksForSelectedDate();
}

// Global function for onclick event in HTML string
window.selectDate = (dateString) => {
    calendarData.selectedDate = new Date(dateString);
    // Also update current date to keep calendar focused if user clicks a date
    calendarData.currentDate = new Date(dateString); 
    updateCalendar();
};

function renderTasksForSelectedDate() {
    const container = document.getElementById('upcomingTasksList');
    if (!container) return;

    const dateString = calendarData.selectedDate.toDateString();
    let tasks = calendarData.tasksByDate[dateString] || [];

    // Sort: High Priority first, then by Time/Creation
    tasks.sort((a, b) => {
        const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        const pA = priorityOrder[a.priority] || 0;
        const pB = priorityOrder[b.priority] || 0;
        if (pA !== pB) return pB - pA;
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
    });

    const displayDate = calendarData.selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    
    let html = `<h5 class="mb-3 fw-bold text-dark border-bottom pb-2">Tasks for ${displayDate}</h5>`;

    if (tasks.length === 0) {
        html += `
            <div class="text-center py-5 text-muted">
                <i class="fas fa-calendar-check fs-1 mb-3 opacity-50"></i>
                <p>No tasks scheduled for this date.</p>
            </div>
        `;
    } else {
        tasks.forEach(task => {
            const title = task.title || task.taskTitle || 'Untitled Task';
            const petName = task.pet_id?.pet_name || task.pet_name || 'General Task';
            const priority = task.priority || 'Medium';
            const status = task.status || 'Pending';
            
            // Badge colors
            const priorityClass = priority === 'High' ? 'bg-danger' : (priority === 'Medium' ? 'bg-warning text-dark' : 'bg-info text-dark');
            let statusClass = 'bg-secondary';
            if (status === 'Completed') statusClass = 'bg-success';
            else if (status === 'In Progress') statusClass = 'bg-primary';
            else if (status === 'Assigned') statusClass = 'bg-info text-dark';
            else if (status === 'Pending') statusClass = 'bg-warning text-dark';

            html += `
                <div class="card mb-3 border-0 shadow-sm task-schedule-card">
                    <div class="card-body d-flex align-items-center">
                        <div class="flex-grow-1">
                            <div class="d-flex align-items-center mb-1">
                                <h6 class="fw-bold mb-0 me-2">${title}</h6>
                                <span class="badge ${priorityClass} me-1" style="font-size: 0.7rem;">${priority}</span>
                                <span class="badge ${statusClass}" style="font-size: 0.7rem;">${status}</span>
                            </div>
                            <div class="text-muted small">
                                <i class="fas fa-paw me-1"></i> ${petName} &bull; 
                                <i class="fas fa-clock me-1 ms-2"></i> ${task.estimatedHours || 1}h estimated
                            </div>
                        </div>
                        <button class="btn btn-outline-primary btn-sm rounded-pill px-3" onclick="viewTaskDetails('${task._id || task.id}')">
                            View
                        </button>
                    </div>
                </div>
            `;
        });
    }

    container.innerHTML = html;
}

window.viewTaskDetails = (taskId) => {
    // Redirect to tasks page or open modal
    // For now, we can redirect to the tasks page and maybe pass the ID
    window.location.href = `volunteer-tasks.html?taskId=${taskId}`;
};

// Helper: Get dates for the week containing the given date
function getWeekDates(currentDate) {
    const week = [];
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        week.push(date);
    }
    return week;
}

function isSameDay(d1, d2) {
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
}