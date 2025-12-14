const BASE = 'http://localhost:3000/api/applications';

export async function getAllApplications() {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error('Failed to fetch applications');
  return res.json();
}

export async function getApplication(id) {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch application');
  return res.json();
}

export async function approveApplication(id, staff_notes) {
  const res = await fetch(`${BASE}/${id}/approve`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ staff_notes })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to approve application');
  }
  return res.json();
}

export async function rejectApplication(id, staff_notes) {
  const res = await fetch(`${BASE}/${id}/reject`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ staff_notes })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to reject application');
  }
  return res.json();
}

export async function scheduleInterview(id, interview_date, interview_time, staff_notes) {
  const res = await fetch(`${BASE}/${id}/interview`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ interview_date, interview_time, staff_notes })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to schedule interview');
  }
  return res.json();
}
