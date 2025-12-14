import { getPets } from '../utils/staffPetsApi.js';

document.addEventListener('DOMContentLoaded', () => {
    loadFavoritePets();
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
        const favoritePets = allPets.filter(pet => favoriteIds.includes(pet._id));

        grid.innerHTML = ''; // Clear spinner

        if (favoritePets.length === 0) {
            grid.innerHTML = '<div class="col-12 text-center"><p class="text-muted">Your favorited pets could not be found. They may have been removed.</p></div>';
        } else {
            favoritePets.forEach(pet => grid.appendChild(createFavoritePetCard(pet)));
        }
        updateStats(favoritePets);

    } catch (error) {
        console.error('Failed to load favorite pets:', error);
        grid.innerHTML = '<div class="col-12"><div class="alert alert-danger">Could not load your favorite pets. Please try again later.</div></div>';
    }
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
                    <button class="btn btn-primary w-50">Apply to Adopt</button>
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