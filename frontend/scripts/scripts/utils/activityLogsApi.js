const BASE = 'http://localhost:3000/api/activitylogs';

export async function createActivityLog(data) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create activity log');
  }
  return res.json();
}

export async function getActivityLogsForPet(petId) {
  const res = await fetch(`${BASE}/pet/${petId}`);
  if (!res.ok) throw new Error('Failed to fetch activity logs');
  const data = await res.json();
  return data.logs || [];
}
