/**
 * Staff Dashboard Utilities
 * Handles staff user profile, navigation, and data display across all staff pages
 */

class StaffDashboardManager {
    constructor() {
        this.user = null;
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.loadUserData();
            this.updateProfileUI();
            this.setupNavigation();
            this.setupEventListeners();
        });
    }

    /**
     * Load user data from localStorage
     * Redirect to login if no user data exists
     */
    loadUserData() {
        const userData = localStorage.getItem('currentUser');
        
        if (!userData) {
            console.warn('No user data found. Redirecting to login...');
            window.location.href = '../../pages/login-form.html';
            return;
        }

        try {
            this.user = JSON.parse(userData);
            console.log('User data loaded:', this.user);
        } catch (error) {
            console.error('Failed to parse user data:', error);
            localStorage.removeItem('currentUser');
            window.location.href = '../../pages/login-form.html';
        }
    }

    /**
     * Update all profile UI elements with user data
     * Similar to Facebook - shows user avatar, name, role
     */
    updateProfileUI() {
        if (!this.user) return;

        // Get profile image - use BoyIcon.jpg as default if no profile_image
        const profileImage = this.user.profile_image || '../../../assets/image/photo/BoyIcon.jpg';

        // Update navbar profile section
        const profileImg = document.querySelector('.staff-profile-img');
        const profileNameDivs = document.querySelectorAll('.nav-item.d-flex.align-items-center .text-white div');

        if (profileImg) {
            profileImg.src = profileImage;
            profileImg.onerror = () => {
                profileImg.src = '../../../assets/image/photo/BoyIcon.jpg';
            };
        }

        // Update staff name and role in navbar
        if (profileNameDivs.length >= 2) {
            profileNameDivs[0].textContent = `${this.user.first_name || 'Staff'} ${this.user.last_name || 'Member'}`;
            profileNameDivs[1].textContent = this.getRoleDisplay(this.user.role);
        }

        // Update welcome message if exists
        const welcomeHeading = document.querySelector('.staff-overview-box h4');
        if (welcomeHeading && welcomeHeading.textContent.includes('Shelter Overview')) {
            welcomeHeading.textContent = `Welcome, ${this.user.first_name}`;
        }

        // Update page-specific elements
        this.updatePageSpecificElements();
    }

    /**
     * Update elements specific to each page
     */
    updatePageSpecificElements() {
        const currentPage = window.location.pathname;

        if (currentPage.includes('staff-dashboard')) {
            this.updateDashboardContent();
        } else if (currentPage.includes('staff-messages')) {
            this.updateMessagesContent();
        } else if (currentPage.includes('staff-pets')) {
            this.updatePetsContent();
        }
    }

    /**
     * Update dashboard page content with staff data
     */
    updateDashboardContent() {
        // Update staff stats cards if they exist
        const statCards = document.querySelectorAll('.staff-stat-card h3');
        if (statCards.length >= 4) {
            // These are dashboard stats, keep them as is or fetch from backend
            // For now, they display hardcoded values
        }

        // Update alerts section
        const alertsSection = document.querySelector('.staff-overview-box + .row');
        if (alertsSection) {
            // Alerts are displayed by default, can be enhanced with real data
        }
    }

    /**
     * Update messages page with user info
     */
    updateMessagesContent() {
        const messageHeader = document.querySelector('.staff-overview-box h4');
        if (messageHeader) {
            messageHeader.textContent = `Messages - ${this.user.first_name}`;
        }
    }

    /**
     * Update pets page with user info
     */
    updatePetsContent() {
        const petHeader = document.querySelector('.staff-overview-box h4');
        if (petHeader) {
            petHeader.textContent = `Pet Database - Managed by ${this.user.first_name}`;
        }
    }

    /**
     * Setup navigation links
     */
    setupNavigation() {
        const navLinks = {
            'Pets': 'staff-pets.html',
            'Messages': 'staff-messages.html',
            'Management': 'staff-management.html' // placeholder
        };

        const navItems = document.querySelectorAll('.navbar-nav .nav-link');
        navItems.forEach(link => {
            const text = link.textContent.trim();
            if (navLinks[text]) {
                link.href = navLinks[text];
            }
        });
    }

    /**
     * Setup event listeners for buttons and interactions
     */
    setupEventListeners() {
        // Logout button
        this.setupLogoutButton();

        // Quick action buttons on dashboard
        const quickBtns = document.querySelectorAll('.staff-quick-btn');
        quickBtns.forEach((btn, index) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const actions = [
                    'Add New Pet',
                    'Manage Volunteer',
                    'Generate Reports',
                    'Scheduled Care Task'
                ];
                console.log(`Action clicked: ${actions[index] || 'Unknown'}`);
                alert(`Feature: ${actions[index] || 'Unknown'}`);
            });
        });

        // Care dashboard view button
        const viewCareDashboardBtn = document.querySelector('.staff-view-dashboard-btn');
        if (viewCareDashboardBtn) {
            viewCareDashboardBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Viewing care dashboard...');
                alert('Care Dashboard view - Feature coming soon');
            });
        }
    }

    /**
     * Setup logout functionality
     */
    setupLogoutButton() {
        // Try to find logout button in various possible locations
        const possibleLogoutButtons = [
            document.getElementById('logoutBtn'),
            document.querySelector('[data-action="logout"]'),
            document.querySelector('a[href*="login"]')
        ];

        // Also check if there's a profile dropdown logout
        const navDropdowns = document.querySelectorAll('.nav-item');
        navDropdowns.forEach(dropdown => {
            if (dropdown.textContent.includes('Logout') || dropdown.textContent.includes('Log out')) {
                const logoutLink = dropdown.querySelector('a');
                if (logoutLink) {
                    logoutLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.logout();
                    });
                }
            }
        });
    }

    /**
     * Handle logout
     */
    logout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('userType');
            window.location.href = '../../pages/login-form.html';
        }
    }

    /**
     * Get display text for staff role
     */
    getRoleDisplay(role) {
        const roleMap = {
            'admin': 'Administrator',
            'manager': 'Manager',
            'coordinator': 'Coordinator',
            'staff': 'Staff Member'
        };
        return roleMap[role] || 'Staff Member';
    }

    /**
     * Get user full name
     */
    getFullName() {
        if (!this.user) return 'Staff Member';
        return `${this.user.first_name || ''} ${this.user.last_name || ''}`.trim();
    }

    /**
     * Get user profile image
     */
    getProfileImage() {
        if (!this.user) return '../../../assets/image/photo/BoyIcon.jpg';
        return this.user.profile_image || '../../../assets/image/photo/BoyIcon.jpg';
    }

    /**
     * Display user data (for debugging)
     */
    displayUserData() {
        if (!this.user) {
            console.log('No user data available');
            return;
        }

        console.group('Staff User Data');
        console.log('Name:', this.getFullName());
        console.log('Email:', this.user.email);
        console.log('Phone:', this.user.phone);
        console.log('Role:', this.getRoleDisplay(this.user.role));
        console.log('Status:', this.user.status || 'Active');
        console.log('Created At:', this.user.created_at);
        console.groupEnd();
    }
}

// Initialize staff dashboard when script loads
const staffDashboard = new StaffDashboardManager();
