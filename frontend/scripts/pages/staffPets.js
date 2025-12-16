import { getPets, createPet, updatePet, deletePet, getPet } from '../utils/staffPetsApi.js';

// Hold base64 image data and filenames for create/update
let beforeImageData = null;
let afterImageData = null;
let beforeImageName = null;
let afterImageName = null;

// Variables for update modal images
let updateBeforeImageData = null;
let updateAfterImageData = null;

function createCard(pet) {
  const col = document.createElement('div');
  col.className = 'col-md-6 col-lg-4';
  col.innerHTML = `
    <div class="staff-pet-card" data-pet-id="${pet._id}" data-pet-type="${pet.pet_type}" data-pet-status="${pet.status}">
      <img src="${pet.before_image || '../../assets/image/photo/BoyIcon.jpg'}" alt="${pet.pet_name}" class="staff-pet-card-img">
      <div class="staff-pet-card-body">
        <div class="staff-pet-card-name">${pet.pet_name}</div>
        <div class="staff-pet-card-details">${pet.age || 'N/A'} - ${pet.sex || ''}</div>
        <div class="staff-pet-card-location">${pet.location || ''}</div>
        <div class="staff-pet-card-location">Arrived ${pet.arrival_date || ''}</div>
        <div class="mt-3 d-flex gap-2">
          <button class="btn staff-pet-btn btn-sm flex-grow-1 viewPetBtn" data-pet-id="${pet._id}">View</button>
          <button class="btn staff-pet-secondary-btn btn-sm updatePetBtn" data-pet-id="${pet._id}">Update</button>
          <button class="btn btn-outline-danger btn-sm deletePetBtn" data-pet-id="${pet._id}">Delete</button>
        </div>
      </div>
    </div>`;
  return col;
}

async function loadPets() {
  try {
    const data = await getPets();
    const pets = data.pets || [];
    const grid = document.getElementById('petsGrid');
    if (!grid) return;
    grid.innerHTML = '';
    pets.forEach(p => grid.appendChild(createCard(p)));

    updateStats(pets);
    attachActionHandlers();
  } catch (err) {
    console.error('Failed to load pets', err);
  }
}

function updateStats(pets) {
  const total = pets.length;
  const available = pets.filter(p => (p.status || '').toLowerCase() === 'available').length;
  const pending = pets.filter(p => (p.status || '').toLowerCase() === 'pending').length;
  const medical = pets.filter(p => (p.status || '').toLowerCase() === 'medical').length;
  const adopted = pets.filter(p => (p.status || '').toLowerCase() === 'adopted').length;

  document.getElementById('totalPets').textContent = total;
  document.getElementById('availablePets').textContent = available;
  document.getElementById('pendingPets').textContent = pending;
  document.getElementById('medicalPets').textContent = medical;
  document.getElementById('adoptedPets').textContent = adopted;
}

function attachActionHandlers() {
  document.querySelectorAll('.viewPetBtn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const petId = e.currentTarget.dataset.petId;
      window.location.href = `/frontend/pages/staff/pets-page/staff-view-details.html?id=${petId}`;
    });
  });

  // Update buttons - now opens modal
  document.querySelectorAll('.updatePetBtn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const petId = e.target.dataset.petId;
      await openUpdateModal(petId);
    });
  });

  document.querySelectorAll('.deletePetBtn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.dataset.petId;
      if (confirm('Are you sure you want to delete this pet? This action cannot be undone.')) {
        try {
          await deletePet(id);
          await loadPets(); // Reload the list to reflect the deletion
        } catch (err) {
          console.error(`Failed to delete pet ${id}`, err);
          alert(`Error: ${err.message}`);
        }
      }
    });
  });
}

// ========== UPDATE PET FUNCTIONS ==========

