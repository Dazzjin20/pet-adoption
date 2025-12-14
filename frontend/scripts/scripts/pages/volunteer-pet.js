// volunteer-pet.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing volunteer pet page');
    
    // Initialize the page
    initializeVolunteerPetPage();
});

// API function (same as your staff page)
async function getPets(params = {}) {
    const BASE = 'http://localhost:3000/api/pets';
    const url = new URL(BASE);
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.append(k, v);
    });
    
    console.log('Fetching from:', url.toString());
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to fetch pets');
    return res.json();
}

function initializeVolunteerPetPage() {
    console.log('Initializing volunteer pet page...');
    
    // Setup vaccinated section
    setupVaccinatedSection();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load initial pets
    loadAndDisplayPets();
}

function setupVaccinatedSection() {
    const vaccinatedSection = document.getElementById('vaccinatedSection');
    if (!vaccinatedSection) {
        console.error('vaccinatedSection not found!');
        return;
    }
    
    // Only "Vaccinated Only" checkbox (removed "Not Vaccinated")
    vaccinatedSection.innerHTML = `
        <h6 class="fw-bold mt-3 mb-2">Vaccinated (available)</h6>
        <div class="vaccinated-checkboxes">
            <div class="form-check mb-2">
                <input class="form-check-input" type="checkbox" id="vaccinatedYes" value="yes">
                <label class="form-check-label" for="vaccinatedYes">
                    Vaccinated Only
                </label>
            </div>
        </div>
    `;
    
    console.log('Vaccinated section setup complete');
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Apply filters button - hide it
    const applyBtn = document.getElementById('volunteerApplyFiltersBtn');
    if (applyBtn) {
        console.log('Found apply button');
        applyBtn.style.display = 'none';
    } else {
        console.error('Apply button not found!');
    }

    // Search input with debounce - AUTO FILTER
    const searchInput = document.getElementById('volunteerPetSearchInput');
    if (searchInput) {
        console.log('Found search input');
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                loadAndDisplayPets();
            }, 500);
        });
    }
    
    // Pet type filter - AUTO FILTER
    const typeFilter = document.getElementById('volunteerPetTypeFilter');
    if (typeFilter) {
        // Update dropdown to only show Cat, Dog, All Types
        typeFilter.innerHTML = `
            <option>All Types</option>
            <option>Dog</option>
            <option>Cat</option>
        `;
        
        typeFilter.addEventListener('change', loadAndDisplayPets);
        
        // Hide age and gender filters
        const ageGroupFilter = document.getElementById('volunteerAgeGroupFilter');
        if (ageGroupFilter && ageGroupFilter.parentElement) {
            ageGroupFilter.parentElement.style.display = 'none';
        }
        
        const genderFilter = document.getElementById('volunteerGenderFilter');
        if (genderFilter && genderFilter.parentElement) {
            genderFilter.parentElement.style.display = 'none';
        }
    }
    
    // Vaccinated checkbox - AUTO FILTER
    const vaccinatedYes = document.getElementById('vaccinatedYes');
    if (vaccinatedYes) {
        vaccinatedYes.addEventListener('change', loadAndDisplayPets);
    }
    
    console.log('Event listeners setup complete');
}

