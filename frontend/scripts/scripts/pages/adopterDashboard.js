document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser || currentUser.role !== 'adopter') {
        console.error('No adopter logged in.');
        // Optionally, redirect or show an error message on the page
        return;
    }

    loadDashboardData(currentUser._id);
    loadRecommendations(currentUser._id);
    updateWelcomeMessage(currentUser);
});

async function loadDashboardData(adopterId) {
    try {
        // Fetch stats from the backend
        const response = await fetch(`http://localhost:3000/api/auth/dashboard/adopter/${adopterId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch dashboard stats.');
        }
        const data = await response.json();
        const stats = data.stats;

        // Update stat cards
        updateStatCard('applicationsCount', stats.totalApplications);
        updateStatCard('approvedCount', stats.approved);
        updateStatCard('adoptedCount', stats.adopted);

        // --- FIX: Make favorites key user-specific ---
        // Favorites are client-side, so we get them from localStorage
        const favoritesKey = adopterId ? `favorites_${adopterId}` : 'favorites_guest';
        const favorites = JSON.parse(localStorage.getItem(favoritesKey)) || [];
        updateStatCard('favoritesCount', favorites.length);

        // Load activity feed from the data we just fetched
        loadActivityFeed(data.recentActivities || []);

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Display error on the page
        document.getElementById('activityFeed').innerHTML = `<p class="text-danger">Could not load dashboard data.</p>`;
    }
}

async function loadRecommendations(adopterId) {
    const container = document.getElementById('recommendationsContainer');
    if (!container) return;

    try {
        const response = await fetch(`http://localhost:3000/api/pets/recommendations/${adopterId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch recommendations.');
        }
        const data = await response.json();
        const recommendedPets = data.pets || [];

        container.innerHTML = ''; // Clear loading message

        if (recommendedPets.length === 0) {
            container.innerHTML = '<p class="text-muted">No specific recommendations for you right now. Browse all pets to find a match!</p>';
            return;
        }

        recommendedPets.forEach(pet => {
            const petCard = document.createElement('div');
            petCard.className = 'adopter-recommend-card mb-3';
            petCard.innerHTML = `
                <img src="${pet.before_image || '/frontend/assets/image/photo/placeholder.jpg'}" alt="${pet.pet_name}" />
                <div>
                    <h6 class="fw-bold mb-1">${pet.pet_name}</h6>
                    <p class="text-muted mb-1 small">${pet.pet_type} • ${pet.age} years old</p>
                    <span class="badge bg-light text-dark">Recommended</span>
                </div>`;
            container.appendChild(petCard);
        });
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Display error on the page
        document.getElementById('activityFeed').innerHTML = `<p class="text-danger">Could not load dashboard data.</p>`;
    }
}

function updateWelcomeMessage(user) {
    const welcomeSpan = document.getElementById('user-name-js');
    if (welcomeSpan && user && user.first_name) {
        welcomeSpan.textContent = user.first_name;
    }
}

function updateStatCard(elementId, count) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = count;
    }
}

function loadActivityFeed(activities) {
    const activityFeed = document.getElementById('activityFeed');
    if (!activityFeed) return;

    if (activities.length === 0) {
        activityFeed.innerHTML = '<p class="text-muted">No recent application activity.</p>';
        return;
    }

    activityFeed.innerHTML = ''; // Clear loading message
    activities.forEach(activity => {
        const activityElement = document.createElement('div');
        activityElement.className = 'mb-2';

        const timeAgo = new Date(activity.timestamp).toLocaleDateString();

        activityElement.innerHTML = `
            <span class="adopter-activity-label" style="background-color: #e9ecef;">${activity.status}</span>
            ${activity.action}
            <small class="text-muted d-block">${timeAgo}</small>
        `;
        activityFeed.appendChild(activityElement);
    });
}