async function openUpdateModal(petId) {
  try {
    console.log('Getting pet data for ID:', petId);
    
    // Get ALL pets from your database
    const response = await getPets();
    const allPets = response.pets || response || [];
    console.log('All pets loaded:', allPets.length);
    
    // Find the specific pet by ID
    const pet = allPets.find(p => p._id === petId || p.id === petId);
    
    if (!pet) {
      throw new Error(`Pet with ID ${petId} not found in database`);
    }
    
    console.log('Found pet:', pet);
    
    // Fill form with pet data
    document.getElementById('updatePetId').value = pet._id || pet.id;
    document.getElementById('updatePetName').value = pet.pet_name || '';
    document.getElementById('updatePetType').value = pet.pet_type || 'dog';
    document.getElementById('updatePetSex').value = pet.sex || 'male';
    document.getElementById('updatePetAge').value = pet.age || '';
    document.getElementById('updatePetWeight').value = pet.weight || '';
    document.getElementById('updatePetArrivalDate').value = pet.arrival_date || '';
    document.getElementById('updatePetLocation').value = pet.location || '';
    document.getElementById('updatePetVaccinated').checked = pet.vaccinated || false;
    document.getElementById('updatePetDescription').value = pet.about_pet || '';
    document.getElementById('updatePetStatus').value = pet.status || 'available';
    
    // Show current images
    const beforeImg = document.getElementById('currentBeforeImage');
    const afterImg = document.getElementById('currentAfterImage');
    
    if (beforeImg && pet.before_image) {
      console.log('Setting before image');
      beforeImg.src = pet.before_image;
      beforeImg.style.display = 'block';
    } else if (beforeImg) {
      beforeImg.style.display = 'none';
    }
    
    if (afterImg && pet.after_image) {
      console.log('Setting after image');
      afterImg.src = pet.after_image;
      afterImg.style.display = 'block';
    } else if (afterImg) {
      afterImg.style.display = 'none';
    }
    
    // Reset file input buttons
    const updateBeforeBtn = document.getElementById('updateBeforeImageBtn');
    const updateAfterBtn = document.getElementById('updateAfterImageBtn');
    if (updateBeforeBtn) {
      updateBeforeBtn.textContent = 'Change Before Image';
      updateBeforeBtn.disabled = false;
    }
    if (updateAfterBtn) {
      updateAfterBtn.textContent = 'Change After Image';
      updateAfterBtn.disabled = false;
    }
    
    // Reset update image data
    updateBeforeImageData = null;
    updateAfterImageData = null;
    
    // Set personality tags
    const tags = document.querySelectorAll('#updatePersonalityTags .staff-pet-tag');
    const personality = pet.personality || [];
    console.log('Pet personality:', personality);
    
    // First, clear all selections
    tags.forEach(tag => tag.classList.remove('selected'));
    
    // Then select the ones that match
    tags.forEach(tag => {
      const trait = tag.dataset.trait || tag.textContent.trim().toLowerCase();
      if (personality.includes(trait) || 
          personality.some(p => p.toLowerCase() === trait)) {
        tag.classList.add('selected');
      }
    });
    
    // Show modal
    const modalElement = document.getElementById('updatePetModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
      console.log('Modal opened successfully');
    } else {
      throw new Error('Update modal element not found!');
    }
    
  } catch (err) {
    console.error('ERROR in openUpdateModal:', err);
    alert('Error: ' + err.message);
  }
}function setupUpdatePet() {
  const submitBtn = document.getElementById('submitUpdatePetBtn');
  const deleteBtn = document.getElementById('deletePetInModalBtn');
  
  if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
      try {
        console.log('Update button clicked');
        
        // Get form data
        const petId = document.getElementById('updatePetId').value;
        if (!petId) {
          throw new Error('No pet ID found');
        }
        
        const petData = {
          pet_name: document.getElementById('updatePetName').value.trim(),
          pet_type: document.getElementById('updatePetType').value,
          sex: document.getElementById('updatePetSex').value,
          age: document.getElementById('updatePetAge').value,
          weight: document.getElementById('updatePetWeight').value,
          arrival_date: document.getElementById('updatePetArrivalDate').value,
          location: document.getElementById('updatePetLocation').value.trim(),
          vaccinated: !!document.getElementById('updatePetVaccinated').checked,
          about_pet: document.getElementById('updatePetDescription').value.trim(),
          status: document.getElementById('updatePetStatus').value,
          personality: Array.from(
            document.querySelectorAll('#updatePersonalityTags .staff-pet-tag.selected')
          ).map(tag => tag.dataset.trait || tag.textContent.trim())
        };
        
        console.log('Sending update for pet ID:', petId);
        console.log('Update data:', petData);
        
        // Add images if changed
        if (updateBeforeImageData) {
          petData.before_image = updateBeforeImageData;
          console.log('Including new before image');
        }
        if (updateAfterImageData) {
          petData.after_image = updateAfterImageData;
          console.log('Including new after image');
        }
        
        // Call update API
        const result = await updatePet(petId, petData);
        console.log('Update successful:', result);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('updatePetModal'));
        modal.hide();
        
        // Clear form
        document.getElementById('updatePetForm').reset();
        updateBeforeImageData = null;
        updateAfterImageData = null;
        
        // Hide image previews
        const beforeImg = document.getElementById('currentBeforeImage');
        const afterImg = document.getElementById('currentAfterImage');
        if (beforeImg) beforeImg.style.display = 'none';
        if (afterImg) afterImg.style.display = 'none';
        
        // Reset file buttons
        const updateBeforeBtn = document.getElementById('updateBeforeImageBtn');
        const updateAfterBtn = document.getElementById('updateAfterImageBtn');
        if (updateBeforeBtn) updateBeforeBtn.textContent = 'Change Before Image';
        if (updateAfterBtn) updateAfterBtn.textContent = 'Change After Image';
        
        // Reload pets list
        await loadPets();
        
        alert('✅ Pet updated successfully!');
        
      } catch (err) {
        console.error('Update failed:', err);
        alert('❌ Update failed: ' + err.message);
      }
    });
  }
  
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to delete this pet? This action cannot be undone.')) {
        try {
          const petId = document.getElementById('updatePetId').value;
          console.log('Deleting pet ID:', petId);
          
          await deletePet(petId);
          
          // Close modal
          const modal = bootstrap.Modal.getInstance(document.getElementById('updatePetModal'));
          modal.hide();
          
          // Clear form
          document.getElementById('updatePetForm').reset();
          updateBeforeImageData = null;
          updateAfterImageData = null;
          
          // Reload pets list
          await loadPets();
          
          alert('✅ Pet deleted successfully!');
          
        } catch (err) {
          console.error('Delete failed:', err);
          alert('❌ Delete failed: ' + err.message);
        }
      }
    });
  }
}
  

