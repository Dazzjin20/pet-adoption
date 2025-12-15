// Check if we should filter by date (from schedule page)
const filterDate = sessionStorage.getItem('filterByDate');
if (filterDate) {
    // Filter tasks by this date
    // ... your filtering logic here
    sessionStorage.removeItem('filterByDate');
}

// Check if specific task was selected
const selectedTaskId = sessionStorage.getItem('selectedTaskId');
if (selectedTaskId) {
    // Find and select this task
    const task = allTasks.find(t => (t._id || t.id) === selectedTaskId);
    if (task) {
        selectTaskForWork(task);
    }
    sessionStorage.removeItem('selectedTaskId');
}


// task-integration.js - Works with your existing backend
document.addEventListener('DOMContentLoaded', function() {
    console.log('Task Integration Loaded');
    
    // Configuration
    const API_URL = 'http://localhost:3000/api';
    const VOLUNTEER_ID = 'volunteer123'; // Change to actual volunteer ID
    const VOLUNTEER_NAME = 'Daks Pangilinan'; // Change to actual volunteer name
    
    // Store tasks
    let allTasks = [];
    let completedTasks = [];
    let activeTask = null;
    let activeTimers = new Map();
    
    // Override the showTab function
    const originalShowTab = window.showTab;
    window.showTab = function(tabName) {
        // Call original function
        if (originalShowTab) {
            originalShowTab(tabName);
        }
        
        // Load appropriate content
        if (tabName === 'assigned') {
            loadAssignedTasks();
        } else if (tabName === 'completed') {
            loadCompletedTasks();
        }
    };
    
    // Load tasks for Assigned tab
    async function loadAssignedTasks() {
        const loadingEl = document.getElementById('staffTasksLoading');
        const emptyEl = document.getElementById('staffTasksEmpty');
        const container = document.getElementById('dynamicStaffTasks');
        
        // Show loading state
        if (loadingEl) loadingEl.style.display = 'block';
        if (emptyEl) emptyEl.style.display = 'none';
        if (container) container.innerHTML = '';
        
        try {
            // Fetch from both endpoints simultaneously
            const [staffTasksResponse, careTasksResponse] = await Promise.all([
                fetch(`${API_URL}/staff-tasks`),
                fetch(`${API_URL}/tasks`)
            ]);
            
            if (!staffTasksResponse.ok || !careTasksResponse.ok) {
                throw new Error('Failed to fetch tasks');
            }
            
            const staffTasksData = await staffTasksResponse.json();
            const careTasksData = await careTasksResponse.json();

            const staffTasks = extractTasks(staffTasksData);
            const careTasks = extractTasks(careTasksData);
            
            // Combine the tasks from both collections
            allTasks = [...staffTasks, ...careTasks];

            // Hide loading
            if (loadingEl) loadingEl.style.display = 'none';
            
            // Filter out completed tasks - use status field
            const activeTasks = allTasks.filter(task => {
                const status = (task.status || '').toLowerCase();
                return status !== 'completed' && status !== 'done' && status !== 'finished';
            });
            
            if (activeTasks.length === 0) {
                if (emptyEl) emptyEl.style.display = 'block';
                return;
            }
            
            // Add staff-assigned tasks
            activeTasks.forEach(task => {
                const taskCard = createStaffTaskCard(task);
                container.appendChild(taskCard);
            });
            
        } catch (error) {
            console.error('Error loading tasks:', error);
            if (loadingEl) loadingEl.style.display = 'none';
            if (emptyEl) emptyEl.style.display = 'block';
        }
    }
    
    // Load completed tasks
    async function loadCompletedTasks() {
        const container = document.getElementById('dynamicCompletedTasks');
        const emptyEl = document.getElementById('completedTabEmpty');
        
        if (!container) return;
        
        // Clear previous content
        container.innerHTML = '';
        
        try {
            // Get ALL tasks and filter completed ones
            const [staffTasksResponse, careTasksResponse] = await Promise.all([
                fetch(`${API_URL}/staff-tasks`),
                fetch(`${API_URL}/tasks`)
            ]);
            
            if (staffTasksResponse.ok && careTasksResponse.ok) {
                const staffTasksData = await staffTasksResponse.json();
                const careTasksData = await careTasksResponse.json();

                const allStaffTasks = extractTasks(staffTasksData);
                const allCareTasks = extractTasks(careTasksData);
                
                // Filter completed tasks
                completedTasks = [...allStaffTasks, ...allCareTasks].filter(task => {
                    const status = (task.status || '').toLowerCase();
                    return status === 'completed' || status === 'done' || status === 'finished';
                });
                
                if (completedTasks.length === 0) {
                    if (emptyEl) emptyEl.style.display = 'block';
                    return;
                }
                
                if (emptyEl) emptyEl.style.display = 'none';
                
                // Display completed tasks
                completedTasks.forEach(task => {
                    const completedCard = createCompletedTaskCard(task);
                    container.appendChild(completedCard);
                });
            } else {    
                throw new Error('Failed to fetch tasks');
            }
            
        } catch (error) {
            console.error('Error loading completed tasks:', error);
            if (emptyEl) emptyEl.style.display = 'block';
        }
    }
    
    // Create staff task card for Assigned tab
    function createStaffTaskCard(task) {
        const div = document.createElement('div');
        div.className = 'staff-task-card task-item mb-3';
        div.setAttribute('data-task-id', task._id || task.id);
        
        const taskId = task._id || task.id;
        const title = task.title || task.taskTitle || 'Staff Task';
        const description = task.description || 'No description provided';
        const category = task.category || task.type || 'General';
        const priority = task.priority || 'Medium';
        const dueDate = task.dueDate || 'ASAP';
        const points = task.points || task.reward || 20;
        const estimatedHours = task.estimatedHours || task.hours || 1;
        const location = task.location || 'Shelter';
        
        const formattedDate = formatDate(dueDate);
        const priorityClass = getPriorityClass(priority);
        const categoryClass = getCategoryClass(category);
        
        div.innerHTML = `
            <div class="task-item-header">
                <div class="task-title-row">
                    <h6 class="task-title mb-1">${title}</h6>
                    <span class="task-points">${points} points</span>
                </div>
                <div class="task-meta-row">
                    <span class="task-category ${categoryClass}">${category}</span>
                    <span class="task-priority ${priorityClass}">${priority}</span>
                    <span class="task-duration">${estimatedHours}h</span>
                </div>
            </div>
            
            <div class="task-item-body">
                <p class="task-description-text mb-2">${truncateText(description, 100)}</p>
                
                <div class="task-details-row">
                    <div class="task-detail">
                        <span class="detail-label">Due:</span>
                        <span class="detail-value">${formattedDate}</span>
                    </div>
                    <div class="task-detail">
                        <span class="detail-label">Location:</span>
                        <span class="detail-value">${location}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Add click event to entire card
        div.onclick = function(e) {
            selectTaskForWork(task);
        };
        
        return div;
    }
    
    // When task is clicked in Assigned tab
    function selectTaskForWork(task) {
        // Check if task is already completed
        const status = (task.status || '').toLowerCase();
        if (status === 'completed' || status === 'done' || status === 'finished') {
            alert('This task has already been completed. Please select an active task.');
            return; // Don't proceed
        }
        
        activeTask = task;
        
        // Switch to Task tab
        document.querySelectorAll('.tasks-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.textContent.toLowerCase() === 'task') {
                tab.classList.add('active');
            }
        });
        
        // Show Task tab
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        
        const taskTab = document.getElementById('taskTab');
        taskTab.style.display = 'block';
        
        // Display the selected task
        displaySelectedTask(task);
        
        // Remove this task from Assigned tab view immediately
        removeTaskFromAssignedView(task._id || task.id);
    }
    
    // Display selected task in Task tab
    function displaySelectedTask(task) {
        const container = document.getElementById('dynamicTaskCards');
        const emptyEl = document.getElementById('taskTabEmpty');
        
        if (!container) return;
        
        // Clear previous content
        container.innerHTML = '';
        
        if (emptyEl) emptyEl.style.display = 'none';
        
        // Create task card with timer
        const taskCard = createTaskWithTimerCard(task);
        container.appendChild(taskCard);
        
        // Scroll to task
        setTimeout(() => {
            taskCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            taskCard.classList.add('task-highlighted');
            setTimeout(() => {
                taskCard.classList.remove('task-highlighted');
            }, 2000);
        }, 100);
    }
    
    // Create task card with timer for Task tab
    function createTaskWithTimerCard(task) {
        const div = document.createElement('div');
        div.className = 'detailed-task-card task-card mb-4';
        div.setAttribute('data-task-id', task._id || task.id);
        
        const taskId = task._id || task.id;
        const title = task.title || task.taskTitle || 'Staff Task';
        const description = task.description || 'No description provided';
        const category = task.category || task.type || 'General';
        const priority = task.priority || 'Medium';
        const dueDate = task.dueDate || 'ASAP';
        const location = task.location || 'Shelter';
        const points = task.points || task.reward || 20;
        const estimatedHours = task.estimatedHours || task.hours || 1;
        
        const formattedDate = formatDate(dueDate);
        const priorityClass = getPriorityClass(priority);
        const estimatedMinutes = Math.round(estimatedHours * 60);
        
        div.innerHTML = `
            <div class="detailed-task-header">
                <div class="task-main-info">
                    <h5 class="task-main-title">${title}</h5>
                    <div class="task-type-badge">Selected Task</div>
                </div>
                <div class="task-tags">
                    <span class="task-tag ${getCategoryClass(category)}">${category}</span>
                    <span class="task-tag ${priorityClass}">${priority} Priority</span>
                </div>
            </div>
            
            <div class="detailed-task-description">
                <p>${description}</p>
            </div>
            
            <div class="detailed-task-details">
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Due Date</div>
                        <div class="detail-value">${formattedDate}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Location</div>
                        <div class="detail-value">${location}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Estimated Time</div>
                        <div class="detail-value">${estimatedHours} hour${estimatedHours !== 1 ? 's' : ''}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Points Reward</div>
                        <div class="detail-value points-value">${points}</div>
                    </div>
                </div>
            </div>
            
            <div class="detailed-task-skills">
                <div class="skills-label">Task Details</div>
                <div class="skill-tags">
                    <span class="skill-tag">${category}</span>
                    <span class="skill-tag">Animal Care</span>
                </div>
            </div>
            
            <div class="detailed-task-actions">
                <div class="task-status-info">
                    <div class="status-badge status-ready">Ready to Start</div>
                    <div class="task-metrics">
                        <div class="metric">
                            <span class="metric-value">${estimatedHours}</span>
                            <span class="metric-label">hours</span>
                        </div>
                        <div class="metric">
                            <span class="metric-value">${points}</span>
                            <span class="metric-label">points</span>
                        </div>
                    </div>
                </div>
                <div class="task-action-buttons">
                    <button class="btn btn-primary btn-start-task-main" onclick="startTaskWithTimer('${taskId}', ${estimatedMinutes}, this)">
                        Start Task
                    </button>
                </div>
            </div>
            
            <!-- Timer Section -->
            <div class="task-timer-section" style="display: none;">
                <div class="timer-header">
                    <h6>Task Timer</h6>
                    <div class="timer-badge">
                        <span class="timer-icon">⏱️</span>
                        <span class="timer-label">Active</span>
                    </div>
                </div>
                <div class="timer-display">
                    <div class="timer-circle">
                        <svg class="timer-progress" width="100" height="100" viewBox="0 0 100 100">
                            <circle class="timer-bg" cx="50" cy="50" r="45"></circle>
                            <circle class="timer-fg" cx="50" cy="50" r="45"></circle>
                        </svg>
                        <div class="timer-time">
                            <span class="minutes">${estimatedMinutes.toString().padStart(2, '0')}</span>:<span class="seconds">00</span>
                        </div>
                    </div>
                    <div class="timer-info">
                        <div class="timer-estimate">
                            Estimated: ${estimatedHours}h (${estimatedMinutes}m)
                        </div>
                        <div class="timer-elapsed">
                            Elapsed: <span class="elapsed-time">0m 0s</span>
                        </div>
                    </div>
                </div>
                <div class="timer-controls">
                    <button class="btn btn-success btn-finish-early" onclick="finishTaskEarly('${taskId}', this)">
                        Finish Task
                    </button>
                </div>
            </div>
        `;
        
        return div;
    }
    
    // Remove task from Assigned tab view
    function removeTaskFromAssignedView(taskId) {
        const taskCard = document.querySelector(`.staff-task-card[data-task-id="${taskId}"]`);
        if (taskCard) {
            taskCard.remove();
        }
        
        // Remove from allTasks array
        const taskIndex = allTasks.findIndex(t => (t._id || t.id) === taskId);
        if (taskIndex !== -1) {
            allTasks.splice(taskIndex, 1);
        }
        
        // Update empty state if needed
        const container = document.getElementById('dynamicStaffTasks');
        const emptyEl = document.getElementById('staffTasksEmpty');
        if (container && container.children.length === 0 && emptyEl) {
            emptyEl.style.display = 'block';
        }
    }
    
    // Start task with timer - GLOBAL FUNCTION
    window.startTaskWithTimer = function(taskId, estimatedMinutes, button) {
        const taskCard = button.closest('.detailed-task-card');
        const taskName = taskCard.querySelector('.task-main-title').textContent;
        const timerSection = taskCard.querySelector('.task-timer-section');
        
        // Update button
        button.textContent = 'Task Started';
        button.disabled = true;
        button.classList.remove('btn-primary');
        button.classList.add('btn-secondary');
        
        // Update status
        const statusBadge = taskCard.querySelector('.status-badge');
        if (statusBadge) {
            statusBadge.textContent = 'In Progress';
            statusBadge.className = 'status-badge status-in-progress';
        }
        
        // Show timer section
        timerSection.style.display = 'block';
        
        // Start timer
        startTimer(taskId, estimatedMinutes, taskCard);
        
        alert(`Task "${taskName}" has been started. Timer is running.`);
    };
    
    // Start the countdown timer
    function startTimer(taskId, totalMinutes, taskCard) {
        const timerDisplay = taskCard.querySelector('.timer-time');
        const elapsedDisplay = taskCard.querySelector('.elapsed-time');
        const progressCircle = taskCard.querySelector('.timer-fg');
        const finishBtn = taskCard.querySelector('.btn-finish-early');
        
        let totalSeconds = totalMinutes * 60;
        let elapsedSeconds = 0;
        let timerInterval;
        
        // Calculate circumference for progress circle
        const radius = 45;
        const circumference = 2 * Math.PI * radius;
        progressCircle.style.strokeDasharray = circumference;
        progressCircle.style.strokeDashoffset = circumference;
        
        // Store timer data
        activeTimers.set(taskId, {
            interval: null,
            totalSeconds: totalSeconds,
            elapsedSeconds: 0,
            taskCard: taskCard
        });
        
        function updateTimer() {
            elapsedSeconds++;
            
            // Calculate remaining time
            const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
            const minutes = Math.floor(remainingSeconds / 60);
            const seconds = remainingSeconds % 60;
            
            // Update display
            timerDisplay.querySelector('.minutes').textContent = 
                minutes.toString().padStart(2, '0');
            timerDisplay.querySelector('.seconds').textContent = 
                seconds.toString().padStart(2, '0');
            
            // Update elapsed time
            const elapsedMinutes = Math.floor(elapsedSeconds / 60);
            const elapsedSecs = elapsedSeconds % 60;
            elapsedDisplay.textContent = `${elapsedMinutes}m ${elapsedSecs}s`;
            
            // Update progress circle
            const progress = elapsedSeconds / totalSeconds;
            const offset = circumference - (progress * circumference);
            progressCircle.style.strokeDashoffset = offset;
            
            // Change color when nearing completion
            if (progress > 0.8) {
                progressCircle.style.stroke = '#dc3545';
            } else if (progress > 0.5) {
                progressCircle.style.stroke = '#ffc107';
            }
            
            // Update timer data
            const timerData = activeTimers.get(taskId);
            if (timerData) {
                timerData.elapsedSeconds = elapsedSeconds;
            }
            
            // Auto-complete when time is up
            if (elapsedSeconds >= totalSeconds) {
                clearInterval(timerInterval);
                completeTask(taskId, true, elapsedSeconds);
            }
        }
        
        // Start the interval
        timerInterval = setInterval(updateTimer, 1000);
        
        // Update stored interval reference
        const timerData = activeTimers.get(taskId);
        if (timerData) {
            timerData.interval = timerInterval;
        }
        
        // Update finish button
        if (finishBtn) {
            finishBtn.onclick = function() {
                clearInterval(timerInterval);
                finishTaskEarly(taskId, this);
            };
        }
    }
    
    // Finish task early - GLOBAL FUNCTION
    window.finishTaskEarly = function(taskId, button) {
        const timerData = activeTimers.get(taskId);
        const elapsedSeconds = timerData ? timerData.elapsedSeconds : 0;
        
        if (confirm('Are you sure you want to finish this task?')) {
            // Clear the timer
            if (timerData && timerData.interval) {
                clearInterval(timerData.interval);
            }
            
            // Complete the task
            completeTask(taskId, false, elapsedSeconds);
        }
    };
    
    // Complete task
    async function completeTask(taskId, isAutoComplete, timeSpent) {
        try {
            // Find the task
            const task = allTasks.find(t => (t._id || t.id) === taskId) || activeTask;
            if (!task) {
                console.error('Task not found:', taskId);
                throw new Error('Task not found');
            }
            
            const taskCard = document.querySelector(`.detailed-task-card[data-task-id="${taskId}"]`);
            const taskName = task.title || task.taskTitle || 'Task';
            const points = task.points || task.reward || 20;
            const estimatedHours = task.estimatedHours || task.hours || 1;
            
            // Update task status in database
            const updateData = {
                status: 'completed',
                completedAt: new Date().toISOString(),
                timeSpent: timeSpent,
                completedEarly: !isAutoComplete && timeSpent < (estimatedHours * 60 * 60),
                completedBy: VOLUNTEER_ID,
                completedByName: VOLUNTEER_NAME
            };
            
            console.log('Updating task with:', updateData);
            
            // Determine the correct endpoint based on whether the task has a pet_id
            const endpoint = task.pet_id ? `${API_URL}/tasks/${taskId}` : `${API_URL}/staff-tasks/${taskId}`;

            // Send update to the correct endpoint
            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
            
            let savedSuccessfully = false;
            
            if (response.ok) {
                const result = await response.json();
                console.log('Task updated successfully:', result);
                savedSuccessfully = true;
            } else {
                const errorText = await response.text();
                console.error('API Error:', errorText);
            }
            
            // Update UI to show completion
            updateUIAfterCompletion(taskCard, taskName, points, timeSpent, !isAutoComplete);
            
            // Add to completed tasks array
            const completedTask = {
                ...task,
                ...updateData,
                _id: `completed_${Date.now()}_${taskId}`
            };
            completedTasks.push(completedTask);
            
            // Clear active task
            activeTask = null;
            
            // Remove timer
            activeTimers.delete(taskId);
            
            // Remove from allTasks array
            const taskIndex = allTasks.findIndex(t => (t._id || t.id) === taskId);
            if (taskIndex !== -1) {
                allTasks.splice(taskIndex, 1);
            }
            
            // Show success message
            setTimeout(() => {
                const timeMessage = isAutoComplete ? 
                    'Task completed as time limit reached.' :
                    `Task completed early. Time spent: ${Math.floor(timeSpent / 60)}m ${timeSpent % 60}s`;
                
                if (savedSuccessfully) {
                    alert(`✅ Task Completed!\n"${taskName}"\n\n${timeMessage}\n${points} points earned!`);
                } else {
                    alert(`✅ Task Completed!\n"${taskName}"\n\n${timeMessage}\n${points} points earned!\n\nNote: Could not save to database, but task is marked as complete locally.`);
                }
                
                // Switch to completed tab
                showTab('completed');
                
                // Refresh completed tasks display
                loadCompletedTasks();
                
            }, 300);
            
        } catch (error) {
            console.error('Error completing task:', error);
            alert(`Error: ${error.message}\n\nPlease try again.`);
        }
    }
    
    // Update UI after task completion
    function updateUIAfterCompletion(taskCard, taskName, points, timeSpent, completedEarly) {
        if (!taskCard) return;
        
        // Hide timer section
        const timerSection = taskCard.querySelector('.task-timer-section');
        if (timerSection) {
            timerSection.style.display = 'none';
        }
        
        // Update status
        const statusBadge = taskCard.querySelector('.status-badge');
        if (statusBadge) {
            statusBadge.textContent = 'Completed';
            statusBadge.className = 'status-badge status-completed';
        }
        
        // Remove action buttons
        const actionButtons = taskCard.querySelector('.task-action-buttons');
        if (actionButtons) {
            actionButtons.innerHTML = `
                <button class="btn btn-success" disabled>
                    ✓ Task Completed
                </button>
            `;
        }
        
        // Add completion details
        const completionDetails = document.createElement('div');
        completionDetails.className = 'completion-details mt-3 p-3 bg-light rounded';
        const timeSpentFormatted = formatTimeSpent(timeSpent);
        
        completionDetails.innerHTML = `
            <div class="completion-success">
                <strong>✓ Task Successfully Completed</strong>
                <div class="completion-points">${points} points awarded</div>
                <div class="completion-time">Time spent: ${timeSpentFormatted}</div>
                ${completedEarly ? '<div class="completion-early text-success">✓ Completed Early</div>' : ''}
                <small class="text-muted">This task has been completed.</small>
            </div>
        `;
        
        const actionsSection = taskCard.querySelector('.detailed-task-actions');
        if (actionsSection) {
            actionsSection.parentNode.insertBefore(completionDetails, actionsSection.nextSibling);
        }
    }
    
    // Create completed task card (view only)
    function createCompletedTaskCard(task) {
        const div = document.createElement('div');
        div.className = 'completed-task-item mb-3';
        
        const taskId = task._id || task.id || `completed_${Date.now()}`;
        const title = task.title || task.taskTitle || 'Completed Task';
        const description = task.description || 'No description';
        const category = task.category || task.type || 'General';
        const priority = task.priority || 'Medium';
        const completedDate = task.completedAt || new Date().toISOString();
        const points = task.points || task.reward || 20;
        const timeSpent = task.timeSpent || 0;
        const completedEarly = task.completedEarly || false;
        const estimatedHours = task.estimatedHours || task.hours || 1;
        
        const formattedDate = formatDate(completedDate);
        const timeSpentFormatted = formatTimeSpent(timeSpent);
        const priorityClass = getPriorityClass(priority);
        const categoryClass = getCategoryClass(category);
        
        div.innerHTML = `
            <div class="completed-task-header">
                <div class="completed-task-title">
                    <h6 class="mb-1">${title}</h6>
                    <span class="completed-badge">Completed</span>
                </div>
                <div class="completed-task-points">${points} points earned</div>
            </div>
            
            <div class="completed-task-meta">
                <span class="task-category ${categoryClass}">${category}</span>
                <span class="task-priority ${priorityClass}">${priority}</span>
                <span class="task-duration">${estimatedHours}h estimated</span>
            </div>
            
            <div class="completed-task-description">
                <p class="mb-2">${description}</p>
            </div>
            
            <div class="completed-task-details">
                <div class="completed-detail">
                    <span class="detail-label">Completed on:</span>
                    <span class="detail-value">${formattedDate}</span>
                </div>
                <div class="completed-detail">
                    <span class="detail-label">Time spent:</span>
                    <span class="detail-value">${timeSpentFormatted}</span>
                </div>
                <div class="completed-detail">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value status-completed">Completed</span>
                </div>
                ${completedEarly ? `
                <div class="completed-detail">
                    <span class="detail-label">Completion:</span>
                    <span class="detail-value text-success">Early ✓</span>
                </div>
                ` : ''}
            </div>
        `;
        
        return div;
    }
    
    // Helper functions
    function extractTasks(data) {
        if (Array.isArray(data)) return data;
        if (data && typeof data === 'object') {
            if (Array.isArray(data.tasks)) return data.tasks;
            if (Array.isArray(data.data)) return data.data;
            return Object.values(data).filter(val => 
                val && typeof val === 'object' && (val.title || val.taskTitle || val.name)
            );
        }
        return [];
    }
    
    function formatDate(dateString) {
        try {
            if (!dateString) return 'ASAP';
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    }
    
    function formatTimeSpent(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }
    
    function truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    function getPriorityClass(priority) {
        const classes = {
            'High': 'priority-high',
            'Medium': 'priority-medium',
            'Low': 'priority-low'
        };
        return classes[priority] || 'priority-default';
    }
    
    function getCategoryClass(category) {
        const categoryMap = {
            'Feeding': 'category-feeding',
            'Exercise': 'category-exercise',
            'Grooming': 'category-grooming',
            'Medical': 'category-medical',
            'Socialization': 'category-socialization',
            'General': 'category-general',
            'Facilities': 'category-general',
            'Administrative': 'category-general',
            'Animal Care': 'category-feeding'
        };
        return categoryMap[category] || 'category-general';
    }
    
    // Add all styles
    function addAllStyles() {
        if (document.getElementById('task-integration-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'task-integration-styles';
        style.textContent = `
            /* Staff Task Cards in Assigned Tab */
            .staff-task-card {
                background: white;
                border-radius: 8px;
                border: 1px solid #e0e0e0;
                padding: 16px;
                transition: all 0.3s ease;
                cursor: pointer;
            }
            
            .staff-task-card:hover {
                border-color: #41b883;
                box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                transform: translateY(-2px);
            }
            
            .task-item-header {
                margin-bottom: 12px;
            }
            
            .task-title-row {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 8px;
            }
            
            .task-title {
                font-weight: 600;
                color: #333;
                margin: 0;
                flex: 1;
            }
            
            .task-points {
                background: #41b883;
                color: white;
                padding: 4px 10px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                margin-left: 10px;
            }
            
            .task-meta-row {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            
            .task-category,
            .task-priority,
            .task-duration {
                font-size: 12px;
                padding: 3px 10px;
                border-radius: 4px;
                font-weight: 500;
            }
            
            .category-feeding { background: #e3f2fd; color: #1565c0; }
            .category-exercise { background: #e8f5e9; color: #2e7d32; }
            .category-grooming { background: #fff3e0; color: #ef6c00; }
            .category-medical { background: #fce4ec; color: #c2185b; }
            .category-socialization { background: #f3e5f5; color: #7b1fa2; }
            .category-general { background: #f5f5f5; color: #616161; }
            
            .priority-high { background: #ffebee; color: #c62828; }
            .priority-medium { background: #fff3e0; color: #ef6c00; }
            .priority-low { background: #e8f5e9; color: #2e7d32; }
            .priority-default { background: #f5f5f5; color: #616161; }
            
            .task-item-body {
                margin-bottom: 12px;
            }
            
            .task-description-text {
                font-size: 14px;
                color: #666;
                margin: 0;
            }
            
            .task-details-row {
                display: flex;
                gap: 20px;
                margin-top: 10px;
            }
            
            .task-detail {
                font-size: 13px;
            }
            
            .detail-label {
                color: #888;
                margin-right: 5px;
            }
            
            .detail-value {
                color: #333;
                font-weight: 500;
            }
            
            .status-assigned {
                color: #41b883;
                font-weight: 600;
            }
            
            /* Status badges */
            .status-badge {
                padding: 6px 16px;
                border-radius: 20px;
                font-size: 13px;
                font-weight: 500;
            }
            
            .status-assigned {
                background: #e9f7ef;
                color: #2d8057;
            }
            
            .status-ready {
                background: #e3f2fd;
                color: #1565c0;
            }
            
            .status-in-progress {
                background: #fff3cd;
                color: #856404;
            }
            
            .status-completed {
                background: #d4edda;
                color: #155724;
            }
            
            /* Detailed Task Cards in Task Tab */
            .detailed-task-card {
                background: white;
                border-radius: 10px;
                border: 1px solid #e0e0e0;
                padding: 20px;
            }
            
            .detailed-task-header {
                margin-bottom: 16px;
            }
            
            .task-main-info {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 12px;
            }
            
            .task-main-title {
                font-weight: 600;
                color: #333;
                margin: 0;
                flex: 1;
            }
            
            .task-type-badge {
                background: #41b883;
                color: white;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                margin-left: 12px;
            }
            
            .detailed-task-description {
                margin-bottom: 20px;
            }
            
            .detailed-task-description p {
                color: #555;
                line-height: 1.6;
                margin: 0;
            }
            
            .detail-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 16px;
                margin-bottom: 20px;
            }
            
            .detail-item {
                background: #f8f9fa;
                padding: 12px;
                border-radius: 6px;
            }
            
            .detail-label {
                display: block;
                font-size: 12px;
                color: #888;
                margin-bottom: 4px;
            }
            
            .points-value {
                color: #41b883;
                font-weight: 600;
                font-size: 18px;
            }
            
            .detailed-task-skills {
                margin-bottom: 20px;
            }
            
            .skills-label {
                font-size: 14px;
                color: #666;
                margin-bottom: 8px;
                font-weight: 500;
            }
            
            .skill-tags {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            
            .skill-tag {
                background: #e9f7ef;
                color: #2d8057;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
            }
            
            .detailed-task-actions {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-top: 20px;
                border-top: 1px solid #f0f0f0;
            }
            
            .task-status-info {
                display: flex;
                align-items: center;
                gap: 16px;
            }
            
            .task-metrics {
                display: flex;
                gap: 16px;
            }
            
            .metric {
                text-align: center;
            }
            
            .metric-value {
                display: block;
                font-weight: 600;
                color: #333;
                font-size: 16px;
            }
            
            .metric-label {
                display: block;
                font-size: 12px;
                color: #888;
            }
            
            .task-action-buttons {
                display: flex;
                gap: 10px;
            }
            
            .btn-start-task-main {
                background: #41b883;
                border-color: #41b883;
                padding: 8px 20px;
                font-weight: 500;
            }
            
            .btn-start-task-main:hover {
                background: #369c6e;
                border-color: #369c6e;
            }
            
            /* Timer Section */
            .task-timer-section {
                margin-top: 20px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
                border: 1px solid #e0e0e0;
            }
            
            .timer-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            
            .timer-header h6 {
                margin: 0;
                color: #333;
                font-weight: 600;
            }
            
            .timer-badge {
                background: #41b883;
                color: white;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .timer-display {
                display: flex;
                align-items: center;
                gap: 30px;
                margin-bottom: 20px;
            }
            
            .timer-circle {
                position: relative;
                width: 100px;
                height: 100px;
            }
            
            .timer-progress {
                transform: rotate(-90deg);
            }
            
            .timer-bg {
                fill: none;
                stroke: #e0e0e0;
                stroke-width: 8;
            }
            
            .timer-fg {
                fill: none;
                stroke: #41b883;
                stroke-width: 8;
                stroke-linecap: round;
                transition: stroke-dashoffset 1s linear, stroke 0.5s ease;
            }
            
            .timer-time {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 20px;
                font-weight: 600;
                color: #333;
                font-family: monospace;
            }
            
            .timer-info {
                flex: 1;
            }
            
            .timer-estimate,
            .timer-elapsed {
                margin-bottom: 8px;
                font-size: 14px;
                color: #666;
            }
            
            .timer-controls {
                display: flex;
                gap: 10px;
                justify-content: center;
            }
            
            .btn-finish-early {
                background: #28a745;
                border-color: #28a745;
                padding: 8px 20px;
                font-weight: 500;
            }
            
            .btn-finish-early:hover {
                background: #218838;
                border-color: #1e7e34;
            }
            
            /* Completed Tasks */
            .completed-task-item {
                background: white;
                border-radius: 8px;
                border: 1px solid #e0e0e0;
                padding: 16px;
            }
            
            .completed-task-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 12px;
            }
            
            .completed-task-title {
                flex: 1;
            }
            
            .completed-badge {
                background: #e8f5e9;
                color: #2e7d32;
                padding: 3px 10px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 500;
            }
            
            .completed-task-points {
                color: #41b883;
                font-weight: 600;
            }
            
            .completed-task-meta {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
                margin-bottom: 12px;
            }
            
            .completed-task-description p {
                color: #666;
                font-size: 14px;
                margin: 0;
            }
            
            .completed-task-details {
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
                margin-top: 12px;
                font-size: 13px;
            }
            
            /* Completion Details */
            .completion-details {
                border-left: 4px solid #28a745;
                margin-top: 20px;
            }
            
            .completion-success {
                color: #155724;
            }
            
            .completion-points {
                font-size: 16px;
                font-weight: 600;
                margin: 5px 0;
                color: #41b883;
            }
            
            .completion-time {
                font-size: 14px;
                color: #666;
                margin: 5px 0;
            }
            
            .completion-early {
                font-size: 14px;
                font-weight: 500;
                margin: 5px 0;
            }
            
            /* Task Highlight */
            .task-highlighted {
                box-shadow: 0 0 0 3px rgba(65, 184, 131, 0.2);
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // Initialize everything
    function initializeEverything() {
        // Add all styles
        addAllStyles();
        
        // Load assigned tasks on page load if on assigned tab
        if (document.getElementById('assignedTab').style.display !== 'none') {
            setTimeout(loadAssignedTasks, 500);
        }
        
        console.log('Task integration initialized');
    }
    
    // Start initialization
    initializeEverything();
});