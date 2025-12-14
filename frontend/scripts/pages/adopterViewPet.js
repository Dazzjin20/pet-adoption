import { getPets } from '../utils/staffPetsApi.js';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const petId = urlParams.get('id');

    if (!petId) {
        document.body.innerHTML = '<div class="container mt-5"><h1>Pet not found</h1><p>No pet ID was provided in the URL.</p><a href="/frontend/pages/adopters/adopter-pet.html">Go back to pets list</a></div>';
        return;
    }

    loadPetDetails(petId);
    setupPetProfileTabs(petId); // Call this here to set up dynamic tabs
});

async function loadPetDetails(id) {
    try {
        const data = await getPets(); // Assuming getPets can fetch all pets
        const pet = (data.pets || []).find(p => p._id === id);

        if (!pet) {
            throw new Error('Pet not found');
        }

        populatePetDetails(pet);
        attachActionHandlers(pet);

    } catch (err) {
        console.error('Failed to load pet details:', err);
        // Ensure these elements exist before trying to set textContent
        const petNameHeader = document.getElementById('petNameHeader');
        if (petNameHeader) petNameHeader.textContent = 'Error';
        const petAbout = document.getElementById('petAbout');
        if (petAbout) petAbout.textContent = `Could not load pet details: ${err.message}`;
    }
}

function populatePetDetails(pet) {
    // Header
    document.title = `${pet.pet_name} - Pet Profile`;
    const petNameHeader = document.getElementById('petNameHeader');
    if (petNameHeader) petNameHeader.textContent = pet.pet_name;

    const petSubHeader = document.getElementById('petSubHeader');
    if (petSubHeader) petSubHeader.textContent = `${pet.age || 'N/A'} • ${pet.sex || 'N/A'}`;

    // Header Tags
    const tagsHeader = document.getElementById('petTagsHeader');
    if (tagsHeader) {
        tagsHeader.innerHTML = '';
        if (pet.status) {
            const statusTag = document.createElement('span');
            statusTag.className = 'badge-green ms-1';
            statusTag.textContent = pet.status;
            tagsHeader.appendChild(statusTag);
        }
        if (pet.vaccinated) {
            const vaccinatedTag = document.createElement('span');
            vaccinatedTag.className = 'badge-green ms-1';
            vaccinatedTag.textContent = 'Vaccinated';
            tagsHeader.appendChild(vaccinatedTag);
        }
    }

    // Images
    const beforeImage = document.getElementById('beforeImage');
    if (beforeImage) beforeImage.src = pet.before_image || '/frontend/assets/image/photo/placeholder.jpg';

    const afterImage = document.getElementById('afterImage');
    if (afterImage) afterImage.src = pet.after_image || '/frontend/assets/image/photo/placeholder.jpg';

    // Basic Info
    const petInfoAge = document.getElementById('petInfoAge');
    if (petInfoAge) petInfoAge.textContent = pet.age || 'N/A';

    const petInfoWeight = document.getElementById('petInfoWeight');
    if (petInfoWeight) petInfoWeight.textContent = pet.weight ? `${pet.weight} kg` : 'N/A';

    const petInfoSex = document.getElementById('petInfoSex');
    if (petInfoSex) petInfoSex.textContent = pet.sex || 'N/A';

    const petInfoLocation = document.getElementById('petInfoLocation');
    if (petInfoLocation) petInfoLocation.textContent = pet.location || 'N/A';

    const petInfoArrival = document.getElementById('petInfoArrival');
    if (petInfoArrival) petInfoArrival.textContent = `Arrived ${pet.arrival_date || 'N/A'}`;

    // Personality & About
    const personalityContainer = document.getElementById('petPersonalityTags');
    if (personalityContainer) {
        personalityContainer.innerHTML = '';
        (pet.personality || []).forEach(trait => {
            const traitTag = document.createElement('span');
            traitTag.className = 'trait-tag';
            traitTag.textContent = trait;
            personalityContainer.appendChild(traitTag);
        });
    }

    const petAboutTitle = document.getElementById('petAboutTitle');
    if (petAboutTitle) petAboutTitle.textContent = `About ${pet.pet_name}`;

    const petAbout = document.getElementById('petAbout');
    if (petAbout) petAbout.textContent = pet.about_pet || 'No description provided.';
}

function attachActionHandlers(pet) {
    const favoriteBtn = document.getElementById('favoriteBtn');
    const applyBtn = document.getElementById('applyToAdoptBtn');

    // Favorite button functionality
    if (favoriteBtn) {
        // --- FIX: Make favorites key user-specific ---
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const favoritesKey = currentUser ? `favorites_${currentUser._id}` : 'favorites_guest';
        // Check localStorage if this pet is already favorited
        let favorites = JSON.parse(localStorage.getItem(favoritesKey)) || [];
        if (favorites.includes(pet._id)) {
            favoriteBtn.classList.add('favorited');
        }

        favoriteBtn.addEventListener('click', () => {
            favoriteBtn.classList.toggle('favorited');
            let favorites = JSON.parse(localStorage.getItem(favoritesKey)) || [];
            if (favoriteBtn.classList.contains('favorited')) {
                // Add to favorites if not already there
                if (!favorites.includes(pet._id)) {
                    favorites.push(pet._id);
                }
            } else {
                // Remove from favorites
                favorites = favorites.filter(id => id !== pet._id);
            }
            localStorage.setItem(favoritesKey, JSON.stringify(favorites));
        });
    }

    // Apply to Adopt button functionality
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            alert(`You are applying to adopt ${pet.pet_name}! This feature is under development.`);
            // Future implementation: window.location.href = `/apply.html?petId=${pet._id}`;
        });
    }
}

function setupPetProfileTabs(petId) {
    const petProfileNavTabs = document.getElementById('petProfileNavTabs');
    if (!petProfileNavTabs) return;

    const currentPath = window.location.pathname;
    const currentFileName = currentPath.substring(currentPath.lastIndexOf('/') + 1);

    petProfileNavTabs.querySelectorAll('li').forEach(li => {
        const anchor = li.querySelector('a');
        const tabType = li.dataset.tabType;

        if (anchor && tabType) {
            let href = '#';
            let isActive = false;

            if (tabType === 'overview') {
                href = `/frontend/pages/adopters/adopter-view-pet.html?id=${petId}`;
                isActive = currentFileName === 'adopter-view-pet.html';
            } else if (tabType === 'medical') {
                href = `/frontend/pages/adopters/adopter-information/adopter-medical.html?id=${petId}`;
                isActive = currentFileName === 'adopter-medical.html';
            }
            anchor.href = href;
            if (isActive) anchor.classList.add('active');
            else anchor.classList.remove('active');
        }
    });
}