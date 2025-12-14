// /frontend/js/volunteer/task/task-fetch.js
document.addEventListener('DOMContentLoaded', function() {
  const API_URL = 'http://localhost:3000/api';
  let currentVolunteerId = 'volunteer123'; // Replace with actual logged-in volunteer ID
  
  // Function to fetch tasks for the volunteer
  async function fetchVolunteerTasks() {
    try {
      console.log('Fetching tasks for volunteer...');
      
      // Fetch ALL tasks first (for testing - later filter by assigned volunteer)
      const response = await fetch(`${API_URL}/tasks`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      
      const tasksResp = await response.json();
      const allTasks = Array.isArray(tasksResp) ? tasksResp : 
                      (tasksResp.tasks || tasksResp.data || []);
      
      console.log('All tasks from server:', allTasks);
      
      // For now, show all active tasks (for testing)
      // Later, filter by: task.assignedTo === currentVolunteerId
      const volunteerTasks = allTasks.filter(task => 
        task.isActive !== false && 
        (task.assignedTo === currentVolunteerId || task.assignedTo === undefined)
      );
      
      // Update UI with fetched tasks
      updateTaskUI(volunteerTasks);
      
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Fallback to static tasks if API fails
      console.log('Using static tasks as fallback');
    }
  }
  
  // Function to update UI with tasks
  function updateTaskUI(tasks) {
    const taskTab = document.getElementById('taskTab');
    if (!taskTab) return;
    
    // Clear existing dynamic task cards
    const existingCards = taskTab.querySelectorAll('.task-card[data-task-id]');
    existingCards.forEach(card => card.remove());
    
    // Add new task cards
    tasks.forEach(task => {
      if (!task._id) return; // Skip tasks without ID
      
      const taskCard = createTaskCard(task);
      taskTab.appendChild(taskCard);
    });
    
    // Update task count in assigned pets section if needed
    updateAssignedPetsTaskCount();
  }
  
  // Function to create a task card element
  function createTaskCard(task) {
    const div = document.createElement('div');
    div.className = 'task-card';
    div.setAttribute('data-task-id', task._id);
    
    // Determine priority color
    let priorityColor = '#ff4757'; // default red for high
    if (task.priority === 'Medium') priorityColor = '#ffa502';
    if (task.priority === 'Low') priorityColor = '#2ed573';
    
    // Determine badge text
    const badgeText = task.type === 'Special' ? 'Special Task' : 
                     task.type === 'Recurring' ? 'Recurring Task' : 
                     task.type === 'Urgent' ? 'Urgent Task' : 'Task';
    
    // Extract pet name from title (simple extraction - you might want to improve this)
    const petNameMatch = task.title.match(/^([^-]+)/);
    const petName = petNameMatch ? petNameMatch[1].trim() : 'Pet';
    
    div.innerHTML = `
      <div class="task-header">
        <div class="task-title-section">
          <div class="task-pet-name">${task.title}</div>
          <div class="task-badge">${badgeText}</div>
        </div>
        <div class="task-tags">
          <span class="task-tag">${task.category || 'General'}</span>
          <span class="task-tag">${task.priority || 'Medium'} Priority</span>
        </div>
      </div>
      
      <div class="task-description">
        ${task.description || 'No description provided'}
      </div>
      
      <div class="task-details">
        <div class="detail-item">
          <span class="detail-label">Due</span>
          <span class="detail-value">${new Date(task.dueDate).toLocaleDateString()}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Location</span>
          <span class="detail-value">${task.location || 'Not specified'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Generated</span>
          <span class="detail-value ${task.taskType === 'auto' ? 'auto-gen' : ''}">
            ${task.taskType === 'auto' ? 'Auto Generated' : 'Staff Created'}
          </span>
        </div>
      </div>
      
      <div class="task-skills">
        <div class="skills-label">Required Skills</div>
        <div class="skill-tags">
          <span class="skill-tag">${task.category || 'General Care'}</span>
          ${task.priority === 'High' ? '<span class="skill-tag">Urgent Handling</span>' : ''}
        </div>
      </div>
      
      <div class="task-actions">
        <div class="action-buttons">
          <button class="btn-view-details" onclick="viewTaskDetails('${task._id}')">View Details</button>
          <button class="btn-complete-task" onclick="markTaskComplete(this, '${task._id}')">
            <span class="check-icon">✓</span>
            Complete Task
          </button>
        </div>
        
        <div class="task-status-section">
          <div class="priority-badge" style="background-color: ${priorityColor};">${task.priority || 'High'}</div>
          <div class="status-badge">${task.status || 'Assigned'}</div>
          <div class="task-metrics">
            <div class="metric-item">
              <span class="metric-value">${task.estimatedHours || 1}h</span>
              <span class="metric-label">estimated</span>
            </div>
            <div class="metric-item">
              <span class="metric-value">${task.points || 25}</span>
              <span class="metric-label">points</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="pet-assignment">
        <span class="pet-assignment-label">Pet Assignment:</span> ${petName}
      </div>
    `;
    
    return div;
  }
  
  // Function to update task count in assigned pets
  function updateAssignedPetsTaskCount() {
    const taskTab = document.getElementById('taskTab');
    if (!taskTab) return;
    
    const activeTasks = taskTab.querySelectorAll('.task-card').length;
    const activeTasksElement = document.querySelector('.pet-stat-number');
    if (activeTasksElement) {
      activeTasksElement.textContent = activeTasks;
    }
  }
  
  // Function to view task details
  window.viewTaskDetails = function(taskId) {
    alert(`Viewing details for task ID: ${taskId}`);
    // You can implement modal or page navigation here
  };
  
  // Enhanced markTaskComplete function
  window.markTaskComplete = async function(button, taskId) {
    const taskCard = button.closest('.task-card');
    const taskName = taskCard.querySelector('.task-pet-name').textContent;
    
    // Send completion to server
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          completedBy: currentVolunteerId,
          completedAt: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        // Update button state
        button.innerHTML = '<span class="check-icon">✓</span> Completed';
        button.classList.add('completed');
        button.disabled = true;
        
        // Update status badge
        const statusSection = taskCard.querySelector('.task-status-section');
        const statusBadge = statusSection.querySelector('.status-badge');
        if (statusBadge) {
          statusBadge.textContent = 'Completed';
          statusBadge.style.backgroundColor = '#e8f5e9';
          statusBadge.style.color = '#2e7d32';
        }
        
        // Remove priority badge
        const priorityBadge = statusSection.querySelector('.priority-badge');
        if (priorityBadge) {
          priorityBadge.style.display = 'none';
        }
        
        // Move to completed tab after delay
        setTimeout(() => {
          alert(`"${taskName}" has been marked as completed! ${taskCard.querySelector('.metric-value:last-child')?.textContent || 'Points'} have been added to your account.`);
          
          // Move task to completed section
          moveTaskToCompleted(taskCard, taskId);
        }, 300);
      } else {
        throw new Error('Failed to mark task as complete');
      }
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Failed to mark task as complete. Please try again.');
    }
  };
  
  // Function to move task to completed section
  function moveTaskToCompleted(taskCard, taskId) {
    const completedTab = document.getElementById('completedTab');
    if (!completedTab) return;
    
    // Create completed task item
    const completedItem = document.createElement('div');
    completedItem.className = 'completed-task-item';
    completedItem.innerHTML = taskCard.innerHTML;
    
    // Remove action buttons from completed item
    const actions = completedItem.querySelector('.task-actions');
    if (actions) actions.remove();
    
    // Add to completed tab
    completedTab.appendChild(completedItem);
    
    // Remove from active tasks
    taskCard.remove();
    
    // Update task counts
    updateAssignedPetsTaskCount();
  }
  
  // Function to filter tasks based on search and filters
  function filterTasks() {
    const searchInput = document.getElementById('taskSearchInput');
    const statusFilter = document.getElementById('taskStatusFilter');
    const categoryFilter = document.getElementById('taskCategoryFilter');
    
    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;
    const categoryValue = categoryFilter.value;
    
    const taskCards = document.querySelectorAll('#taskTab .task-card');
    
    taskCards.forEach(card => {
      const taskName = card.querySelector('.task-pet-name').textContent.toLowerCase();
      const taskStatus = card.querySelector('.status-badge').textContent.toLowerCase();
      const taskCategory = card.querySelector('.task-tag').textContent.toLowerCase();
      
      const matchesSearch = taskName.includes(searchTerm);
      const matchesStatus = !statusValue || taskStatus.includes(statusValue);
      const matchesCategory = !categoryValue || taskCategory.includes(categoryValue);
      
      card.style.display = (matchesSearch && matchesStatus && matchesCategory) ? 'block' : 'none';
    });
  }
  
  // Initialize event listeners for filters
  function initFilters() {
    const searchInput = document.getElementById('taskSearchInput');
    const statusFilter = document.getElementById('taskStatusFilter');
    const categoryFilter = document.getElementById('taskCategoryFilter');
    
    if (searchInput) searchInput.addEventListener('input', filterTasks);
    if (statusFilter) statusFilter.addEventListener('change', filterTasks);
    if (categoryFilter) categoryFilter.addEventListener('change', filterTasks);
  }
  
  // Initialize everything
  function init() {
    console.log('Initializing volunteer task page...');
    fetchVolunteerTasks();
    initFilters();
    
    // Refresh tasks every 30 seconds to get new tasks
    setInterval(fetchVolunteerTasks, 30000);
  }
  
  // Start initialization
  init();
});