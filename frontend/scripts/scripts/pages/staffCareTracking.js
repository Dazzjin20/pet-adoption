import { getTasks, createTask, updateTask, deleteTask } from '../utils/careTaskApi.js';
import { getPets } from '../utils/staffPetsApi.js';
import { getAvailableVolunteers } from '../utils/volunteersApi.js';

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

async function loadVolunteers() {
  try {
    const res = await getAvailableVolunteers();
    // API returns an array of volunteer documents
    allVolunteers = res || [];
    populateVolunteerSelect();
  } catch (err) {
    console.error('Failed to load volunteers:', err);
    allVolunteers = [];
    populateVolunteerSelect();
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

function populateVolunteerSelect() {
  const select = document.getElementById('assignedTo');
  if (!select) return;
  
  select.innerHTML = '<option selected disabled>Select volunteer</option>';
  allVolunteers.forEach(volunteer => {
    const option = document.createElement('option');
    option.value = volunteer._id;
    option.textContent = `${volunteer.first_name} ${volunteer.last_name}`;
    select.appendChild(option);
  });
}

function readTaskForm() {
  const petId = document.getElementById('petId').value;
  const taskType = document.getElementById('taskType').value;
  const title = document.getElementById('taskTitle').value.trim();
  const description = document.getElementById('taskDescription').value.trim();
  const assignedTo = document.getElementById('assignedTo').value || null;
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
    assigned_to: assignedTo,
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
  await loadVolunteers();

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
      } catch (err) {
        console.error('Failed to create task:', err);
        alert('Error: ' + err.message);
      }
    });
  }

  // Refresh pets and volunteers when modal opens
  const modal = document.getElementById('addCareTaskModal');
  if (modal) {
    modal.addEventListener('show.bs.modal', async () => {
      await loadPets();
      await loadVolunteers();
    });
  }
});
