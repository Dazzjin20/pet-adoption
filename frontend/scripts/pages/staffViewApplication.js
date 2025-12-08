document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const applicationId = urlParams.get('application_id');

    if (!applicationId) {
        showError('No application ID provided.');
        return;
    }

    loadApplicationDetails(applicationId);
});

async function loadApplicationDetails(applicationId) {
    showLoading();

    try {
        const response = await fetch(`http://localhost:3000/api/applications/${applicationId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch application details. Status: ${response.status}`);
        }

        const data = await response.json();
        const app = data.application;

        if (!app) {
            throw new Error('Application data not found in the response.');
        }

        populateApplicationDetails(app);
        setupActionButtons(applicationId);
        showContent();

    } catch (error) {
        console.error('Error loading application details:', error);
        showError(error.message);
    }
}

function populateApplicationDetails(app) {
    // Applicant Info
    document.getElementById('applicantName').textContent = `${app.adopter_first_name} ${app.adopter_last_name}`;
    document.getElementById('applicantContact').textContent = app.adopter_contact_no || 'N/A';
    document.getElementById('applicantLivingSituation').textContent = app.adopter?.living_situation?.replace('_', ' ') || 'N/A';
    document.getElementById('applicantExperience').textContent = app.adopter?.pet_experience?.join(', ') || 'N/A';

    // Pet Info
    document.getElementById('petName').textContent = app.pet_name;
    document.getElementById('petGender').textContent = app.pet_gender || 'N/A';
    document.getElementById('adopterMessage').textContent = app.message || 'No message provided.';

    // Application Status
    document.getElementById('applicationId').textContent = `#${app.application_id}`;
    document.getElementById('dateSubmitted').textContent = new Date(app.date_submitted).toLocaleDateString();
    
    const statusBadge = document.getElementById('applicationStatus');
    statusBadge.textContent = app.status;
    const statusColors = {
        'Pending': 'bg-warning text-dark',
        'Approved': 'bg-success',
        'Interview Scheduled': 'bg-info text-dark',
        'Rejected': 'bg-danger',
        'Adopted': 'bg-primary'
    };
    statusBadge.className = `badge ${statusColors[app.status] || 'bg-secondary'}`;
}

function setupActionButtons(applicationId) {
    document.querySelectorAll('.update-status-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const newStatus = button.dataset.newStatus;
            if (confirm(`Are you sure you want to set this application to "${newStatus}"?`)) {
                await updateStatus(applicationId, newStatus);
            }
        });
    });
}

async function updateStatus(applicationId, newStatus) {
    try {
        const response = await fetch(`http://localhost:3000/api/applications/${applicationId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) throw new Error('Failed to update status.');

        // Reload details to show the change
        await loadApplicationDetails(applicationId);

    } catch (error) {
        console.error('Error updating status:', error);
        alert(`Failed to update status: ${error.message}`);
    }
}


// UI State Management
function showLoading() {
    document.getElementById('loading-state').style.display = 'block';
    document.getElementById('error-state').style.display = 'none';
    document.getElementById('content-state').style.display = 'none';
}

function showError(message) {
    const errorDiv = document.getElementById('error-state');
    errorDiv.textContent = `Error: ${message}`;
    errorDiv.style.display = 'block';
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('content-state').style.display = 'none';
}

function showContent() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('error-state').style.display = 'none';
    document.getElementById('content-state').style.display = 'block';
}