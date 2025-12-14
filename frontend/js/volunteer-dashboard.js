// Load volunteer profile when page opens
document.addEventListener('DOMContentLoaded', function() {
    // Get user data from localStorage
    const userData = localStorage.getItem('currentUser');
    
    if (!userData) {
        // Redirect to login if no user data
        window.location.href = 'login-form.html';
        return;
    }

    const user = JSON.parse(userData);
    updateVolunteerProfile(user);
    loadVolunteerData(user);
    setupEventListeners();
});

function updateVolunteerProfile(user) {
    // Update volunteer name and role using database fields
    const fullName = `${user.first_name} ${user.last_name}`;
    const userRole = getUserRoleDisplay(user.role);
    
    // Update navbar profile
    const navbarName = document.getElementById('volunteerNavbarName');
    const navbarRole = document.getElementById('volunteerNavbarRole');
    if (navbarName) navbarName.textContent = fullName;
    if (navbarRole) navbarRole.textContent = userRole;
    
    // Update welcome message
    const welcomeMessage = document.getElementById('volunteerWelcomeMessage');
    if (welcomeMessage) {
        welcomeMessage.textContent = `Welcome back, ${user.first_name}!`;
    }
    
    // Update profile image in navbar if available
    const profileImage = document.querySelector('.profile-image');
    if (user.profile_image && profileImage) {
        profileImage.src = user.profile_image;
    }
    
    // Update dropdown header
    const dropdownHeader = document.querySelector('.dropdown-header');
    if (dropdownHeader) {
        dropdownHeader.innerHTML = `<strong>${fullName}</strong><br>
                                   <small class="text-muted">${userRole}</small>`;
    }
}

function loadVolunteerData(user) {
    // Calculate statistics from user data
    const volunteerData = {
        hoursThisMonth: calculateHoursThisMonth(user),
        petsHelped: calculatePetsHelped(user),
        tasksCompleted: calculateTasksCompleted(user),
        successfulAdoptions: calculateSuccessfulAdoptions(user),
        subtitle: generateSubtitle(user),
        todaysSchedule: getTodaysSchedule(user),
        performanceItems: getPerformanceItems(user)
    };
    
    // Update statistics
    document.getElementById('hoursThisMonth').textContent = volunteerData.hoursThisMonth;
    document.getElementById('petsHelped').textContent = volunteerData.petsHelped;
    document.getElementById('tasksCompleted').textContent = volunteerData.tasksCompleted;
    document.getElementById('successfulAdoptions').textContent = volunteerData.successfulAdoptions;
    
    // Update subtitle
    const subtitle = document.getElementById('volunteerSubtitle');
    if (subtitle) subtitle.textContent = volunteerData.subtitle;
    
    // Update today's schedule
    const scheduleItem1 = document.getElementById('scheduleItem1');
    const scheduleItem2 = document.getElementById('scheduleItem2');
    
    if (scheduleItem1 && volunteerData.todaysSchedule[0]) {
        scheduleItem1.querySelector('.fw-semibold').textContent = volunteerData.todaysSchedule[0].task;
        scheduleItem1.querySelector('.volunteer-schedule-time').textContent = volunteerData.todaysSchedule[0].time;
    }
    
    if (scheduleItem2 && volunteerData.todaysSchedule[1]) {
        scheduleItem2.querySelector('.fw-semibold').textContent = volunteerData.todaysSchedule[1].task;
        scheduleItem2.querySelector('.volunteer-schedule-time').textContent = volunteerData.todaysSchedule[1].time;
    }
    
    // Update performance list
    const performanceList = document.getElementById('performanceList');
    if (performanceList && volunteerData.performanceItems) {
        performanceList.innerHTML = '';
        volunteerData.performanceItems.forEach(item => {
            const li = document.createElement('li');
            li.className = 'mb-2';
            li.textContent = `✔ ${item}`;
            performanceList.appendChild(li);
        });
    }
}

// Helper functions to calculate statistics from user data
function calculateHoursThisMonth(user) {
    // If user has activities array, calculate hours from current month
    if (user.activities && Array.isArray(user.activities)) {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlyHours = user.activities
            .filter(activity => {
                const activityDate = new Date(activity.date || activity.created_at);
                return activityDate.getMonth() === currentMonth && 
                       activityDate.getFullYear() === currentYear;
            })
            .reduce((total, activity) => total + (activity.hours || 0), 0);
        
        return monthlyHours || 0;
    }
    return 0; // Default if no activities
}