function setupUpdateFileHandlers() {
  // Before image
  const beforeInput = document.getElementById('updateBeforeImageInput');
  const beforeBtn = document.getElementById('updateBeforeImageBtn');
  if (beforeBtn && beforeInput) {
    beforeBtn.addEventListener('click', () => beforeInput.click());
    beforeInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          updateBeforeImageData = reader.result;
          beforeBtn.textContent = `✓ ${file.name}`;
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  // After image
  const afterInput = document.getElementById('updateAfterImageInput');
  const afterBtn = document.getElementById('updateAfterImageBtn');
  if (afterBtn && afterInput) {
    afterBtn.addEventListener('click', () => afterInput.click());
    afterInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          updateAfterImageData = reader.result;
          afterBtn.textContent = `✓ ${file.name}`;
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  // Personality tags
  document.querySelectorAll('#updatePersonalityTags .staff-pet-tag').forEach(tag => {
    tag.addEventListener('click', () => tag.classList.toggle('selected'));
  });
}

function readAddForm() {
  const personality = Array.from(document.querySelectorAll('.staff-pet-tag.selected')).map(el => el.dataset.trait || el.textContent.trim());

  // Basic validation
  const petName = document.getElementById('petName').value.trim();
  const beforeImage = beforeImageData;
  const petWeight = document.getElementById('petWeight').value;
  const arrivalDate = document.getElementById('petArrivalDate').value;
  const location = document.getElementById('petLocation').value.trim();
  const about = document.getElementById('petDescription').value.trim();

  if (!petName) throw new Error('Pet name is required');

  // Get the logged-in staff user's ID
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser || currentUser.role !== 'staff') {
    throw new Error('You must be logged in as a staff member to post a pet.');
  }

  if (!beforeImage) throw new Error('Before image is required');
  if (!arrivalDate) throw new Error('Arrival date is required');
  if (!location) throw new Error('Location is required');
  if (!about) throw new Error('About / description is required');
  if (personality.length === 0) throw new Error('At least one personality trait must be selected');

  // Normalize values to match backend enums (lowercase status/type/sex)
  const rawType = document.getElementById('petType').value || '';
  const rawSex = document.getElementById('petSex').value || '';
  const rawStatus = document.getElementById('petStatus').value || '';

  const pet_type = String(rawType).toLowerCase();
  const sex = String(rawSex).toLowerCase();
  const status = String(rawStatus).toLowerCase();

  return {
    pet_name: petName,
    pet_type,
    sex,
    age: document.getElementById('petAge').value,
    weight: petWeight ? parseFloat(petWeight) : null,
    arrival_date: arrivalDate,
    location,
    vaccinated: !!document.getElementById('petVaccinated').checked,
    about_pet: about,
    status,
    before_image: beforeImageData,
    after_image: afterImageData,
    personality: personality,
    posted_by_staff: currentUser._id // Add the staff member's ID
  };
}

async function setupAddPet() {
  const submit = document.getElementById('submitAddPetBtn');
  const modalEl = document.getElementById('addPetModal');
  let bsModal;
  if (modalEl) bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);

  if (submit) {
    submit.addEventListener('click', async () => {
      try {
        // Read the form data inside the async click handler
        // This ensures that the file reader has had time to process the image
        const petData = readAddForm();
        if (!petData.before_image) {
          throw new Error('Before image is required. Please upload an image.');
        }

        await createPet(petData);
        if (bsModal) bsModal.hide();
        // clear form
        document.getElementById('addPetForm').reset();
        // clear previews and stored images
        beforeImageData = null; 
        afterImageData = null;
        beforeImageName = null;
        afterImageName = null;
        const beforeBtn = document.getElementById('beforeImageBtn');
        const afterBtn = document.getElementById('afterImageBtn');
        if (beforeBtn) beforeBtn.textContent = 'Upload Before Image';
        if (afterBtn) afterBtn.textContent = 'Upload After Image';
        // clear selected personality tags
        document.querySelectorAll('.staff-pet-tag.selected').forEach(t => t.classList.remove('selected'));
        await loadPets();
      } catch (err) {
        console.error('Failed to add pet', err);
        alert('Failed to add pet: ' + err.message);
      }
    });
  }
}

