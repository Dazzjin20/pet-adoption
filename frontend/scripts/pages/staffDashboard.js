document.addEventListener('DOMContentLoaded', () => {
    fetchDashboardData();
});

/**
 * Fetches aggregated data for the staff dashboard from the backend.
 */
async function fetchDashboardData() {
    try {
        // This endpoint needs to be created on your backend.
        // It should gather all the necessary stats and recent activities. - FIX: Corrected the API endpoint URL.
        const response = await fetch('http://localhost:3000/api/auth/dashboard/staff');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        updateStatistics(data.stats);
        updateAlerts(data.recentActivities);

    } catch (error) {
        console.error('Failed to fetch staff dashboard data:', error);
        document.getElementById('recentAlertsContainer').innerHTML = `<div class="alert alert-danger">Could not load dashboard data.</div>`;
    }
}

/**
 * Updates the statistic cards with data from the API.
 * @param {object} stats - The statistics object from the backend.
 */
function updateStatistics(stats) {
    if (!stats) return;

    // FIX: Update the new statistic elements
    document.getElementById('dogsInCareCount').textContent = stats.dogsInCare || 0;
    document.getElementById('catsInCareCount').textContent = stats.catsInCare || 0;
    document.getElementById('adoptionsThisMonthCount').textContent = stats.adoptionsThisMonth || 0;
    document.getElementById('urgentCareCount').textContent = stats.urgentCare || 0;
}

/**
 * Populates the "Recent Alerts" section with activities.
 * @param {Array<object>} activities - An array of recent activities from the backend.
 */
function updateAlerts(activities) {
    const container = document.getElementById('recentAlertsContainer');
    if (!container) return;

    if (!activities || activities.length === 0) {
        container.innerHTML = '<p class="text-muted">No recent alerts.</p>';
        return;
    }

    // Sort activities by date, most recent first
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = activities.map(activity => createAlertArticle(activity)).join('');
}

/**
 * Creates an HTML article element for a single alert.
 * @param {object} activity - The activity object.
 * @returns {string} - The HTML string for the alert article.
 */
function createAlertArticle(activity) {
    const { type, message, date } = activity;
    const { label, className } = getAlertType(type);
    const timeAgo = formatTimeAgo(date);

    return `
        <article class="d-flex align-items-center mb-3">
            <span class="staff-alert-label ${className} me-3 flex-shrink-0">${label}</span>
            <span class="flex-grow-1">${message}</span>
            <small class="text-muted ms-2">${timeAgo}</small>
        </article>
    `;
}

/**
 * Determines the label and class for an alert type.
 * @param {string} type - The type of the activity (e.g., 'new_application', 'medical_record').
 * @returns {{label: string, className: string}}
 */
function getAlertType(type) {
    switch (type) {
        case 'urgent_task':
            return { label: 'Urgent', className: 'staff-alert-urgent' };
        case 'medical_record':
            return { label: 'Medical', className: 'staff-alert-medical' };
        case 'new_application':
            return { label: 'Application', className: 'staff-alert-update' };
        default:
            return { label: 'Update', className: 'staff-alert-update' };
    }
}

/**
 * Formats a date into a "time ago" string.
 * @param {string} dateString - The ISO date string.
 * @returns {string} - A human-readable time difference.
 */
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    return `${days}d ago`;
}