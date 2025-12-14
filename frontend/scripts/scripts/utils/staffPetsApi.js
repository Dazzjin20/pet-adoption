const BASE = 'http://localhost:3000/api/pets';

export async function getPets(params = {}) {
  const url = new URL(BASE);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.append(k, v);
  });
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch pets');
  return res.json();
}

export async function getPet(id) {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch pet');
  return res.json();
}

export async function createPet(petData) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(petData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create pet');
  }
  return res.json();
}

export async function updatePet(id, petData) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(petData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update pet');
  }
  return res.json();
}

export async function deletePet(id) {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to delete pet');
  }
  return res.json();
}
