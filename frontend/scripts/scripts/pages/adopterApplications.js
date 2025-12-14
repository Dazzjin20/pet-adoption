let allApplications = []; // Cache for client-side filtering

document.addEventListener('DOMContentLoaded', () => {
    setupModalTrigger();
    loadApplications();
    setupFilterButtons();
});

async function loadApplications() {
    const container = document.getElementById('applicationsList');
    if (!container) return;

    container.innerHTML = `
        <div class="col-12 text-center" id="loading-spinner">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading your applications...</p>
        </div>`;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser || currentUser.role !== 'adopter') {
        container.innerHTML = '<div class="alert alert-danger">You must be logged in as an adopter to view this page.</div>';
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/applications/adopter/${currentUser._id}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch applications.');
        }

        const data = await response.json();
        allApplications = data.applications || [];

        updateStatCards();
        renderApplications(allApplications); // Initially render all applications

    } catch (error) {
        console.error('Error loading applications:', error);
        container.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
}

function renderApplications(applicationsToRender) {
    const container = document.getElementById('applicationsList');
    container.innerHTML = ''; // Clear previous content

    if (applicationsToRender.length === 0) {
        container.innerHTML = `
            <div class="text-center mt-4 p-5 bg-white rounded-4 border">
                <i class="fa-regular fa-file-lines fs-1 text-muted mb-3"></i>
                <h4 class="fw-bold">No Applications Found</h4>
                <p class="text-muted">You haven't submitted any adoption applications yet.</p>
                <a href="adopter-pet.html" class="btn btn-primary mt-2">Browse Pets to Adopt</a>
            </div>`;
        return;
    }

    applicationsToRender.forEach(app => {
        const card = createApplicationCard(app);
        container.appendChild(card);
    });
}