/**
 * Fetches pets based on filters, applies client-side search, and renders them.
 */
async function applyFiltersAndLoadPets() {
  const grid = document.getElementById('petsGrid');
  if (!grid) {
    console.error('petsGrid not found!');
    return;
  }

  try {
    // 1. Get filter values from the DOM
    const name = document.getElementById('searchPetName').value.trim();
    const type = document.getElementById('filterPetType').value;
    const status = document.getElementById('filterPetStatus').value;
    const vaccinated = document.getElementById('vaccinatedFilter').checked;

    console.log('Filters:', { name, type, status, vaccinated });

    // Show loading spinner with text
    grid.innerHTML = `
      <div class="col-12">
        <div class="text-center p-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3 text-muted">Loading pets...</p>
        </div>
      </div>
    `;

    // 2. Build API params for backend filtering (excluding name search)
    const params = {};
    
    // Type filter - specific mapping for Dog and Cat
    if (type === 'Dog') {
      params.type = 'dog';
    } else if (type === 'Cat') {
      params.type = 'cat';
    }
    // If "All Types", don't send type parameter
    
    // Status filter - only send if specific status is selected
    if (status && status !== 'All Status') {
      params.status = status.toLowerCase();
    }
    
    // Vaccinated filter
    if (vaccinated) {
      params.vaccinated = 'true';
    }

    console.log('API params:', params);

    // 3. Fetch pets from the backend with filters
    const res = await getPets(params);
    console.log('API response:', res);
    
    // Check data structure and extract pets array
    let pets = [];
    if (Array.isArray(res)) {
      pets = res;
    } else if (res && res.pets) {
      pets = res.pets;
    } else if (res && res.data) {
      pets = res.data;
    }

    console.log(`Found ${pets.length} total pets from API`);

    // 4. Apply name search filter on the client-side
    if (name) {
      const searchTerm = name.toLowerCase();
      pets = pets.filter(pet => {
        const petName = (pet.pet_name || pet.name || '').toLowerCase();
        return petName.includes(searchTerm);
      });
      console.log(`After search filtering: ${pets.length} pets`);
    }

    // 5. Render the results
    grid.innerHTML = ''; // Clear spinner
    
    if (pets.length === 0) {
      grid.innerHTML = '<div class="col-12 text-center"><p class="text-muted">No pets found matching your criteria.</p></div>';
    } else {
      pets.forEach(p => grid.appendChild(createCard(p)));
    }

    // 6. Update stats and attach button handlers
    updateStats(pets);
    attachActionHandlers();

  } catch (err) {
    console.error('Failed to apply filters and load pets:', err);
    grid.innerHTML = `<div class="col-12"><div class="alert alert-danger">Failed to load pets. ${err.message}</div></div>`;
  }
}

