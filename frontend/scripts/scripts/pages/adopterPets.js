import { getPets } from '../utils/staffPetsApi.js';

/**
 * Creates an HTML card for a single pet.
 * @param {object} pet The pet object from the API.
 * @returns {HTMLDivElement} The pet card element.
 */
function createPetCard(pet) {
    const col = document.createElement('div');
    col.className = 'col-md-6';

    // --- FIX: Make favorites key user-specific ---
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const favoritesKey = currentUser ? `favorites_${currentUser._id}` : 'favorites_guest';
    let favorites = JSON.parse(localStorage.getItem(favoritesKey)) || [];
    // Ensure favorites is always an array to prevent .includes() error
    if (!Array.isArray(favorites)) favorites = [];
    const isFavorited = favorites.includes(pet._id);
    const favoritedClass = isFavorited ? 'favorited' : '';
    const heartIconClass = isFavorited ? 'fa-solid' : 'fa-regular';
    
    const statusBadge = getStatusBadge(pet.status);
    const vaccinatedBadge = pet.vaccinated ? '<span class="badge bg-primary">Vaccinated</span>' : '';

    // Escape quotes in pet name for JavaScript
    const safePetName = escapeQuotes(pet.pet_name || 'Unknown Pet');
    
    col.innerHTML = `
        <div class="adopter-pet-card" data-pet-id="${pet._id}">
            <img src="${pet.before_image || '/frontend/assets/image/photo/placeholder.jpg'}" 
                 class="adopter-pet-card-img" 
                 alt="${pet.pet_name}" 
                 onclick="viewPetDetails('${pet._id}')" 
                 style="cursor: pointer;">
            <div class="adopter-pet-card-body">
                <div class="adopter-pet-name">${pet.pet_name}</div>
                <div class="adopter-pet-info">${pet.age || 'N/A'} – ${pet.sex || 'N/A'}</div>
                <div class="adopter-pet-location">${pet.location || 'N/A'}</div>
                <div class="adopter-pet-arrival">Arrived ${pet.arrival_date || 'N/A'}</div>
                <div class="adopter-pet-badges">
                    ${statusBadge}
                    ${vaccinatedBadge}
                </div>
                <div class="d-flex align-items-center gap-2 mt-3">
                    <button class="btn adopter-pet-btn flex-grow-1" 
                            onclick="viewPetDetails('${pet._id}')">
                        View Details
                    </button>
                    <button class="btn adopter-pet-secondary-btn flex-grow-1 apply-to-adopt-btn" 
                            data-pet-id="${pet._id}"
                            data-pet-name="${safePetName}">
                        Apply to Adopt
                    </button>
                    <i class="${heartIconClass} fa-heart favorite-icon ${favoritedClass}" 
                       title="Add to Favorites" 
                       data-pet-id="${pet._id}"></i>
                </div>
            </div>
        </div>
    `;
    return col;
}

/**
 * Generates a Bootstrap badge based on pet status.
 * @param {string} status The status of the pet.
 * @returns {string} HTML string for the badge.
 */
function getStatusBadge(status) {
    const s = (status || '').toLowerCase();
    switch (s) {
        case 'available':
            return '<span class="badge bg-success">Available</span>';
        case 'pending':
            return '<span class="badge bg-warning text-dark">Pending</span>';
        case 'adopted':
            return '<span class="badge bg-info">Adopted</span>';
        case 'medical':
            return '<span class="badge bg-danger">Medical</span>';
        default:
            return `<span class="badge bg-secondary">${status}</span>`;
    }
}

/**
 * Fetches pets based on current filter values and renders them.
 */
