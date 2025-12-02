import { getPets, createPet, updatePet, deletePet } from '../utils/staffPetsApi.js';

// Hold base64 image data for create/update
let beforeImageData = null;
let afterImageData = null;

function createCard(pet) {
  const col = document.createElement('div');
  col.className = 'col-md-6 col-lg-4';
  col.innerHTML = `
    <div class="staff-pet-card" data-pet-id="${pet._id}" data-pet-type="${pet.pet_type}" data-pet-status="${pet.status}">
      <img src="${pet.before_image || '/frontend/assets/image/photo/BoyIcon.jpg'}" alt="${pet.pet_name}" class="staff-pet-card-img">
      <div class="staff-pet-card-body">
        <div class="staff-pet-card-name">${pet.pet_name}</div>
        <div class="staff-pet-card-details">${pet.age || 'N/A'} - ${pet.sex || ''}</div>
        <div class="staff-pet-card-location">${pet.location || ''}</div>
        <div class="staff-pet-card-location">Arrived ${pet.arrival_date || ''}</div>
        <div class="mt-3">
          <button class="btn staff-pet-btn btn-sm w-100 viewPetBtn" data-pet-id="${pet._id}">View Details</button>
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
    attachViewHandlers();
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

function attachViewHandlers() {
  document.querySelectorAll('.viewPetBtn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = btn.dataset.petId;
      try {
        const res = await getPets(); // simple: reload full list and find id
        const pet = (res.pets || []).find(x => x._id === id);
        if (!pet) return alert('Pet not found');
        // show a quick details modal or alert for now
        alert(`${pet.pet_name}\nStatus: ${pet.status}\nType: ${pet.pet_type}\nLocation: ${pet.location}`);
      } catch (err) {
        console.error(err);
      }
    });
  });
}

function readAddForm() {
  return {
    pet_name: document.getElementById('petName').value,
    pet_type: document.getElementById('petType').value,
    sex: document.getElementById('petSex').value,
    age: document.getElementById('petAge').value,
    arrival_date: document.getElementById('petArrivalDate').value,
    location: document.getElementById('petLocation').value,
    vaccinated: !!document.getElementById('petVaccinated').checked,
    about_pet: document.getElementById('petDescription').value,
    status: document.getElementById('petStatus').value,
    before_image: beforeImageData,
    after_image: afterImageData,
    personality: Array.from(document.querySelectorAll('.staff-pet-tag.selected')).map(el => el.dataset.trait || el.textContent.trim())
  };
}

async function setupAddPet() {
  const submit = document.getElementById('submitAddPetBtn');
  const modalEl = document.getElementById('addPetModal');
  let bsModal;
  if (modalEl) bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);

  if (submit) {
    submit.addEventListener('click', async () => {
      const petData = readAddForm();
      try {
        await createPet(petData);
        if (bsModal) bsModal.hide();
        // clear form
        document.getElementById('addPetForm').reset();
        // clear previews and stored images
        beforeImageData = null; afterImageData = null;
        const beforePreview = document.getElementById('beforeImagePreview');
        const afterPreview = document.getElementById('afterImagePreview');
        if (beforePreview) beforePreview.src = '/frontend/assets/image/photo/BoyIcon.jpg';
        if (afterPreview) afterPreview.src = '/frontend/assets/image/photo/BoyIcon.jpg';
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

document.addEventListener('DOMContentLoaded', () => {
  loadPets();
  setupAddPet();
  // file input handlers for images: read as base64 and preview
  const beforeInput = document.getElementById('beforeImageInput');
  const afterInput = document.getElementById('afterImageInput');
  const beforePreview = document.getElementById('beforeImagePreview');
  const afterPreview = document.getElementById('afterImagePreview');
  if (beforeInput) {
    beforeInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) {
        beforeImageData = null; return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        beforeImageData = reader.result; // data URL
        if (beforePreview) beforePreview.src = beforeImageData;
      };
      reader.readAsDataURL(file);
    });
  }
  if (afterInput) {
    afterInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) { afterImageData = null; return; }
      const reader = new FileReader();
      reader.onload = () => {
        afterImageData = reader.result;
        if (afterPreview) afterPreview.src = afterImageData;
      };
      reader.readAsDataURL(file);
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

  // hook filter apply
  document.getElementById('applyFiltersBtn')?.addEventListener('click', async () => {
    const name = document.getElementById('searchPetName').value;
    const type = document.getElementById('filterPetType').value;
    const status = document.getElementById('filterPetStatus').value;
    const vaccinated = document.getElementById('vaccinatedFilter').checked ? 'true' : undefined;
    const params = {};
    if (type && type !== 'All Types') params.type = type;
    if (status && status !== 'All Status') params.status = status;
    if (vaccinated) params.vaccinated = vaccinated;
    try {
      const res = await getPets(params);
      const pets = res.pets || [];
      const grid = document.getElementById('petsGrid');
      grid.innerHTML = '';
      pets.forEach(p => grid.appendChild(createCard(p)));
      updateStats(pets);
      attachViewHandlers();
    } catch (err) {
      console.error(err);
    }
  });
});