function createApplicationCard(app) {
    const article = document.createElement('article');
    article.className = 'bg-white border rounded-4 p-4 shadow-sm application-card animate-fadeInUp';

    const statusColors = {
        'Pending': 'warning',
        'Approved': 'success',
        'Interview Scheduled': 'info',
        'Rejected': 'danger',
        'Adopted': 'purple' // Using a custom color from your example
    };
    const statusColor = statusColors[app.status] || 'secondary';
    const statusBadgeClass = statusColor === 'purple' ? 'bg-purple text-white' : `bg-${statusColor}`;

    const submittedDate = new Date(app.date_submitted).toLocaleDateString('en-US');
    const lastUpdateDate = new Date(app.last_update).toLocaleDateString('en-US');
    const interviewInfo = app.interview_date 
        ? `${new Date(app.interview_date).toLocaleDateString()} at ${app.interview_time}` 
        : 'Not yet scheduled';

    const petImage = app.pet?.before_image || '/frontend/assets/image/photo/placeholder.jpg';

    article.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
            <div class="d-flex align-items-center gap-3">
                <img src="${petImage}" class="rounded-circle" width="75" height="75" alt="${app.pet_name}" style="object-fit: cover;"/>
                <div>
                    <h4 class="fw-bold mb-1">${app.pet_name}</h4>
                    <p class="text-muted small mb-1">Gender: ${app.pet_gender}</p>
                    <p class="text-muted small mb-1">Application #: ${app.application_id}</p>
                    <p class="text-muted small">Submitted: ${submittedDate}</p>
                </div>
            </div>
            <span class="badge ${statusBadgeClass} px-3 py-2">${app.status}</span>
        </div>
        <div class="row mt-3">
            <div class="col-md-4">
                <p class="small text-muted mb-1">Last Update:</p>
                <p>${lastUpdateDate}</p>
            </div>
            <div class="col-md-4">
                <p class="small text-muted mb-1"><i class="fa-regular fa-calendar"></i> Interview:</p>
                <p>${interviewInfo}</p>
            </div>
            <div class="col-md-4">
                <p class="small text-muted mb-1">Contact Person:</p>
                <p class="mb-0 fw-semibold">${app.adopter_first_name} ${app.adopter_last_name}</p>
                <p class="mb-0 small text-muted">Applicant</p>
                <p class="mb-0 small">📞 ${app.adopter_contact_no}</p>
                ${app.pet?.posted_by_staff ? `
                    <p class="mb-0 fw-semibold">${app.pet.posted_by_staff.first_name} ${app.pet.posted_by_staff.last_name}</p>
                    <p class="mb-0 small text-muted">Shelter Staff</p>
                    <p class="mb-0 small">📞 ${app.pet.posted_by_staff.phone}</p>
                ` : `
                    <p class="mb-0 fw-semibold">Shelter Staff</p>
                    <p class="mb-0 small text-muted">General Inquiry</p>
                    <p class="mb-0 small">Please use the messages tab.</p>
                `}
            </div>
        </div>
        ${app.next_step ? `
        <div class="mt-3 p-3 rounded" style="background-color: #dcd3ff;">
            <strong>Next Step:</strong>
            <p class="mb-0">${app.next_step}</p>
        </div>` : ''}
        ${app.staff_notes ? `
        <div class="mt-2 p-3 rounded" style="background-color: #d8ffd8;">
            <strong>Notes from Staff:</strong>
            <p class="mb-0">${app.staff_notes}</p>
        </div>` : ''}
        <div class="mt-3 d-flex gap-2">
            <button class="btn btn-outline-dark view-details-btn" 
                    data-bs-toggle="modal" 
                    data-bs-target="#applicationDetailsModal" 
                    data-app-id="${app.application_id}">
                View Details
            </button>
        </div>
    `;
    return article;
}

function updateStatCards() {
    document.getElementById('totalApplications').textContent = allApplications.length;
    document.getElementById('inProgressCount').textContent = allApplications.filter(app => ['Pending', 'Interview Scheduled'].includes(app.status)).length;
    document.getElementById('approvedCount').textContent = allApplications.filter(app => app.status === 'Approved').length;
    document.getElementById('interviewCount').textContent = allApplications.filter(app => app.status === 'Interview Scheduled').length;
}

function setupFilterButtons() {
    const filterButtons = {
        'filterAll': () => renderApplications(allApplications),
        'filterActive': () => renderApplications(allApplications.filter(app => ['Pending', 'Interview Scheduled'].includes(app.status))),
        'filterCompleted': () => renderApplications(allApplications.filter(app => ['Approved', 'Rejected', 'Adopted'].includes(app.status)))
    };

    const buttonsContainer = document.querySelector('.d-flex.gap-2');

    Object.keys(filterButtons).forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', (e) => {
                // Update active button style
                buttonsContainer.querySelectorAll('button').forEach(btn => {
                    btn.classList.remove('btn-dark');
                    btn.classList.add('btn-outline-dark');
                });
                e.currentTarget.classList.add('btn-dark');
                e.currentTarget.classList.remove('btn-outline-dark');

                // Call the filter function
                filterButtons[buttonId]();
            });
        }
    });
}

/**
 * Sets up a listener on the modal to populate it with data when shown.
 */
function setupModalTrigger() {
    const detailsModal = document.getElementById('applicationDetailsModal');
    if (!detailsModal) return;

    detailsModal.addEventListener('show.bs.modal', function (event) {
        // Button that triggered the modal
        const button = event.relatedTarget;
        // Extract info from data-* attributes
        const applicationId = button.getAttribute('data-app-id');

        // Find the application data from our cached array
        const app = allApplications.find(a => a.application_id === applicationId);

        if (app) {
            populateDetailsModal(app);
        } else {
            console.error('Could not find application data for ID:', applicationId);
        }
    });
}

/**
 * Fills the details modal with data from the selected application.
 * @param {object} app The application object.
 */
function populateDetailsModal(app) {
    document.getElementById('detail-app-number').textContent = app.application_id || 'N/A';
    document.getElementById('detail-pet-name').textContent = app.pet_name || 'N/A';
    document.getElementById('detail-submitted').textContent = new Date(app.date_submitted).toLocaleDateString();
    document.getElementById('detail-next-step').textContent = app.next_step || 'No next step provided.';
    
    const notesDiv = document.getElementById('detail-notes');
    if (app.staff_notes) {
        notesDiv.textContent = app.staff_notes;
        notesDiv.classList.remove('text-muted');
    } else {
        notesDiv.textContent = 'No notes from staff yet.';
        notesDiv.classList.add('text-muted');
    }

    // Handle status badge
    const statusSpan = document.getElementById('detail-status');
    const statusColors = {
        'Pending': 'bg-warning text-dark',
        'Approved': 'bg-success',
        'Interview Scheduled': 'bg-info',
        'Rejected': 'bg-danger',
        'Adopted': 'bg-primary'
    };
    statusSpan.textContent = app.status;
    statusSpan.className = `badge px-3 py-2 ${statusColors[app.status] || 'bg-secondary'}`;
}