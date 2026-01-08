import { getAllApplications, getApplication, approveApplication, rejectApplication, scheduleInterview } from '../utils/applicationsApi.js';

let allApplications = [];
let currentFilter = 'Pending';

async function loadApplications() {
  try {
    const data = await getAllApplications();
    allApplications = data.applications || [];
    renderApplicationsTable(filterApplications(currentFilter));
  } catch (err) {
    console.error('Failed to load applications:', err);
    alert('Error loading applications: ' + err.message);
  }
}

function filterApplications(status) {
  if (status === 'All') return allApplications;
  return allApplications.filter(app => app.status === status);
}

function renderApplicationsTable(applications) {
  const tbody = document.getElementById('applications-table-body');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (applications.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No applications found</td></tr>';
    return;
  }

  applications.forEach(app => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${app.application_id}</strong></td>
      <td>${app.pet_name || 'N/A'}</td>
      <td>${app.adopter_first_name} ${app.adopter_last_name}</td>
      <td>${new Date(app.date_submitted).toLocaleDateString()}</td>
      <td><span class="badge ${getStatusBadgeClass(app.status)}">${app.status}</span></td>
      <td>
        <button class="btn btn-sm btn-info view-btn" data-app-id="${app._id}">View</button>
        ${(app.status === 'Pending' || app.status === 'Interview Scheduled') ? `
          <button class="btn btn-sm btn-success approve-btn" data-app-id="${app._id}">Approve</button>
          <button class="btn btn-sm btn-danger reject-btn" data-app-id="${app._id}">Reject</button>
        ` : ''}
        ${app.status === 'Pending' ? `
          <button class="btn btn-sm btn-warning interview-btn" data-app-id="${app._id}">Interview</button>
        ` : ''}
      </td>
    `;
    tbody.appendChild(row);
  });

  // Attach event listeners
  attachEventListeners();
}

function getStatusBadgeClass(status) {
  const classes = {
    'Pending': 'bg-warning',
    'Approved': 'bg-success',
    'Rejected': 'bg-danger',
    'Interview Scheduled': 'bg-info',
    'Adopted': 'bg-secondary'
  };
  return classes[status] || 'bg-secondary';
}

function attachEventListeners() {
  // View application
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const appId = e.target.dataset.appId;
      try {
        const data = await getApplication(appId);
        showApplicationModal(data.application);
      } catch (err) {
        alert('Error: ' + err.message);
      }
    });
  });

  // Approve application
  document.querySelectorAll('.approve-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const appId = e.target.dataset.appId;
      if (confirm('Are you sure you want to approve this application?')) {
        try {
          const notes = prompt('Add staff notes (optional):');
          await approveApplication(appId, notes || '');
          alert('Application approved!');
          await loadApplications();
        } catch (err) {
          alert('Error: ' + err.message);
        }
      }
    });
  });

  // Reject application
  document.querySelectorAll('.reject-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const appId = e.target.dataset.appId;
      if (confirm('Are you sure you want to reject this application?')) {
        try {
          const notes = prompt('Rejection reason (optional):');
          await rejectApplication(appId, notes || '');
          alert('Application rejected!');
          await loadApplications();
        } catch (err) {
          alert('Error: ' + err.message);
        }
      }
    });
  });

  // Schedule interview
  document.querySelectorAll('.interview-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const appId = e.target.dataset.appId;
      const date = prompt('Interview date (YYYY-MM-DD):');
      if (date) {
        const time = prompt('Interview time (HH:MM):');
        if (time) {
          try {
            const notes = prompt('Add interview notes (optional):');
            await scheduleInterview(appId, date, time, notes || '');
            alert('Interview scheduled!');
            await loadApplications();
          } catch (err) {
            alert('Error: ' + err.message);
          }
        }
      }
    });
  });
}

function showApplicationModal(application) {
  const message = `
Application ID: ${application.application_id}

PET INFORMATION:
Name: ${application.pet_name}
Gender: ${application.pet_gender}

ADOPTER INFORMATION:
Name: ${application.adopter_first_name} ${application.adopter_last_name}
Contact: ${application.adopter_contact_no || 'N/A'}

APPLICATION DETAILS:
Message: ${application.message || 'N/A'}
Status: ${application.status}
Date Submitted: ${new Date(application.date_submitted).toLocaleDateString()}
Preferred Interview Date: ${application.preferred_interview_date ? new Date(application.preferred_interview_date).toLocaleDateString() : 'N/A'}
Preferred Interview Time: ${application.preferred_interview_time || 'N/A'}
Additional Details: ${application.additional_details || 'N/A'}

${application.staff_notes ? `STAFF NOTES: ${application.staff_notes}` : ''}
${application.interview_date ? `SCHEDULED INTERVIEW: ${new Date(application.interview_date).toLocaleDateString()} at ${application.interview_time}` : ''}
  `;

  alert(message);
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadApplications();

  // Filter buttons
  document.querySelectorAll('[data-status-filter]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Remove active class from all buttons
      document.querySelectorAll('[data-status-filter]').forEach(b => b.classList.remove('active'));
      // Add active class to clicked button
      e.target.classList.add('active');

      currentFilter = e.target.dataset.statusFilter;
      renderApplicationsTable(filterApplications(currentFilter));
    });
  });

  // Refresh periodically
  setInterval(loadApplications, 30000); // Refresh every 30 seconds
});