/**
 * Sets up event listeners for the filter controls.
 */
function setupFilterListeners() {
  // hook filter apply
  document.getElementById('applyFiltersBtn')?.addEventListener('click', applyFiltersAndLoadPets);

  // Optional: Add listeners for live filtering
  const searchInput = document.getElementById('searchPetName');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(e.target.debounce);
      e.target.debounce = setTimeout(applyFiltersAndLoadPets, 500); // Debounce
    });
  }
  document.getElementById('filterPetType')?.addEventListener('change', applyFiltersAndLoadPets);
  document.getElementById('filterPetStatus')?.addEventListener('change', applyFiltersAndLoadPets);
  document.getElementById('vaccinatedFilter')?.addEventListener('change', applyFiltersAndLoadPets);
}

// ========== INITIALIZE EVERYTHING ==========

document.addEventListener('DOMContentLoaded', () => {
  loadPets(); // Initial load of all pets
  setupAddPet();
  setupUpdatePet();
  setupUpdateFileHandlers();
  setupFilterListeners(); // Setup the new filter listeners
  
  // file input handlers for images: read as base64 and preview
  const beforeInput = document.getElementById('beforeImageInput');
  const afterInput = document.getElementById('afterImageInput');
  const beforePreview = document.getElementById('beforeImagePreview');
  const afterPreview = document.getElementById('afterImagePreview');
  if (beforeInput) {
    beforeInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) {
        beforeImageData = null; 
        beforeImageName = null;
        const beforeBtn = document.getElementById('beforeImageBtn');
        if (beforeBtn) beforeBtn.textContent = 'Upload Before Image';
        return;
      }
      beforeImageName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        beforeImageData = reader.result; // data URL
      };
      reader.readAsDataURL(file);
      // Show filename on button
      const beforeBtn = document.getElementById('beforeImageBtn');
      if (beforeBtn) beforeBtn.textContent = `✓ ${file.name}`;
    });
  }
  if (afterInput) {
    afterInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) { 
        afterImageData = null; 
        afterImageName = null;
        const afterBtn = document.getElementById('afterImageBtn');
        if (afterBtn) afterBtn.textContent = 'Upload After Image';
        return; 
      }
      afterImageName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        afterImageData = reader.result;
      };
      reader.readAsDataURL(file);
      // Show filename on button
      const afterBtn = document.getElementById('afterImageBtn');
      if (afterBtn) afterBtn.textContent = `✓ ${file.name}`;
    });
  }

  // personality tag toggle
  document.querySelectorAll('.staff-pet-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      tag.classList.toggle('selected');
    });
  });

  // Upload buttons trigger hidden file inputs (preserve design while enabling upload)
  const beforeBtn = document.getElementById('beforeImageBtn');
  const afterBtn = document.getElementById('afterImageBtn');
  if (beforeBtn && beforeInput) beforeBtn.addEventListener('click', () => beforeInput.click());
  if (afterBtn && afterInput) afterBtn.addEventListener('click', () => afterInput.click());
});