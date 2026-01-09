document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser || currentUser.role !== 'volunteer') {
        console.error('No volunteer logged in or incorrect role.');
        // Optionally, redirect to login
        // window.location.href = '/frontend/pages/login-form.html';
        return;
    }

    updateWelcomeMessage(currentUser);
    loadDashboardData(currentUser._id);
    setupEventListeners(); // Call this to attach button click events
});

function updateWelcomeMessage(user) {
    const welcomeElement = document.getElementById('volunteerWelcomeMessage');
    if (welcomeElement) {
        welcomeElement.textContent = `Welcome back, ${user.first_name}!`;
    }
}

async function loadDashboardData(volunteerId) {
    try {
        // Fetch all tasks
        const [staffTasksRes, careTasksRes] = await Promise.all([
            fetch('http://localhost:3000/api/staff-tasks'),
            fetch('http://localhost:3000/api/tasks')
        ]);

        if (!staffTasksRes.ok || !careTasksRes.ok) {
            throw new Error('Failed to fetch tasks');
        }

        const staffTasksData = await staffTasksRes.json();
        const careTasksData = await careTasksRes.json();

        const allTasks = [
            ...(staffTasksData.tasks || staffTasksData.data || []),
            ...(careTasksData.tasks || careTasksData.data || [])
        ];

        // Filter tasks for the current volunteer
        const volunteerTasks = allTasks.filter(task => {
            const assignedId = task.assigned_to?._id || task.assigned_to || task.assignedTo?._id || task.assignedTo;
            return assignedId === volunteerId;
        });

        // Update stats
        updateStats(volunteerTasks);

        // Update Today's Schedule
        updateTodaysSchedule(volunteerTasks);

        // Update Performance Summary
        updatePerformanceSummary(volunteerTasks);

    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function updateStats(tasks) {
    const completedTasks = tasks.filter(t => (t.status || '').toLowerCase() === 'completed');
    const totalHours = completedTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);

    document.getElementById('hoursThisMonth').textContent = `${totalHours}h`;
    document.getElementById('tasksCompleted').textContent = completedTasks.length;
    // 'Pets Helped' and 'Successful Adoptions' would need more complex logic/data
}

function updateTodaysSchedule(tasks) {
    const scheduleContainer = document.getElementById('Today-schedule-container');
    const today = new Date().toDateString();

    const todaysTasks = tasks.filter(task => {
        const taskDate = new Date(task.scheduled_date || task.dueDate).toDateString();
        return taskDate === today && (task.status || 'Pending').toLowerCase() !== 'completed';
    });

    const scheduleList = scheduleContainer.querySelector('.volunteer-schedule-item')?.parentElement;
    if (!scheduleList) return;

    scheduleList.innerHTML = ''; // Clear static items

    if (todaysTasks.length === 0) {
        scheduleList.innerHTML = '<p class="text-muted">No tasks scheduled for today. Enjoy your day!</p>';
        return;
    }

    todaysTasks.forEach(task => {
        const item = document.createElement('div');
        item.className = 'volunteer-schedule-item';
        item.innerHTML = `
            <div class="fw-semibold">${task.title}</div>
            <div class="volunteer-schedule-time">${new Date(task.scheduled_date || task.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        `;
        scheduleList.appendChild(item);
    });
}

function updatePerformanceSummary(tasks) {
    const performanceList = document.getElementById('performanceList');
    if (!performanceList) return;

    const completedTasks = tasks.filter(t => (t.status || '').toLowerCase() === 'completed').slice(0, 3); // Get last 3

    performanceList.innerHTML = ''; // Clear static items

    if (completedTasks.length === 0) {
        performanceList.innerHTML = '<li class="text-muted">No completed tasks to show yet.</li>';
        return;
    }

    completedTasks.forEach(task => {
        const item = document.createElement('li');
        item.className = 'mb-2';
        item.innerHTML = `✔ Completed: <strong>${task.title}</strong>`;
        performanceList.appendChild(item);
    });
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

    // Schedule items click events (optional interaction)
    const scheduleItems = document.querySelectorAll('.volunteer-schedule-item');
    scheduleItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            // You can add logic here if you want items to be clickable
            // const task = this.querySelector('.fw-semibold').textContent;
            // console.log('Clicked task:', task);
        });
    });
}