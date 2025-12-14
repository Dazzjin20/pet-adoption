// /frontend/scripts/utils/adopterPetsApi.js
const BASE = 'http://localhost:3000/api/pets';

export async function getPetsForAdopter(params = {}) {
  const url = new URL(BASE);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.append(k, v);
  });
  
  // Only show available pets to adopters
  url.searchParams.append('status', 'available');
  
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch pets');
  return res.json();
}

export async function getPetDetails(petId) {
  const res = await fetch(`${BASE}/${petId}`);
  if (!res.ok) throw new Error('Failed to fetch pet details');
  return res.json();
}

export async function addToFavorites(petId) {
  const token = localStorage.getItem('token');
  const res = await fetch(`http://localhost:3000/api/favorites`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ petId })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to add to favorites');
  }
  return res.json();
}

export async function removeFromFavorites(petId) {
  const token = localStorage.getItem('token');
  const res = await fetch(`http://localhost:3000/api/favorites/${petId}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to remove from favorites');
  }
  return res.json();
}

export async function getFavorites() {
  const token = localStorage.getItem('token');
  const res = await fetch(`http://localhost:3000/api/favorites`, {
    headers: { 
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to fetch favorites');
  return res.json();
}