async function applyFiltersAndLoadPets() {
    const name = document.getElementById('searchPetName').value.trim();
    const type = document.getElementById('filterPetType').value;
    const status = document.getElementById('filterPetStatus').value;
    const vaccinated = document.getElementById('vaccinatedCheck').checked ? 'true' : undefined;
    const grid = document.getElementById('petsGrid');

    if (!grid) return;
    grid.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';

    const params = {};
    if (name) params.name = name;
    if (type && type !== 'All Types') params.type = type;
    if (status && status !== 'All Status') params.status = status;
    if (vaccinated) params.vaccinated = vaccinated;

    try {
        const data = await getPets(params);
        const pets = data.pets || [];
        grid.innerHTML = ''; // Clear spinner

        if (pets.length === 0) {
            grid.innerHTML = '<div class="col-12 text-center"><p class="text-muted">No pets found matching your criteria.</p></div>';
        } else {
            pets.forEach(pet => grid.appendChild(createPetCard(pet)));
            // setupFavoriteIcons(); // This is causing duplicate listeners. We will use event delegation instead.
            setupApplyToAdoptButtons(); // Setup apply buttons
        }
    } catch (err) {
        console.error('Failed to load pets with filters:', err);
        grid.innerHTML = `<div class="col-12"><div class="alert alert-danger">Failed to load pets. ${err.message}</div></div>`;
    }
}

/**
 * Sets up event listeners for the "Apply to Adopt" buttons.
 */
function setupApplyToAdoptButtons() {
    document.querySelectorAll('.apply-to-adopt-btn').forEach(button => {
        // Remove existing listener to prevent duplicates
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        newButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const petId = newButton.dataset.petId;
            const petName = newButton.dataset.petName || 'Unknown Pet';
            
            console.log('Apply to Adopt clicked:', petId, petName);
            
            // Call the global function
            if (typeof window.applyToAdopt === 'function') {
                window.applyToAdopt(petId, petName);
            } else {
                console.error('applyToAdopt function not found');
                // Direct fallback
                openAdoptionModalDirect(petId, petName);
            }
        });
    });
}

/**
 * Direct function to open adoption modal (fallback)
 */
