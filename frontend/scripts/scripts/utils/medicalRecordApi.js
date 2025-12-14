const BASE = 'http://localhost:3000/api/medical';

export async function createMedicalRecord(data) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create medical record');
  }
  return res.json();
}

export async function getMedicalRecordsByPet(petId) {
  const res = await fetch(`${BASE}/pet/${petId}`);
  if (!res.ok) throw new Error('Failed to fetch medical records');
  const data = await res.json();
  return data.data || [];
}

export async function updateMedicalRecord(id, data) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update medical record');
  }
  return res.json();
}

export async function deleteMedicalRecord(id) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete medical record');
  return res.json();
}
