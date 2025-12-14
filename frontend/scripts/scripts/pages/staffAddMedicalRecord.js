import { createActivityLog, getActivityLogsForPet } from '../utils/activityLogsApi.js';

// This module wires the Add Record button and modal on staff-view-medical.html
document.addEventListener('DOMContentLoaded', async () => {
  const addBtn = document.getElementById('addRecordBtn');
  const modalEl = document.getElementById('addMedicalRecordModal');
  const submitBtn = document.getElementById('submitAddRecordBtn');
  const form = document.getElementById('addMedicalRecordForm');
  const medicalList = document.getElementById('medicalHistoryList');
  const vaccinationList = document.getElementById('vaccinationList');

  const bsModal = modalEl ? bootstrap.Modal.getOrCreateInstance(modalEl) : null;

  // Attempt to read current pet id from page (if staffViewPet.js sets it)
  const petId = window.currentPetId || document.body.dataset.petId || null;

  async function refreshMedicalData() {
    if (!petId) return;
    try {
      const logs = await getActivityLogsForPet(petId);
      if (!logs || logs.length === 0) {
        medicalList.innerHTML = '<p class="text-muted">No records yet.</p>';
        vaccinationList.innerHTML = '<p class="text-muted">No vaccination records yet.</p>';
        return;
      }

      // Separate vaccination from other medical records
      const vaccinations = logs.filter(l => l.type === 'Vaccination' || l.title === 'Vaccination');
      const medicalRecords = logs.filter(l => l.type !== 'Vaccination' && l.title !== 'Vaccination');

      // Display vaccination cards
      if (vaccinations.length === 0) {
        vaccinationList.innerHTML = '<p class="text-muted">No vaccination records yet.</p>';
      } else {
        vaccinationList.innerHTML = vaccinations.map(v => {
          const dueDate = new Date(v.dueDate);
          const today = new Date();
          const isOverdue = dueDate < today;
          const statusBadge = isOverdue ? '<span class="badge bg-danger">Overdue</span>' : '<span class="badge bg-warning">Due</span>';
          
          return `
            <div class="card mb-3 border-0 shadow-sm">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 class="card-title fw-bold mb-1">${v.title || 'Vaccination'}</h6>
                    <p class="card-text small text-muted mb-0">Due: ${dueDate.toLocaleDateString()}</p>
                    <p class="card-text small text-muted mb-0">Veterinarian: ${v.location || 'Not specified'}</p>
                  </div>
                  <div>${statusBadge}</div>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }

      // Display medical history
      if (medicalRecords.length === 0) {
        medicalList.innerHTML = '<p class="text-muted">No records yet.</p>';
      } else {
        medicalList.innerHTML = medicalRecords.map(l => {
          const recordDate = new Date(l.dueDate);
          const typeBadge = l.type ? `<span class="badge bg-secondary">${l.type}</span>` : '';
          return `
            <div class="mb-3 border rounded-3 p-3" style="border-left: 4px solid #007bff !important;">
              <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                  <strong>${l.title}</strong>
                  <div class="small text-muted mt-1">
                    ${recordDate.toLocaleDateString()} • ${l.location || 'Not specified'}
                  </div>
                  ${l.description ? `<div class="mt-2 text-muted">${l.description}</div>` : ''}
                </div>
                ${typeBadge ? `<div>${typeBadge}</div>` : ''}
              </div>
            </div>
          `;
        }).join('');
      }
    } catch (err) {
      console.error('Failed to load medical logs:', err);
    }
  }

  if (addBtn && bsModal) {
    addBtn.addEventListener('click', () => bsModal.show());
  }

  if (submitBtn && form) {
    submitBtn.addEventListener('click', async () => {
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const payload = {
        recordType: document.getElementById('recordType').value,
        date: document.getElementById('recordDate').value,
        description: document.getElementById('recordDescription').value,
        veterinarian: document.getElementById('recordVeterinarian').value,
        notes: document.getElementById('recordNotes').value,
        pet_id: petId
      };

      try {
        await createActivityLog(payload);
        if (bsModal) bsModal.hide();
        form.reset();
        await refreshMedicalData();
        alert('Medical record added');
      } catch (err) {
        console.error('Failed to create medical record:', err);
        alert('Failed to add record: ' + err.message);
      }
    });
  }

  // Refresh when page loads
  refreshMedicalData();
});