async function loadAndDisplayPets() {
    console.log('Loading and displaying pets...');
    
    try {
        // Get filter values
        const searchTerm = document.getElementById('volunteerPetSearchInput')?.value || '';
        const typeFilter = document.getElementById('volunteerPetTypeFilter')?.value || 'All Types';
        const vaccinatedOnly = document.getElementById('vaccinatedYes')?.checked || false;
        
        console.log('Filters:', { searchTerm, typeFilter, vaccinatedOnly });
        
        // Show loading
        const container = document.getElementById('volunteerPetsContainer');
        if (!container) {
            console.error('volunteerPetsContainer not found!');
            return;
        }
        
        container.innerHTML = `
            <div class="col-12">
                <div class="text-center p-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading pets...</span>
                    </div>
                    <p class="mt-3 text-muted">Loading pets...</p>
                </div>
            </div>
        `;
        
        // Build API params
        const params = {};
        
        // Type filter - only Cat or Dog
        if (typeFilter === 'Dog') {
            params.type = 'dog';
        } else if (typeFilter === 'Cat') {
            params.type = 'cat';
        }
        // If "All Types", don't send type parameter
        
        // Vaccinated filter - only show vaccinated when checked
        if (vaccinatedOnly) {
            params.vaccinated = 'true';
        }
        
        console.log('API params:', params);
        
        // Fetch ALL pets first (without search in API)
        const data = await getPets(params);
        console.log('API response:', data);
        
        // Check data structure
        let pets = [];
        if (Array.isArray(data)) {
            pets = data;
        } else if (data && data.pets) {
            pets = data.pets;
        } else if (data && data.data) {
            pets = data.data;
        }
        
        console.log(`Found ${pets.length} total pets`);
        
        // Filter for available pets only
        let availablePets = pets.filter(pet => {
            const status = pet.status ? pet.status.toLowerCase() : '';
            return status === 'available';
        });
        
        console.log(`Found ${availablePets.length} available pets`);
        
        // Apply search filter CLIENT-SIDE (since API search isn't working)
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            availablePets = availablePets.filter(pet => {
                const petName = (pet.pet_name || pet.name || '').toLowerCase();
                return petName.includes(searchLower);
            });
            console.log(`After search filtering: ${availablePets.length} pets`);
        }
        
        // Display pets
        displayPets(availablePets);
        
    } catch (error) {
        console.error('Error loading pets:', error);
        
        const container = document.getElementById('volunteerPetsContainer');
        if (container) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        <h5>Error Loading Pets</h5>
                        <p>${error.message}</p>
                        <button class="btn btn-primary btn-sm mt-2" onclick="loadAndDisplayPets()">
                            Try Again
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

function displayPets(pets) {
    console.log('Displaying pets:', pets.length);
    
    const container = document.getElementById('volunteerPetsContainer');
    if (!container) {
        console.error('Container not found!');
        return;
    }
    
    if (pets.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="text-center p-5 bg-white rounded-4 border">
                    <h5 class="text-muted mb-3">No pets found</h5>
                    <p class="text-muted">Try adjusting your filters or check back later.</p>
                </div>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    pets.forEach((pet, index) => {
        console.log(`Pet ${index}:`, pet.name || pet.pet_name);
        
        // Get pet properties
        const petName = pet.pet_name || pet.name || 'Unknown Name';
        const petAge = pet.age || 'N/A';
        const petGender = pet.sex ? (pet.sex.charAt(0).toUpperCase() + pet.sex.slice(1)) : 'Unknown';
        const petLocation = pet.location || 'Main Shelter - Delro';
        const petArrival = pet.arrival_date ? formatDate(pet.arrival_date) : 'N/A';
        const petImage = pet.before_image || pet.image || '../../assets/image/photo/pet-placeholder.jpg';
        
        html += `
            <div class="col-md-6 col-lg-4">
                <div class="staff-pet-card" data-pet-id="${pet._id || pet.id || index}">
                    <img src="${petImage}" 
                         alt="${petName}" 
                         class="staff-pet-card-img"
                         onerror="this.onerror=null; this.src='../../assets/image/photo/pet-placeholder.jpg';">
                    <div class="staff-pet-card-body">
                        <div class="staff-pet-card-name">${petName}</div>
                        <div class="staff-pet-card-details">${petAge} - ${petGender}</div>
                        <div class="staff-pet-card-location">${petLocation}</div>
                        <div class="staff-pet-card-location">Arrived ${petArrival}</div>
                        <div class="mt-3">
                            <button class="btn volunteer-pet-btn btn-sm w-100 viewPetBtn" 
                                    data-pet-id="${pet._id || pet.id || index}"
                                    data-pet-data='${JSON.stringify(pet).replace(/'/g, "\\'")}'>
                                View Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Attach event listeners for modal view
    attachModalViewListeners();
    
    console.log('Pets displayed successfully');
}

// NEW FUNCTION: Attach modal view listeners
function attachModalViewListeners() {
    document.querySelectorAll('.viewPetBtn').forEach(button => {
        button.addEventListener('click', function(e) {
            const petId = this.getAttribute('data-pet-id');
            const petData = this.getAttribute('data-pet-data');
            
            console.log('View details clicked for pet:', petId);
            
            // Use existing showPetDetails function with petId
            if (petId) {
                showPetDetailsModal(petId, petData ? JSON.parse(petData) : null);
            }
        });
    });
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
}

function viewPetDetails(petId) {
    console.log('Viewing details for pet:', petId);
    alert(`View details for pet ID: ${petId}\n\nIn a real application, this would show pet details.`);
    
    // To redirect to a details page:
    // window.location.href = `volunteer-pet-details.html?id=${petId}`;
}

// Add this function to your volunteer-pet.js
async function showPetDetails(petId) {
    console.log('Loading details for pet:', petId);
    
    try {
        // Get the specific pet
        const response = await fetch(`http://localhost:3000/api/pets/${petId}`);
        if (!response.ok) throw new Error('Failed to fetch pet details');
        
        const pet = await response.json();
        console.log('Pet details:', pet);
        
        // Create modal content
        const modalContent = `
            <div class="row">
                <!-- Images -->
                <div class="col-md-6">
                    <h6 class="fw-bold mb-2">Before Image</h6>
                    <img src="${pet.before_image || '../../assets/image/photo/pet-placeholder.jpg'}" 
                         alt="${pet.pet_name}" 
                         class="img-fluid rounded mb-3"
                         onerror="this.onerror=null; this.src='../../assets/image/photo/pet-placeholder.jpg';">
                    
                    ${pet.after_image ? `
                    <h6 class="fw-bold mb-2">After Image</h6>
                    <img src="${pet.after_image}" 
                         alt="${pet.pet_name} after" 
                         class="img-fluid rounded"
                         onerror="this.onerror=null; this.src='../../assets/image/photo/pet-placeholder.jpg';">
                    ` : ''}
                </div>
                
                <!-- Details -->
                <div class="col-md-6">
                    <h4 class="fw-bold text-primary mb-3">${pet.pet_name || 'Unknown Name'}</h4>
                    
                    <div class="row mb-3">
                        <div class="col-6">
                            <p class="mb-1"><strong>Type:</strong> ${pet.pet_type ? pet.pet_type.charAt(0).toUpperCase() + pet.pet_type.slice(1) : 'N/A'}</p>
                        </div>
                        <div class="col-6">
                            <p class="mb-1"><strong>Gender:</strong> ${pet.sex ? pet.sex.charAt(0).toUpperCase() + pet.sex.slice(1) : 'N/A'}</p>
                        </div>
                        <div class="col-6">
                            <p class="mb-1"><strong>Age:</strong> ${pet.age || 'N/A'}</p>
                        </div>
                        <div class="col-6">
                            <p class="mb-1"><strong>Weight:</strong> ${pet.weight ? pet.weight + ' kg' : 'N/A'}</p>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <p class="mb-1"><strong>Location:</strong> ${pet.location || 'Main Shelter - Delro'}</p>
                        <p class="mb-1"><strong>Arrival Date:</strong> ${formatDate(pet.arrival_date) || 'N/A'}</p>
                        <p class="mb-1"><strong>Status:</strong> <span class="badge ${getStatusBadgeClass(pet.status)}">${pet.status || 'Unknown'}</span></p>
                        <p class="mb-1"><strong>Vaccinated:</strong> ${pet.vaccinated ? '✅ Yes' : '❌ No'}</p>
                    </div>
                    
                    ${pet.personality && pet.personality.length > 0 ? `
                    <div class="mb-3">
                        <h6 class="fw-bold mb-2">Personality</h6>
                        <div>
                            ${pet.personality.map(trait => `<span class="badge bg-light text-dark me-1 mb-1">${trait}</span>`).join('')}
                        </div>
                    </div>
                    ` : ''}
                    
                    ${pet.about_pet ? `
                    <div class="mb-3">
                        <h6 class="fw-bold mb-2">About ${pet.pet_name || 'this pet'}</h6>
                        <p class="text-muted">${pet.about_pet}</p>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Update modal content
        document.getElementById('petDetailsContent').innerHTML = modalContent;
        
        // Update modal title
        document.getElementById('viewPetModalLabel').textContent = `${pet.pet_name || 'Pet'} Details`;
        
        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('viewPetModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error loading pet details:', error);
        document.getElementById('petDetailsContent').innerHTML = `
            <div class="alert alert-danger">
                <h5>Error Loading Details</h5>
                <p>${error.message}</p>
                <button class="btn btn-primary btn-sm mt-2" onclick="showPetDetails('${petId}')">
                    Try Again
                </button>
            </div>
        `;
        
        // Still show the modal with error
        const modal = new bootstrap.Modal(document.getElementById('viewPetModal'));
        modal.show();
    }
}

// NEW FUNCTION: Display pet in modal (using the structure from your HTML)
async function showPetDetailsModal(petId, cachedPetData = null) {
    console.log('Loading pet details for modal:', petId);
    
    try {
        let pet = cachedPetData;
        
        // If we don't have cached data, fetch it
        if (!pet) {
            const response = await fetch(`http://localhost:3000/api/pets/${petId}`);
            if (!response.ok) throw new Error('Failed to fetch pet details');
            pet = await response.json();
        }
        
        console.log('Pet details for modal:', pet);
        
        // Fill the modal with data
        fillPetModal(pet);
        
        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('viewPetModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error loading pet details for modal:', error);
        
        // Show error in modal
        document.getElementById('petDetailsContent').innerHTML = `
            <div class="text-center p-5">
                <div class="alert alert-danger">
                    <h5>Error Loading Details</h5>
                    <p>${error.message}</p>
                    <button class="btn btn-primary btn-sm mt-2" onclick="showPetDetailsModal('${petId}')">
                        Try Again
                    </button>
                </div>
            </div>
        `;
        
        const modal = new bootstrap.Modal(document.getElementById('viewPetModal'));
        modal.show();
    }
}

// NEW FUNCTION: Fill modal with pet data
function fillPetModal(pet) {
    // Pet header info
    document.getElementById('modalPetNameHeader').textContent = pet.pet_name || pet.name || 'Unknown Name';
    document.getElementById('modalPetSubHeader').textContent = `${pet.age || 'N/A'} - ${pet.sex ? pet.sex.charAt(0).toUpperCase() + pet.sex.slice(1) : 'Unknown'} • ${pet.pet_type || 'Pet'}`;
    
    // Tags (if available)
    const tagsContainer = document.getElementById('modalPetTagsHeader');
    tagsContainer.innerHTML = '';
    
    if (pet.status) {
        const badgeClass = getStatusBadgeClass(pet.status);
        const statusTag = `<span class="badge ${badgeClass}">${pet.status}</span>`;
        tagsContainer.innerHTML += statusTag;
    }
    
    if (pet.vaccinated) {
        const vaccineTag = `<span class="badge bg-success">Vaccinated</span>`;
        tagsContainer.innerHTML += vaccineTag;
    }
    
    // Images
    const beforeImg = document.getElementById('modalBeforeImage');
    const afterImg = document.getElementById('modalAfterImage');
    
    beforeImg.src = pet.before_image || '/frontend/assets/image/photo/placeholder.jpg';
    beforeImg.alt = `Before: ${pet.pet_name || 'Pet'}`;
    beforeImg.onerror = function() {
        this.src = '/frontend/assets/image/photo/placeholder.jpg';
    };
    
    afterImg.src = pet.after_image || '/frontend/assets/image/photo/placeholder.jpg';
    afterImg.alt = `After: ${pet.pet_name || 'Pet'}`;
    afterImg.onerror = function() {
        this.src = '/frontend/assets/image/photo/placeholder.jpg';
    };
    
    // Basic information
    document.getElementById('modalPetInfoAge').textContent = pet.age || 'N/A';
    document.getElementById('modalPetInfoWeight').textContent = pet.weight ? `${pet.weight} kg` : 'N/A';
    document.getElementById('modalPetInfoSex').textContent = pet.sex ? pet.sex.charAt(0).toUpperCase() + pet.sex.slice(1) : 'Unknown';
    document.getElementById('modalPetInfoLocation').textContent = pet.location || 'Main Shelter - Delro';
    document.getElementById('modalPetInfoType').textContent = pet.pet_type ? pet.pet_type.charAt(0).toUpperCase() + pet.pet_type.slice(1) : 'N/A';
    document.getElementById('modalPetInfoStatus').textContent = pet.status || 'Available';
    document.getElementById('modalPetInfoArrival').textContent = `Arrived: ${formatDate(pet.arrival_date) || 'N/A'}`;
    
    // Personality tags
    const personalityContainer = document.getElementById('modalPetPersonalityTags');
    personalityContainer.innerHTML = '';
    
    if (pet.personality && Array.isArray(pet.personality) && pet.personality.length > 0) {
        pet.personality.forEach(trait => {
            const badge = `<span class="badge bg-light text-dark border me-2 mb-2">${trait}</span>`;
            personalityContainer.innerHTML += badge;
        });
    } else if (pet.traits) {
        // Try traits if personality not available
        const badge = `<span class="badge bg-light text-dark border me-2 mb-2">${pet.traits}</span>`;
        personalityContainer.innerHTML += badge;
    } else {
        personalityContainer.innerHTML = '<span class="text-muted">No personality traits recorded</span>';
    }
    
    // About section
    document.getElementById('modalPetAboutTitle').textContent = `About ${pet.pet_name || 'this pet'}`;
    document.getElementById('modalPetAbout').textContent = pet.about_pet || pet.description || 'No description available for this pet.';
    
    // Volunteer notes (if available)
    const notesElement = document.getElementById('modalPetVolunteerNotes');
    if (pet.volunteer_notes) {
        notesElement.textContent = pet.volunteer_notes;
    } else if (pet.special_notes) {
        notesElement.textContent = pet.special_notes;
    } else {
        notesElement.textContent = 'No special notes available.';
    }
    
    // Set up button handlers
    const taskBtn = document.getElementById('modalTaskAssignmentBtn');
    const editBtn = document.getElementById('modalEditPetBtn');
    
    if (taskBtn) {
        taskBtn.onclick = function() {
            alert(`Assigning task for ${pet.pet_name || 'this pet'}`);
            // Implement task assignment logic here
        };
    }
    
    if (editBtn) {
        editBtn.onclick = function() {
            alert(`Editing ${pet.pet_name || 'this pet'}`);
            // Implement edit logic here
        };
    }
}

// Helper function for status badge colors
function getStatusBadgeClass(status) {
    const s = (status || '').toLowerCase();
    switch (s) {
        case 'available': return 'bg-success';
        case 'pending': return 'bg-warning text-dark';
        case 'adopted': return 'bg-info';
        case 'medical': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

// Update the viewPetDetails function to call showPetDetails
window.viewPetDetails = function(petId) {
    showPetDetails(petId);
};

// Or update the attachViewDetailsHandlers function:
function attachViewDetailsHandlers() {
    document.querySelectorAll('.viewPetBtn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const petId = e.currentTarget.dataset.petId;
            if (petId) {
                showPetDetails(petId);
            }
        });
    });
}

// Make functions available globally
window.loadAndDisplayPets = loadAndDisplayPets;
window.viewPetDetails = viewPetDetails;