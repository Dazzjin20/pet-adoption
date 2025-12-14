import { initializePage } from '../utils/dashboardUtils.js';

initializePage(user => {
    // Ito ang page-specific logic para sa Staff Dashboard
    console.log('Staff Dashboard initialized for:', user);
    renderDashboard(user);
});

function renderDashboard(user) {
    // Dito mo ilalagay ang code para i-populate ang dashboard ng staff.
    // Halimbawa, pag-update ng welcome message o pag-display ng listahan ng tasks.
    
    // Example:
    // const welcomeEl = document.getElementById('staffWelcomeMessage');
    // if (welcomeEl) {
    //     welcomeEl.textContent = `Welcome, Coordinator ${user.first_name}!`;
    // }
}