function openAdoptionModalDirect(petId, petName) {
    const modalElement = document.getElementById('adoptionModal');
    if (!modalElement) {
        console.error('Adoption modal not found!');
        alert(`You're applying to adopt ${petName}. Please make sure the adoption form is loaded.`);
        return;
    }
    
    // Set pet info in modal
    const petIdInput = document.getElementById('petId');
    const petNameDisplay = document.getElementById('petNameInModal');
    
    if (petIdInput) petIdInput.value = petId;
    if (petNameDisplay) petNameDisplay.textContent = petName;
    
    // Show the modal
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

/**
 * Sets up event listeners for the filter controls.
 */
function setupFilterListeners() {
    const applyBtn = document.getElementById('applyFiltersBtn');
    if (applyBtn) {
        applyBtn.addEventListener('click', applyFiltersAndLoadPets);
    }

    // Optional: Add listeners for live filtering as the user types or selects
    document.getElementById('searchPetName').addEventListener('input', (e) => {
        // Debounce to avoid too many API calls
        clearTimeout(e.target.debounce);
        e.target.debounce = setTimeout(applyFiltersAndLoadPets, 500);
    });
    document.getElementById('filterPetType').addEventListener('change', applyFiltersAndLoadPets);
    document.getElementById('filterPetStatus').addEventListener('change', applyFiltersAndLoadPets);
    document.getElementById('vaccinatedCheck').addEventListener('change', applyFiltersAndLoadPets);
}

/**
 * Helper function to escape quotes in strings for HTML attributes.
 */
function escapeQuotes(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// COMPLETE BARANGAY DATA FOR PAMPANGA CITIES
const BARANGAY_DATA = {
    "Angeles": [
        "Balibago", "Capaya", "Claro M. Recto", "Cutcut", "Cutud", 
        "Lourdes Sur", "Lourdes Sur East", "Malabanias", "Margot", 
        "Mining", "Ninoy Aquino", "Pampang", "Pandan", "Pulung Cacutud", 
        "Pulung Maragul", "Pulungbulu", "Salapungan", "San Jose", 
        "San Nicolas", "Santa Teresita", "Santa Trinidad", "Santo Cristo", 
        "Santo Domingo", "Santo Rosario", "Sapalibutad", "Sapangbato", 
        "Tabun", "Virgen Delos Remedios"
    ],
    "San Fernando": [
        "Alasas", "Baliti", "Bulaon", "Calulut", "Canao", 
        "Del Carmen", "Del Pilar", "Del Rosario", "Dolores", 
        "Juliana", "Lara", "Lourdes", "Maimpis", "Magliman", 
        "Malino", "Malpitic", "Pandaras", "Panipuan", "Pulung Bulo", 
        "Quebiauan", "Saguin", "San Agustin", "San Felipe", 
        "San Isidro", "San Jose", "San Juan", "San Nicolas", 
        "San Pedro", "Santa Lucia", "Santa Teresita", "Santo Niño", 
        "Santo Rosario", "Sindalan", "Telabastagan"
    ],
    "Mabalacat": [
        "Atlu-Bola", "Bical", "Bundagul", "Cacutud", "Calumpang", 
        "Camachiles", "Dapdap", "Dau", "Dolores", "Duquit", 
        "Lakandula", "Mabiga", "Macapagal Village", "Mamatitang", 
        "Mangalit", "Marcos Village", "Mawaque", "Paralayunan", 
        "Poblacion", "San Francisco", "San Joaquin", "Santa Ines", 
        "Santa Maria", "Santo Rosario", "Sapang Balen", "Sapang Biabas", 
        "Tabun"
    ],
    "Guagua": [
        "Bancal", "Plaza Burgos", "San Antonio", "San Isidro", 
        "San Jose", "San Juan", "San Matias", "San Miguel", 
        "San Nicolas 1st", "San Nicolas 2nd", "San Pablo", 
        "San Pedro", "San Rafael", "San Roque", "Santa Filomena", 
        "Santa Ines", "Santo Cristo", "Santo Niño"
    ],
    "Porac": [
        "Babo Pangulo", "Babo Sacan", "Balubad", "Calzadang Bayu", 
        "Camias", "Cangatba", "Diaz", "Dolores", "Jalung", 
        "Manibaug Libutad", "Manibaug Paralaya", "Manibaug Pasig", 
        "Manuali", "Mitla Proper", "Palat", "Pias", "Pio", 
        "Planas", "Poblacion", "Pulung Santol", "Salu", "San Jose", 
        "Santa Cruz", "Sepung Bulaun", "Sinait", "Talba", "Taltal"
    ],
    "Lubao": [
        "Balantacan", "Bamban", "Baruya", "Calangain", "Concepcion", 
        "Del Carmen", "San Agustin", "San Antonio", "San Francisco", 
        "San Jose", "San Juan", "San Pablo", "San Pedro", 
        "San Roque", "Santa Barbara", "Santa Catalina", "Santa Cruz", 
        "Santa Lucia", "Santa Maria", "Santa Monica", "Santa Rita", 
        "Santa Teresa", "Santo Cristo", "Santo Domingo", "Santo Niño"
    ],
    "Floridablanca": [
        "Anon", "Apalit", "Basa Air Base", "Benedicto", "Bodega", 
        "Cabangcalan", "Calantas", "Carmencita", "Consuelo", 
        "Dampe", "Del Carmen", "Fort Stotsenburg", "Gutad", 
        "Mabical", "Malabo", "Maliwalo", "Nabuclod", "Pabanlag", 
        "Paguiruan", "Palmayo", "Pandaguirig", "Poblacion", 
        "San Antonio", "San Isidro", "San Jose", "San Nicolas", 
        "San Pedro", "San Ramon", "San Roque", "Santa Monica", 
        "Solan", "Valdez"
    ],
    "Mexico": [
        "Acli", "Anao", "Balas", "Buenavista", "Camuning", 
        "Cawayan", "Concepcion", "Culubasa", "Divisoria", 
        "Dolores", "Eddie", "Gandus", "Lagundi", "Laput", 
        "Laug", "Masantol", "Nueva Victoria", "Pandacaqui", 
        "Pau", "San Antonio", "San Carlos", "San Jose", 
        "San Juan", "San Lorenzo", "San Miguel", "San Nicolas", 
        "San Pablo", "San Patricio", "San Rafael", "San Roque", 
        "San Vicente", "Santa Cruz", "Santa Maria", "Santo Domingo", 
        "Santo Rosario", "Sapang Maisac", "Suclaban", "Tangle"
    ],
    "Bacolor": [
        "Balas", "Cabambangan", "Cabalantian", "Cabetican", 
        "Calibutbut", "Concepcion", "Dolores", "Duat", "Macabacle", 
        "Magliman", "Maliwalu", "Mesalipit", "Parulog", "Poblacion", 
        "San Antonio", "San Isidro", "San Vicente", "Santa Barbara", 
        "Santa Ines", "Talba", "Tinajero"
    ],
    "Arayat": [
        "Arenas", "Baliti", "Batasan", "Buenos Aires", "Candating", 
        "Gatiawin", "Guemasan", "La Paz", "Lacmit", "Lao", 
        "Mangga-Cacutud", "Mapalad", "Palinlang", "Paralaya", 
        "Plazang Luma", "Poblacion", "San Agustin", "San Antonio", 
        "San Juan", "San Jose", "San Mateo", "San Nicolas", 
        "San Roque", "Santa Lucia", "Santo Niño", "Suklayin", 
        "Telapayong", "Tete"
    ],
    "Apalit": [
        "Balucuc", "Calantipe", "Cansinala", "Capalangan", 
        "Colgante", "Paligui", "Sampaloc", "San Juan", 
        "San Vicente", "Sucad", "Sulipan", "Tabuyuc"
    ],
    "Santa Rita": [
        "Becuran", "Dila Dila", "San Agustin", "San Basilio", 
        "San Isidro", "San Jose", "San Juan", "San Matias", 
        "San Vicente", "Santa Monica", "Santo Domingo"
    ],
    "Magalang": [
        "Ayala", "Bucanan", "Camias", "Dolores", "Escaler", 
        "La Paz", "Navaling", "San Agustin", "San Antonio", 
        "San Francisco", "San Ildefonso", "San Isidro", 
        "San Jose", "San Miguel", "San Nicolas", "San Pablo", 
        "San Pedro", "San Roque", "San Vicente", "Santa Cruz", 
        "Santa Lucia", "Santa Maria", "Santo Niño", "Santo Rosario", 
        "Turquoise"
    ],
    "Masantol": [
        "Alauli", "Bagang", "Balibago", "Bebe Anac", "Bebe Matua", 
        "Bulacus", "Cambasi", "Malauli", "Nigui", "Palimpe", 
        "Put I", "Put II", "Sagrada", "San Isidro Anac", 
        "San Isidro Matua", "San Nicolas", "Santa Cruz", 
        "Santa Lucia", "Santa Monica", "Santo Niño", "Sapang Kawayan"
    ],
    "San Luis": [
        "San Agustin", "San Carlos", "San Isidro", "San Jose", 
        "San Juan", "San Lorenzo", "San Nicolas", "San Roque", 
        "San Sebastian", "Santa Catalina", "Santa Cruz Pambilog", 
        "Santa Cruz Poblacion", "Santa Lucia", "Santa Monica", 
        "Santa Rita", "Santo Niño", "Santo Rosario", "Santo Tomas"
    ],
    "Santo Tomas": [
        "Moras de la Paz", "Poblacion", "San Bartolome", 
        "San Matias", "San Vicente", "Santa Ana", "Santa Cruz", 
        "Santa Maria", "Santo Niño", "Santo Rosario"
    ],
    "Minalin": [
        "Bulo", "Dawe", "Lourdes", "Manica", "San Francisco", 
        "San Isidro", "San Nicolas", "Santa Maria", "Santo Domingo", 
        "Saplad", "Tawiran"
    ],
    "Macabebe": [
        "Batasan", "Caduang Tete", "Candelaria", "Castuli", 
        "Consuelo", "Dalayap", "Mataguiti", "San Esteban", 
        "San Francisco", "San Gabriel", "San Isidro", "San Jose", 
        "San Juan", "San Rafael", "San Roque", "San Vicente", 
        "Santa Cruz", "Santa Lutgarda", "Santa Maria", 
        "Santa Rita", "Santo Niño", "Santo Rosario", "Saplad", 
        "Telacsan"
    ],
    "Sasmuan": [
        "Batang 1st", "Batang 2nd", "Mabuanbuan", "Malusac", 
        "San Antonio", "San Nicolas", "San Pedro", "Santa Lucia", 
        "Santa Monica", "Santo Tomas"
    ],
    "Candaba": [
        "Bahay Pare", "Bambang", "Barangca", "Barit", "Buclod", 
        "Dulong Ilog", "Gulap", "Lanang", "Lourdes", "Magsaysay", 
        "Mangga", "Pansinao", "Pangclara", "Pulo", "Pulong Gubat", 
        "Pulong Palazan", "Salapungan", "San Agustin", "Santo Rosario", 
        "Tagulod", "Talang", "Tenejero", "Vizal San Pablo", 
        "Vizal Santo Cristo", "Vizal Santo Niño"
    ]
};

// Make viewPetDetails globally accessible for the inline onclick
window.viewPetDetails = (petId) => {
    // Redirect to the new adopter-specific pet view page.
    window.location.href = `/frontend/pages/adopters/adopter-view-pet.html?id=${petId}`;
};

// Make applyToAdopt globally accessible - UPDATED VERSION
window.applyToAdopt = (petId, petName) => {
    console.log('Global applyToAdopt called:', petId, petName);
    
    // Check if modal exists
    const modalElement = document.getElementById('adoptionModal');
    if (!modalElement) {
        console.error('Adoption modal not found in HTML!');
        // Try to load it dynamically
        loadAdoptionModalAndOpen(petId, petName);
        return;
    }
    
    // Check if modal has been initialized with content
    const modalBody = modalElement.querySelector('.modal-body');
    if (modalBody && modalBody.innerHTML.includes('Loading adoption form')) {
        // Modal exists but not fully loaded, initialize it
        initializeAdoptionModal(petId, petName);
    } else {
        // Modal is ready, open it directly
        openAdoptionModalDirect(petId, petName);
    }
};

/**
 * Initialize the adoption modal with form content.
 */
function initializeAdoptionModal(petId, petName) {
    const modalElement = document.getElementById('adoptionModal');
    if (!modalElement) return;
    
    // Get cities for dropdown
    const cities = Object.keys(BARANGAY_DATA);
    const cityOptions = cities.map(city => 
        `<option value="${city}">${city}</option>`
    ).join('');
    
    // Update modal content
    modalElement.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header" style="background-color: #F39C12; color: white;">
                    <h5 class="modal-title fw-bold">Adoption Application Form</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form id="adoptionForm">
                    <div class="modal-body">
                        <input type="hidden" id="petId" value="${petId}">
                        <input type="hidden" id="petNameHidden" value="${escapeQuotes(petName)}">
                        
                        <div class="alert alert-info mb-4">
                            <h6 class="fw-bold">Applying for: <span id="petNameInModal" class="text-primary">${petName}</span></h6>
                            <p class="mb-0">Please fill out this form completely. All fields are required.</p>
                        </div>
                        
                        <h6 class="fw-bold mb-3 border-bottom pb-2">Personal Information</h6>
                        <div class="row g-3 mb-4">
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">First Name *</label>
                                <input type="text" class="form-control" id="firstName" required placeholder="Enter your first name">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Last Name *</label>
                                <input type="text" class="form-control" id="lastName" required placeholder="Enter your last name">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Phone Number *</label>
                                <input type="tel" class="form-control" id="phoneNumber" required 
                                       pattern="[0-9]{11}" placeholder="09171234567">
                                <div class="form-text">11-digit Philippine mobile number</div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Email Address *</label>
                                <input type="email" class="form-control" id="email" required 
                                       placeholder="your.email@example.com">
                            </div>
                        </div>
                        
                        <h6 class="fw-bold mb-3 border-bottom pb-2">Address Information</h6>
                        <div class="row g-3 mb-4">
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">City/Municipality *</label>
                                <select class="form-select" id="city" required>
                                    <option value="" selected disabled>Select City/Municipality</option>
                                    ${cityOptions}
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Barangay *</label>
                                <select class="form-select" id="barangay" required disabled>
                                    <option value="" selected disabled>Select City first</option>
                                </select>
                            </div>
                            <div class="col-12">
                                <label class="form-label fw-semibold">Street/Barangay Number *</label>
                                <input type="text" class="form-control" id="streetAddress" required 
                                       placeholder="e.g., #123 Main Street, Purok 5, Subdivision Name">
                                <div class="form-text">Please provide your complete street address or specific location details</div>
                            </div>
                        </div>
                        
                        <h6 class="fw-bold mb-3 border-bottom pb-2">Additional Information</h6>
                        <div class="mb-4">
                            <label class="form-label fw-semibold">Why do you want to adopt this pet? *</label>
                            <textarea class="form-control" id="adoptionReason" rows="3" required 
                                      placeholder="Tell us about your experience with pets and why you'd be a good owner..."></textarea>
                            <div class="form-text">Please provide at least 20 characters</div>
                        </div>
                        
                        <h6 class="fw-bold mb-3 border-bottom pb-2">Interview Preference</h6>
                        <div class="row g-3 mb-4">
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Preferred Interview Date</label>
                                <input type="date" class="form-control" id="interviewDate">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Preferred Interview Time</label>
                                <input type="time" class="form-control" id="interviewTime">
                            </div>
                        </div>
                        <div class="mb-4">
                            <label class="form-label fw-semibold">Additional Details (Optional)</label>
                            <textarea class="form-control" id="additionalDetails" rows="2" placeholder="Anything else we should know?"></textarea>
                        </div>

                        <div class="form-check mb-3">
                            <input class="form-check-input" type="checkbox" id="termsAgreement" required>
                            <label class="form-check-label">
                                I agree to the <a href="#" class="text-primary">Terms and Conditions</a> of adoption *
                            </label>
                        </div>
                        
                        <div id="formMessage" class="alert d-none"></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn" style="background-color: #F39C12; color: white;">Submit Application</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Initialize form functionality
    setupAdoptionForm();
    
    // Show modal
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

/**
 * Setup the adoption form with event listeners.
 */
function setupAdoptionForm() {
    // City-Barangay functionality
    const citySelect = document.getElementById('city');
    const barangaySelect = document.getElementById('barangay');
    
    if (citySelect) {
        citySelect.addEventListener('change', function() {
            const city = this.value;
            
            barangaySelect.innerHTML = '<option value="" selected disabled>Select Barangay</option>';
            
            if (city && BARANGAY_DATA[city]) {
                barangaySelect.disabled = false;
                
                // Sort barangays alphabetically
                const sortedBarangays = [...BARANGAY_DATA[city]].sort();
                
                sortedBarangays.forEach(barangay => {
                    const option = document.createElement('option');
                    option.value = barangay;
                    option.textContent = barangay;
                    barangaySelect.appendChild(option);
                });
            } else {
                barangaySelect.disabled = true;
                barangaySelect.innerHTML = '<option value="" selected disabled>Select City first</option>';
            }
        });
    }
    
    // Form submission
    const form = document.getElementById('adoptionForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                showFormMessage('You must be logged in to apply.', 'danger');
                return;
            }
            
            // Get form data
            const formData = {
                pet: document.getElementById('petId').value, // Changed to 'pet' to match schema
                adopter: currentUser._id, // FIX: Changed from adopterId to adopter to match backend
                phoneNumber: document.getElementById('phoneNumber').value,
                email: document.getElementById('email').value,
                city: document.getElementById('city').value,
                barangay: document.getElementById('barangay').value,
                streetAddress: document.getElementById('streetAddress').value,
                adoptionReason: document.getElementById('adoptionReason').value,
                termsAgreement: document.getElementById('termsAgreement').checked,
                interviewDate: document.getElementById('interviewDate').value,
                interviewTime: document.getElementById('interviewTime').value,
                additionalDetails: document.getElementById('additionalDetails').value,
            };
            
            // Validation
            if (!/^[0-9]{11}$/.test(formData.phoneNumber)) {
                showFormMessage('Please enter a valid 11-digit phone number', 'danger');
                return;
            }
            
            if (formData.adoptionReason.length < 20) {
                showFormMessage('Please provide at least 20 characters for adoption reason', 'danger');
                return;
            }
            
            showFormMessage('Submitting your application...', 'info');
            
            try {
                const response = await fetch('http://localhost:3000/api/applications/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Submission failed');
                
                showFormMessage('Application submitted successfully!', 'success');
                setTimeout(() => {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('adoptionModal'));
                    if (modal) modal.hide();
                }, 3000);
            } catch (error) {
                showFormMessage(`Error: ${error.message}`, 'danger');
            }
        });
    }
}

