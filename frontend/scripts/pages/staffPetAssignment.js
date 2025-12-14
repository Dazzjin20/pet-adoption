import AuthService from '../components/authService.js';

class StaffPetAssignment {
    constructor() {
        this.volunteerListContainer = document.querySelector('.volunteer-assignments-volunteer-list');
        this.initialize();
    }

    async initialize() {
        const token = AuthService.getToken();
        if (!token) {
            console.error('Authentication token not found.');
            return;
        }

        await this.fetchAndRenderVolunteers(token);
    }

    async fetchAndRenderVolunteers(token) {
        if (!this.volunteerListContainer) return;

        try {
            const response = await fetch('http://localhost:3000/api/volunteers', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch volunteers: ${response.statusText}`);
            }

            const result = await response.json();
            const volunteers = result.data;

            this.volunteerListContainer.innerHTML = ''; // Clear existing static content

            if (volunteers.length === 0) {
                this.volunteerListContainer.innerHTML = '<p class="text-muted p-3">No volunteers found.</p>';
                return;
            }

            volunteers.forEach(volunteer => {
                const initials = `${volunteer.first_name[0] || ''}${volunteer.last_name[0] || ''}`.toUpperCase();
                const volunteerItem = `
                    <div class="volunteer-assignments-volunteer-item">
                        <div class="volunteer-assignments-volunteer-avatar">${initials}</div>
                        <div class="volunteer-assignments-volunteer-content">
                            <div class="volunteer-assignments-volunteer-fullname">${volunteer.first_name} ${volunteer.last_name}</div>
                            <a href="mailto:${volunteer.email}" class="volunteer-assignments-volunteer-email">${volunteer.email}</a>
                        </div>
                    </div>`;
                this.volunteerListContainer.insertAdjacentHTML('beforeend', volunteerItem);
            });
        } catch (error) {
            console.error('Error:', error);
            this.volunteerListContainer.innerHTML = `<p class="text-danger p-3">Error loading volunteers.</p>`;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new StaffPetAssignment());