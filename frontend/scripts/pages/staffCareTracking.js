import { getTasks, createTask, updateTask, deleteTask } from '../utils/careTaskApi.js';
import { getPets } from '../utils/staffPetsApi.js';

let allPets = [];
let allVolunteers = [];

async function loadPets() {
  try {
    const data = await getPets();
    allPets = data.pets || [];
    populatePetSelect();
  } catch (err) {
    console.error('Failed to load pets:', err);
  }
}

function populatePetSelect() {
  const select = document.getElementById('petId');
  if (!select) return;
  
  select.innerHTML = '<option selected disabled>Select pet</option>';
  allPets.forEach(pet => {
    const option = document.createElement('option');
    option.value = pet._id;
    option.textContent = `${pet.pet_name} (${pet.pet_type})`;
    select.appendChild(option);
  });
}

function readTaskForm() {
  const petId = document.getElementById('petId').value;
  
  const taskTitleSelect = document.getElementById('taskTitle');
  const title = taskTitleSelect.value;
  const selectedOption = taskTitleSelect.options[taskTitleSelect.selectedIndex];
  const taskType = selectedOption.getAttribute('data-type') || 'General';

  const description = document.getElementById('taskDescription').value.trim();
  const priority = document.getElementById('priority').value;
  const scheduleDate = document.getElementById('scheduleDate').value;

  // Validate required fields
  if (!petId) throw new Error('Pet is required');
  if (!taskType) throw new Error('Task type is required');
  if (!title) throw new Error('Task title is required');
  if (!priority) throw new Error('Priority is required');
  if (!scheduleDate) throw new Error('Scheduled date is required');

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) throw new Error('User not logged in');

  return {
    pet_id: petId,
    task_type: taskType,
    title,
    description,
    priority,
    scheduled_date: scheduleDate,
    created_by: currentUser._id || currentUser.id
  };
}

function resetTaskForm() {
  document.getElementById('createCareTaskForm').reset();
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadPets();

  // Auto-set priority to High if an Urgent task title is selected
  const taskTitleSelect = document.getElementById('taskTitle');
  const prioritySelect = document.getElementById('priority');
  
  if (taskTitleSelect && prioritySelect) {
    taskTitleSelect.addEventListener('change', function() {
      if (this.value.includes('Urgent')) {
        prioritySelect.value = 'High';
      }
    });
  }

  // Wire top-level Add Task button to open the modal
  const addTaskBtn = document.getElementById('addTaskBtn');
  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', () => {
      const modalEl = document.getElementById('addCareTaskModal');
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    });
  }

  // Handle form submission
  const form = document.getElementById('createCareTaskForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const taskData = readTaskForm();
        await createTask(taskData);
        resetTaskForm();
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addCareTaskModal'));
        if (modal) modal.hide();
        
        alert('Task created successfully!');

        // --- FIX: Refresh all views after creating a task ---
        // This will re-fetch tasks and update the overview, tasks, and schedule tabs.
        window.dispatchEvent(new CustomEvent('tasksUpdated'));
      } catch (err) {
        console.error('Failed to create task:', err);
        alert('Error: ' + err.message);
      }
    });
  }

  // Refresh pets and volunteers when modal opens
  const modal = document.getElementById('addCareTaskModal');
  if (modal) {
    modal.addEventListener('show.bs.modal', async () => { // Only load pets now
      await loadPets();
    });
  }
});
