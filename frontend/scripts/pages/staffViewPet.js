import { getPets, deletePet } from '../utils/staffPetsApi.js';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const petId = urlParams.get('id');

    if (!petId) {
        document.body.innerHTML = '<div class="container mt-5"><h1>Pet not found</h1><p>No pet ID was provided in the URL.</p><a href="/frontend/pages/staff/staff-pets.html">Go back to pets list</a></div>';
        return;
    }

    loadPetDetails(petId);
});

async function loadPetDetails(id) {
    try {
        // We get all pets and find the one, as there's no single-pet endpoint yet.
        const data = await getPets();
        const pet = (data.pets || []).find(p => p._id === id);

        if (!pet) {
            throw new Error('Pet not found');
        }

        populatePetDetails(pet);
        attachActionHandlers(pet);

    } catch (err) {
        console.error('Failed to load pet details:', err);
        document.getElementById('petNameHeader').textContent = 'Error';
        document.getElementById('petAbout').textContent = `Could not load pet details: ${err.message}`;
    }
}

function populatePetDetails(pet) {
    // Header
    document.getElementById('petNameHeader').textContent = pet.pet_name;
    document.title = `${pet.pet_name} - Pet Profile`; // Update page title
    document.getElementById('petSubHeader').textContent = `${pet.age || 'N/A'} • ${pet.sex || 'N/A'}`;

    // Header Tags
    const tagsHeader = document.getElementById('petTagsHeader');
    tagsHeader.innerHTML = ''; // Clear loading state
    if (pet.status) {
        const statusTag = document.createElement('span');
        statusTag.className = 'tag';
        statusTag.textContent = pet.status;
        tagsHeader.appendChild(statusTag);
    }
    if (pet.vaccinated) {
        const vaccinatedTag = document.createElement('span');
        vaccinatedTag.className = 'tag';
        vaccinatedTag.textContent = 'Vaccinated';
        tagsHeader.appendChild(vaccinatedTag);
    }

    // Images
    document.getElementById('beforeImage').src = pet.before_image || '/frontend/assets/image/photo/placeholder.jpg';
    document.getElementById('afterImage').src = pet.after_image || '/frontend/assets/image/photo/placeholder.jpg';

    // Basic Info
    document.getElementById('petInfoAge').textContent = pet.age || 'N/A';
    document.getElementById('petInfoWeight').textContent = pet.weight ? `${pet.weight} kg` : 'N/A';
    document.getElementById('petInfoSex').textContent = pet.sex || 'N/A';
    document.getElementById('petInfoLocation').textContent = pet.location || 'N/A';
    document.getElementById('petInfoArrival').textContent = `Arrived ${pet.arrival_date || 'N/A'}`;

    // Personality & About
    const personalityContainer = document.getElementById('petPersonalityTags');
    personalityContainer.innerHTML = '';
    (pet.personality || []).forEach(trait => {
        const traitTag = document.createElement('span');
        traitTag.className = 'trait-tag';
        traitTag.textContent = trait;
        personalityContainer.appendChild(traitTag);
    });

    document.getElementById('petAboutTitle').textContent = `About ${pet.pet_name}`;
    document.getElementById('petAbout').textContent = pet.about_pet || 'No description provided.';
}

function attachActionHandlers(pet) {
    const deleteBtn = document.getElementById('deletePetBtn');
    const updateBtn = document.getElementById('updatePetBtn');

    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            if (confirm(`Are you sure you want to delete ${pet.pet_name}? This action cannot be undone.`)) {
                try {
                    await deletePet(pet._id);
                    alert(`${pet.pet_name} has been deleted.`);
                    window.location.href = '/frontend/pages/staff/staff-pets.html';
                } catch (err) {
                    console.error(`Failed to delete pet ${pet._id}`, err);
                    alert(`Error: ${err.message}`);
                }
            }
        });
    }

    if (updateBtn) {
        updateBtn.addEventListener('click', () => {
            // Redirect to an update page or open a modal. For now, an alert.
            alert(`Update functionality for ${pet.pet_name} is not yet implemented.`);
        });
    }
}