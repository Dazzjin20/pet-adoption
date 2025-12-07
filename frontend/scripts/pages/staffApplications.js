document.addEventListener('DOMContentLoaded', () => {
    loadAllApplications();
    setupFilterButtons();
});

let allApplications = []; // Cache all applications to filter on the client-side

async function loadAllApplications() {
    const tableBody = document.getElementById('applications-table-body');
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Loading applications...</td></tr>';

    try {
        const response = await fetch('http://localhost:3000/api/applications/');
        if (!response.ok) throw new Error('Failed to fetch applications.');

        const data = await response.json();
        allApplications = data.applications || [];

        // Initially, show 'Pending' applications
        filterAndRenderApplications('Pending');

    } catch (error) {
        console.error('Error loading applications:', error);
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">${error.message}</td></tr>`;
    }
}

function filterAndRenderApplications(statusFilter) {
    const tableBody = document.getElementById('applications-table-body');
    tableBody.innerHTML = '';

    const filteredApps = allApplications.filter(app => app.status === statusFilter);

    if (filteredApps.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-4">No applications with status "${statusFilter}".</td></tr>`;
        return;
    }

    filteredApps.forEach(app => {
        const row = document.createElement('tr');
        const submittedDate = new Date(app.date_submitted).toLocaleDateString();
        
        const statusColors = {
            'Pending': 'warning',
            'Approved': 'success',
            'Interview Scheduled': 'info',
            'Rejected': 'danger',
            'Adopted': 'primary'
        };
        const statusColor = statusColors[app.status] || 'secondary';

        row.innerHTML = `
            <td>${app.application_id}</td>
            <td>${app.pet_name}</td>
            <td>${app.adopter_first_name} ${app.adopter_last_name}</td>
            <td>${submittedDate}</td>
            <td><span class="badge bg-${statusColor} text-dark">${app.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary view-details-btn" 
                        data-app-id="${app.application_id}" 
                        title="View Details">
                    <i class="fa-solid fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-success update-status-btn" 
                        data-app-id="${app.application_id}" data-new-status="Approved" 
                        title="Approve">
                    <i class="fa-solid fa-check"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger update-status-btn" 
                        data-app-id="${app.application_id}" data-new-status="Rejected" 
                        title="Reject">
                    <i class="fa-solid fa-times"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Placeholder for future functionality
function addActionListeners() {}

function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('[data-status-filter]');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state for buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const status = button.dataset.statusFilter;
            filterAndRenderApplications(status);
        });
    });
}