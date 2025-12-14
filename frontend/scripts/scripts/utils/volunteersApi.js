const BASE = 'http://localhost:3000/api/volunteers';

export async function getAvailableVolunteers() {
  const res = await fetch(`${BASE}/available`);
  if (!res.ok) throw new Error('Failed to fetch available volunteers');
  return res.json();
}

export async function getVolunteerById(id) {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch volunteer');
  return res.json();
}
