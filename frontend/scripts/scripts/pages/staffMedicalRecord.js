import { createMedicalRecord, getMedicalRecordsByPet } from '../utils/medicalRecordApi.js';

document.addEventListener('DOMContentLoaded', async () => {
  const addBtn = document.getElementById('addRecordBtn');
  const modalEl = document.getElementById('addMedicalRecordModal');
  const submitBtn = document.getElementById('submitAddRecordBtn');
  const form = document.getElementById('addMedicalRecordForm');
  const medicalList = document.getElementById('medicalHistoryList');
  const vaccinationList = document.getElementById('vaccinationList');

  const bsModal = modalEl ? bootstrap.Modal.getOrCreateInstance(modalEl) : null;

  // Get pet ID from URL or window variable
  const petId = window.currentPetId || document.body.dataset.petId || new URLSearchParams(window.location.search).get('id');

  async function refreshMedicalData() {
    if (!petId) {
      console.warn('Pet ID not found');
      return;
    }

    try {
      const records = await getMedicalRecordsByPet(petId);
      
      if (!records || records.length === 0) {
        medicalList.innerHTML = '<p class="text-muted">No records yet.</p>';
        vaccinationList.innerHTML = '<p class="text-muted">No vaccination records yet.</p>';
        return;
      }

      // Separate vaccination from other medical records
      const vaccinations = records.filter(r => r.recordType === 'Vaccination');
      const medicalRecords = records.filter(r => r.recordType !== 'Vaccination');

      // Display vaccination cards
      if (vaccinations.length === 0) {
        vaccinationList.innerHTML = '<p class="text-muted">No vaccination records yet.</p>';
      } else {
        vaccinationList.innerHTML = vaccinations.map(v => {
          const vDate = new Date(v.date);
          const today = new Date();
          const isOverdue = vDate < today;
          const statusBadge = isOverdue ? '<span class="badge bg-danger">Overdue</span>' : '<span class="badge bg-warning">Due</span>';
          
          return `
            <div class="card mb-3 border-0 shadow-sm">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 class="card-title fw-bold mb-1">${v.recordType}</h6>
                    <p class="card-text small text-muted mb-0">Date: ${vDate.toLocaleDateString()}</p>
                    <p class="card-text small text-muted mb-0">Veterinarian: ${v.veterinarian || 'Not specified'}</p>
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
        medicalList.innerHTML = medicalRecords.map(r => {
          const rDate = new Date(r.date);
          return `
            <div class="mb-3 border rounded-3 p-3" style="border-left: 4px solid #007bff !important;">
              <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                  <strong>${r.recordType}</strong>
                  <div class="small text-muted mt-1">
                    ${rDate.toLocaleDateString()} • ${r.veterinarian || 'Not specified'}
                  </div>
                  ${r.description ? `<div class="mt-2 text-muted">${r.description}</div>` : ''}
                  ${r.notes ? `<div class="mt-2 text-secondary"><small><strong>Notes:</strong> ${r.notes}</small></div>` : ''}
                </div>
                <span class="badge bg-secondary">${r.recordType}</span>
              </div>
            </div>
          `;
        }).join('');
      }
    } catch (err) {
      console.error('Failed to load medical records:', err);
      medicalList.innerHTML = '<p class="text-danger">Failed to load records</p>';
    }
  }

  // Wire Add Record button
  if (addBtn && bsModal) {
    addBtn.addEventListener('click', () => {
      bsModal.show();
    });
  }

  // Wire form submission
  if (submitBtn && form) {
    submitBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const payload = {
        pet_id: petId,
        recordType: document.getElementById('recordType').value,
        date: document.getElementById('recordDate').value,
        description: document.getElementById('recordDescription').value,
        veterinarian: document.getElementById('recordVeterinarian').value,
        notes: document.getElementById('recordNotes').value
      };

      try {
        await createMedicalRecord(payload);
        
        // Hide modal and reset form
        if (bsModal) bsModal.hide();
        form.reset();
        
        // Refresh the medical data display
        await refreshMedicalData();
        
        // Show success message
        alert('Medical record added successfully!');
      } catch (err) {
        console.error('Failed to create medical record:', err);
        alert('Failed to add record: ' + err.message);
      }
    });
  }

  // Load records on page load
  refreshMedicalData();

  // Refresh every 5 seconds to show new data from other tabs
  setInterval(() => {
    refreshMedicalData();
  }, 5000);
});
