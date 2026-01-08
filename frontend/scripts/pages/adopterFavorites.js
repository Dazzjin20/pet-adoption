import { getPets } from '../utils/staffPetsApi.js';

let allFavoritePets = []; // Store all favorites globally for filtering

document.addEventListener('DOMContentLoaded', () => {
    loadFavoritePets();
    setupFilters(); // Initialize filter listeners
});

/**
 * Fetches all pets, filters them based on localStorage, and renders the favorites.
 */
async function loadFavoritePets() {
    const grid = document.getElementById('favoritesGrid');
    if (!grid) return;

    grid.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';

    // --- FIX: Make favorites key user-specific ---
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const favoritesKey = currentUser ? `favorites_${currentUser._id}` : 'favorites_guest';
    let favoriteIds = JSON.parse(localStorage.getItem(favoritesKey)) || [];
    // Ensure favoriteIds is always an array
    if (!Array.isArray(favoriteIds)) favoriteIds = [];

    if (favoriteIds.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center">
                <div class="p-5 bg-white rounded-4 border">
                    <i class="fa-regular fa-heart fs-1 text-muted mb-3"></i>
                    <h4 class="fw-bold">No Favorites Yet</h4>
                    <p class="text-muted">You haven't added any pets to your favorites. Start browsing to find a pet you love!</p>
                    <a href="adopter-pet.html" class="btn adopter-pet-btn mt-2">Browse Pets</a>
                </div>
            </div>`;
        updateStats([]); // Update stats to show zero
        return;
    }

    try {
        const data = await getPets();
        const allPets = data.pets || [];
        // Store in global variable
        allFavoritePets = allPets.filter(pet => favoriteIds.includes(pet._id));

        // Update stats based on ALL favorites
        updateStats(allFavoritePets);
        // Render grid with initial filters (shows all)
        applyFilters();

    } catch (error) {
        console.error('Failed to load favorite pets:', error);
        grid.innerHTML = '<div class="col-12"><div class="alert alert-danger">Could not load your favorite pets. Please try again later.</div></div>';
    }
}

/**
 * Sets up event listeners for search, filter, and sort inputs.
 * Assumes HTML elements with IDs: favSearch, favType, favAge, favSort
 */
function setupFilters() {
    const searchInput = document.getElementById('favSearch');
    const typeFilter = document.getElementById('favType');
    const ageFilter = document.getElementById('favAge');
    const sortFilter = document.getElementById('favSort');

    // Debugging: Log what we found
    console.log('Setup Filters - Elements found:', {
        searchInput: !!searchInput,
        typeFilter: !!typeFilter,
        ageFilter: !!ageFilter,
        sortFilter: !!sortFilter
    });

    // Add event listeners
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    
    if (typeFilter) {
        typeFilter.addEventListener('change', applyFilters);
    }
    
    if (ageFilter) {
        ageFilter.addEventListener('change', applyFilters);
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', applyFilters);
    }
}

function applyFilters() {
    console.log('applyFilters called'); // Debug log
    
    const searchInput = document.getElementById('favSearch');
    const typeFilter = document.getElementById('favType');
    const ageFilter = document.getElementById('favAge');
    const sortFilter = document.getElementById('favSort');
    
    // Check if elements exist
    if (!searchInput || !typeFilter || !ageFilter || !sortFilter) {
        console.error('Filter elements not found!');
        return;
    }
    
    const searchTerm = searchInput.value.toLowerCase() || '';
    const typeVal = typeFilter.value || 'All';
    const ageVal = ageFilter.value || 'All';
    const sortVal = sortFilter.value || 'Default';

    console.log('Filtering with:', { searchTerm, typeVal, ageVal, sortVal });

    let filtered = allFavoritePets.filter(pet => {
        // 1. Search by Name, Type, or Sex
        const searchLower = searchTerm.toLowerCase();
        const nameMatch = (pet.pet_name || '').toLowerCase().includes(searchLower) || 
                          (pet.pet_type || '').toLowerCase().includes(searchLower) ||
                          (pet.sex || '').toLowerCase().includes(searchLower) ||
                          (pet.age || '').toString().toLowerCase().includes(searchLower);

        // 2. Filter by Type
        let typeMatch = true;
        if (typeVal !== 'All' && typeVal !== 'All Types') {
            typeMatch = (pet.pet_type || '').toLowerCase() === typeVal.toLowerCase();
        }

        // 3. Filter by Age Group
        let ageMatch = true;
        if (ageVal !== 'All' && ageVal !== 'All Ages') {
            const age = parseAge(pet.age);
            const pType = (pet.pet_type || '').toLowerCase();

            if (pType === 'dog') {
                if (ageVal === 'Young') ageMatch = age <= 1;
                else if (ageVal === 'Adult') ageMatch = age > 1 && age <= 6;
                else if (ageVal === 'Senior') ageMatch = age >= 7;
            } else if (pType === 'cat') {
                if (ageVal === 'Young') ageMatch = age <= 1;
                else if (ageVal === 'Adult') ageMatch = age > 1 && age <= 10;
                else if (ageVal === 'Senior') ageMatch = age >= 11;
            } else {
                // Default for other animals
                if (ageVal === 'Young') ageMatch = age <= 1;
                else if (ageVal === 'Adult') ageMatch = age > 1 && age <= 6;
                else if (ageVal === 'Senior') ageMatch = age >= 7;
            }
        }

        return nameMatch && typeMatch && ageMatch;
    });

    // 4. Sorting
    if (sortVal === 'Oldest') {
        filtered.sort((a, b) => parseAge(b.age) - parseAge(a.age));
    } else if (sortVal === 'A-Z') {
        filtered.sort((a, b) => (a.pet_name || '').localeCompare(b.pet_name || ''));
    }
    // Default (Recently Added) - keep original order

    console.log('Filtered results:', filtered.length, 'pets');
    renderGrid(filtered);
}


function renderGrid(pets) {
    const grid = document.getElementById('favoritesGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (pets.length === 0) {
        grid.innerHTML = '<div class="col-12 text-center"><p class="text-muted">No pets found matching your criteria.</p></div>';
        return;
    }

    pets.forEach(pet => grid.appendChild(createFavoritePetCard(pet)));
}

function parseAge(ageStr) {
    if (!ageStr) return 0;
    const str = String(ageStr).toLowerCase();
    const val = parseFloat(str);
    if (isNaN(val)) return 0;
    if (str.includes('month')) return val / 12; // Convert months to years
    return val;
}

/**
 * Creates an HTML card for a single favorite pet.
 * @param {object} pet The pet object from the API.
 * @returns {HTMLDivElement} The pet card element.
 */
function createFavoritePetCard(pet) {
    const col = document.createElement('div');
    col.className = 'col-md-6';

    const statusBadge = pet.status === 'available' 
        ? `<span class="badge pet-status-badge bg-success">Available</span>`
        : `<span class="badge pet-status-badge bg-secondary">${pet.status}</span>`;

    col.innerHTML = `
        <article class="card rounded-4 shadow-sm border-0 position-relative">
            <span class="favorite-badge">❤️ Favorite</span>
            <img src="${pet.before_image || '/frontend/assets/image/photo/placeholder.jpg'}" class="pet-card-img" alt="${pet.pet_name}">
            <div class="p-3">
                <h5 class="fw-bold">${pet.pet_name}</h5>
                <p class="text-muted small mb-1">${pet.age || 'N/A'} • ${pet.sex || 'N/A'}</p>
                <span class="badge pet-status-badge">${pet.vaccinated ? 'Vaccinated' : 'Not Vaccinated'}</span>
                ${statusBadge}
                <p class="text-muted small mt-3">${(pet.about_pet || 'No description.').substring(0, 100)}...</p>
                <p class="text-muted small"><i class="fa-regular fa-clock me-1"></i> Added ${pet.arrival_date || 'N/A'}</p>
                <div class="d-flex justify-content-between">
                    <a href="adopter-view-pet.html?id=${pet._id}" class="btn btn-outline-primary w-50 me-2">View Details</a>
                </div>
            </div>
        </article>
    `;
    return col;
}

/**
 * Updates the statistics cards based on the list of favorite pets.
 * @param {Array<object>} favoritePets The array of favorite pet objects.
 */
function updateStats(favoritePets) {
    document.getElementById('totalFavoritesCount').textContent = favoritePets.length;
    document.getElementById('dogFavoritesCount').textContent = favoritePets.filter(p => p.pet_type === 'dog').length;
    document.getElementById('catFavoritesCount').textContent = favoritePets.filter(p => p.pet_type === 'cat').length;
    document.getElementById('availableFavoritesCount').textContent = favoritePets.filter(p => p.status === 'available').length;
}