/**
 * Load adoption modal HTML dynamically if not present.
 */
function loadAdoptionModalAndOpen(petId, petName) {
    console.log('Loading adoption modal dynamically...');
    
    // Create modal HTML
    const modalHTML = `
        <div class="modal fade" id="adoptionModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header" style="background-color: #F39C12; color: white;">
                        <h5 class="modal-title fw-bold">Adoption Application</h5>
                        <button id="btn-submit-form" type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center p-5">
                        <div class="spinner-border text-primary mb-3" role="status">
                            <span class="visually-hidden">Loading adoption form...</span>
                        </div>
                        <p>Loading adoption application form for ${petName}...</p>
                        <p class="text-muted small">If this doesn't load, please refresh the page.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    setTimeout(() => {
        initializeAdoptionModal(petId, petName);
    }, 100);
}

/**
 * Sets up a single, delegated event listener for actions on pet cards.
 */
function setupActionListeners() {
    const grid = document.getElementById('petsGrid');
    if (!grid) return;

    // This single listener handles clicks for all favorite icons inside the grid.
    grid.addEventListener('click', (e) => {
        const target = e.target;

        // Handle favorite icon clicks
        if (target.matches('.favorite-icon')) {
            const petId = target.dataset.petId;
            if (!petId) return;

            target.classList.toggle('favorited');
            target.classList.toggle('fa-regular');
            target.classList.toggle('fa-solid');

            // --- FIX: Use user-specific key for saving ---
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const favoritesKey = currentUser ? `favorites_${currentUser._id}` : 'favorites_guest';
            let favorites = JSON.parse(localStorage.getItem(favoritesKey)) || [];
            if (!Array.isArray(favorites)) favorites = [];

            if (target.classList.contains('favorited')) {
                favorites.push(petId);
            } else {
                favorites = favorites.filter(id => id !== petId);
            }
            // Use a Set to guarantee uniqueness before saving
            localStorage.setItem(favoritesKey, JSON.stringify([...new Set(favorites)]));
        }
    });
}

/**
 * Debug function to check availability of components.
 */
function debugCheck() {
    console.log('=== DEBUG CHECK ===');
    console.log('Modal element:', document.getElementById('adoptionModal'));
    console.log('Bootstrap Modal class:', typeof bootstrap?.Modal);
    console.log('applyToAdopt function:', typeof window.applyToAdopt);
    console.log('BARANGAY_DATA loaded:', Object.keys(BARANGAY_DATA).length, 'cities');
    console.log('San Fernando barangays:', BARANGAY_DATA['San Fernando']?.length || 0);
    console.log('=== END DEBUG ===');
}

/**
 * Example function to send data to backend (for future implementation)
 */
async function sendToBackend(formData) {
    try {
        const response = await fetch('/api/adoption/applications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to submit application');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error sending application:', error);
        throw error;
    }
}

// Initial load when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Adopter Pets page loaded');
    
    // Load pets
    applyFiltersAndLoadPets();
    
    // Setup filters
    setupFilterListeners();
    
    // Setup delegated action listeners for cards
    setupActionListeners();

    // Debug check
    debugCheck();
    
    // Check for modal in HTML
    if (!document.getElementById('adoptionModal')) {
        console.warn('Adoption modal not found in HTML. It will be loaded dynamically when needed.');
    }
});