document.addEventListener('DOMContentLoaded', () => {
  const createTaskForm = document.getElementById('createTaskForm');
  const saveTaskBtn = document.getElementById('saveTaskBtn');
  const tasksContainer = document.querySelector('.staff-card-container');
  const createTaskModalEl = document.getElementById('createTaskModal');
  const createTaskModal = new bootstrap.Modal(createTaskModalEl);
  const assignVolunteerModalEl = document.getElementById('assignVolunteerModal');
  const assignVolunteerModal = new bootstrap.Modal(assignVolunteerModalEl);

  const API_URL = 'http://localhost:3000/api'; // Backend server URL

  // --- Helper Functions ---
  const getTomorrowDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    const year = tomorrow.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // --- UI Update Functions ---
  const updateTaskCardUI = (task) => {
    const taskCard = tasksContainer.querySelector(`.task-card[data-task-id="${task._id}"]`);
    if (taskCard) {
      // Re-render the single card and replace the old one
      const newCardHTML = renderTaskCard(task);
      const newCardElement = document.createElement('div');
      newCardElement.innerHTML = newCardHTML.trim();
      taskCard.replaceWith(newCardElement.firstChild);
    } else {
      // If it's a new card, just append it
      tasksContainer.insertAdjacentHTML('beforeend', renderTaskCard(task));
    }
  };
  // --- UI Rendering ---
  const renderTaskCard = (task) => {
    const isAssigned = task.status !== 'Unassigned' && task.assignedTo;
    const assignedToHTML = isAssigned
      ? `
        <div class="d-flex align-items-center me-3">
            <img src="https://ui-avatars.com/api/?name=${task.assignedTo.name.replace(' ', '+')}&background=667eea&color=fff" alt="${task.assignedTo.name}" class="volunteer-avatar me-2">
            <span>${task.assignedTo.name}</span>
        </div>
        <span class="status-badge status-assigned">Assigned</span>
      `
      : `
        <span class="status-badge status-unassigned me-3">Not assigned yet</span>
        <button class="assign-volunteer-btn" data-bs-toggle="modal" data-bs-target="#assignVolunteerModal" data-task-id="${task._id}">
            Assign Volunteer
        </button>
      `;

    return `
      <div class="task-card" data-task-id="${task._id}">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <h5 class="fw-bold mb-0">${task.title}</h5>
          <span class="task-points">${task.points} points</span>
        </div>
        <p class="text-muted mb-3">${task.description || ''}</p>
        <div class="row align-items-center">
          <div class="col-md-6">
            <div class="d-flex align-items-center mb-2">
              <span class="task-due me-3"><i class="fas fa-calendar-day me-1"></i> Due: ${new Date(task.dueDate).toLocaleDateString()}</span>
              <span class="task-estimated"><i class="fas fa-clock me-1"></i> ${task.estimatedHours}h estimated</span>
            </div>
            <div class="task-location">
              <i class="fas fa-map-marker-alt me-1"></i> ${task.location}
            </div>
          </div>
          <div class="col-md-6">
            <div class="d-flex justify-content-md-end align-items-center mt-2 mt-md-0">
              ${assignedToHTML}
            </div>
          </div>
        </div>
      </div>
    `;
  };

  // --- API Calls ---
  const fetchAndDisplayTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const tasksResp = await response.json();

      // Support multiple response shapes: either an array, or an object like { tasks: [...] }
      const tasks = Array.isArray(tasksResp) ? tasksResp : (tasksResp.tasks || tasksResp.data || []);

      // Clear only dynamically loaded tasks
      tasksContainer.querySelectorAll('.task-card[data-task-id]').forEach(card => card.remove());

      const allTasksHTML = tasks.map(renderTaskCard).join('');
      tasksContainer.insertAdjacentHTML('beforeend', allTasksHTML);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      tasksContainer.insertAdjacentHTML('beforeend', '<p class="text-danger ms-3">Could not load tasks. Is the backend server running?</p>');
    }
  };

  const handleCreateTask = async () => {
    if (!createTaskForm.checkValidity()) {
      createTaskForm.reportValidity();
      return;
    }

    const taskData = {
      title: document.getElementById('taskTitle').value,
      description: document.getElementById('taskDescription').value,
      type: document.getElementById('taskType').value,
      category: document.getElementById('taskCategory').value,
      priority: document.getElementById('taskPriority').value,
      estimatedHours: parseFloat(document.getElementById('taskEstimatedHours').value),
      points: parseInt(document.getElementById('taskPoints').value),
      dueDate: document.getElementById('taskDueDate').value,
      location: document.getElementById('taskLocation').value,
      status: 'Unassigned'
    };

    try {
      // POST directly to /api/tasks to save in the tasks collection
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
      
      const newTaskResp = await response.json();
      // Support both response shapes: { data: task }, { task: task }, or direct task object
      const createdTask = newTaskResp.data || newTaskResp.task || newTaskResp;
      updateTaskCardUI(createdTask);

      createTaskModal.hide();
      alert('Task created successfully!');
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please check the console for details.');
    }
  };

  const handleAssignTask = async (taskId, volunteerId) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volunteerId }),
      });

      if (!response.ok) throw new Error('Failed to assign task');

      const updatedTask = await response.json();

      // Update the UI for the specific task card
      updateTaskCardUI(updatedTask);

      // If the assignment came from the modal, hide it
      if (assignVolunteerModalEl.classList.contains('show')) {
        assignVolunteerModal.hide();
      }

    } catch (error) {
      console.error('Error assigning task:', error);
      alert('There was an error assigning the task.');
    }
  };

  // --- Event Listeners ---
  saveTaskBtn.addEventListener('click', handleCreateTask);

  createTaskModalEl.addEventListener('hidden.bs.modal', () => {
    createTaskForm.reset();
    document.getElementById('taskDueDate').value = getTomorrowDateString();
  });

  // Event delegation for dynamically created "Assign Volunteer" buttons
  document.body.addEventListener('click', (e) => {
    // For buttons on the task cards that open the modal
    if (e.target.matches('.assign-volunteer-btn[data-bs-target="#assignVolunteerModal"]')) {
      const taskId = e.target.getAttribute('data-task-id');
      const taskTitle = e.target.closest('.task-card').querySelector('h5').textContent;
      
      // Set the task ID and title in the modal for context
      assignVolunteerModalEl.querySelector('.modal-body strong').textContent = taskTitle;
      assignVolunteerModalEl.dataset.taskId = taskId;
    }

    // For the final "Assign" button inside the modal
    if (e.target.id === 'assignBtn') {
      const taskId = assignVolunteerModalEl.dataset.taskId;
      const volunteerId = document.getElementById('volunteerSelect').value;
      if (taskId && volunteerId) {
        handleAssignTask(taskId, volunteerId);
      } else {
        alert('Please select a volunteer.');
      }
    }

    // TODO: Add logic for quick-assign buttons
  });

  // --- Initial Page Load ---
  const initializePage = () => {
    document.getElementById('navbarUserName').textContent = 'Kenji Webbo';
    document.getElementById('navbarUserRole').textContent = 'Staff Manager';
    document.getElementById('taskDueDate').value = getTomorrowDateString();
    
    // Remove static tasks before loading dynamic ones
    tasksContainer.querySelectorAll('.task-card').forEach(card => card.remove());

    fetchAndDisplayTasks();
  };

  initializePage();
});