function calculatePetsHelped(user) {
    // Count unique pets from activities
    if (user.activities && Array.isArray(user.activities)) {
        const petIds = new Set();
        user.activities.forEach(activity => {
            if (activity.pet_id) petIds.add(activity.pet_id);
        });
        return petIds.size;
    }
    return 0;
}

function calculateTasksCompleted(user) {
    // Count completed tasks/activities
    if (user.activities && Array.isArray(user.activities)) {
        return user.activities.filter(activity => 
            activity.status === 'completed' || 
            activity.status === 'approved'
        ).length;
    }
    return 0;
}

function calculateSuccessfulAdoptions(user) {
    // Count successful adoptions from activities
    if (user.activities && Array.isArray(user.activities)) {
        return user.activities.filter(activity => 
            activity.type === 'adoption' && 
            (activity.status === 'completed' || activity.status === 'successful')
        ).length;
    }
    return 0;
}

function generateSubtitle(user) {
    const petsHelped = calculatePetsHelped(user);
    if (petsHelped > 0) {
        return `You've made a difference in ${petsHelped} pets' lives this month`;
    }
    return "Start helping pets today! Your journey begins now.";
}

function getTodaysSchedule(user) {
    // Get today's activities from user data
    const today = new Date().toISOString().split('T')[0];
    let todaysActivities = [];
    
    if (user.availability && Array.isArray(user.availability)) {
        todaysActivities = user.availability
            .filter(slot => slot.date === today || slot.day === new Date().getDay())
            .map(slot => ({
                task: slot.task || slot.activity || 'Volunteer Shift',
                time: formatTimeSlot(slot.start_time, slot.end_time)
            }));
    }
    
    // If no activities found in availability, provide default
    if (todaysActivities.length === 0) {
        return [
            { task: "Dog Walking - Morning Shift", time: "9:00 AM - 11:00 AM" },
            { task: "Cat Socialization", time: "2:00 PM - 4:00 PM" }
        ];
    }
    
    return todaysActivities.slice(0, 2); // Return first 2 activities
}

function formatTimeSlot(start, end) {
    if (!start || !end) return "Time to be scheduled";
    
    const formatTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };
    
    return `${formatTime(start)} - ${formatTime(end)}`;
}

function getPerformanceItems(user) {
    const items = [];
    
    // Add performance items based on user activities
    if (user.activities && Array.isArray(user.activities)) {
        const recentActivities = user.activities.slice(-5); // Last 5 activities
        
        recentActivities.forEach(activity => {
            if (activity.type === 'walking' || activity.task === 'Dog Walking') {
                items.push(`Completed dog walking for ${activity.pet_name || 'a pet'}`);
            } else if (activity.type === 'socialization') {
                items.push(`Socialized with ${activity.pet_name || 'cats'}`);
            } else if (activity.type === 'adoption' && activity.status === 'completed') {
                items.push(`Assisted adoption for ${activity.pet_name || 'a pet'}`);
            } else if (activity.type === 'cleaning') {
                items.push(`Cleaned ${activity.area || 'facility areas'}`);
            }
        });
    }
    
    // If no specific activities, provide default items
    if (items.length === 0) {
        return [
            "Completed 3 dog walks this week",
            "Assisted 2 adoptions successfully", 
            "Helped with 1 vaccination clinic"
        ];
    }
    
    return items.slice(0, 3); // Return first 3 items
}

function setupEventListeners() {
    // View full schedule button
    const viewScheduleBtn = document.getElementById('viewFullScheduleBtn');
    if (viewScheduleBtn) {
        viewScheduleBtn.addEventListener('click', function() {
            // Redirect to schedule page
            window.location.href = 'volunteer-schedule.html';
        });
    }

    // Schedule items click events
    const scheduleItems = document.querySelectorAll('.volunteer-schedule-item');
    scheduleItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            const task = this.querySelector('.fw-semibold').textContent;
            const time = this.querySelector('.volunteer-schedule-time').textContent;
            alert(`Schedule Item ${index + 1}:\n${task}\n${time}`);
        });
    });
}

function getUserRoleDisplay(role) {
    const roles = {
        'adopter': 'Pet Adopter',
        'volunteer': 'Volunteer',
        'staff': 'Staff Member',
        'coordinator': 'Coordinator',
        'admin': 'Administrator'
    };
    return roles[role] || 'Volunteer';
}

// Function to fetch updated volunteer data from backend (optional)
async function fetchVolunteerData(userId) {
    try {
        const response = await fetch(`/api/volunteers/${userId}/stats`);
        if (response.ok) {
            const data = await response.json();
            return data;
        }
    } catch (error) {
        console.error('Error fetching volunteer data:', error);
    }
    return null;
}