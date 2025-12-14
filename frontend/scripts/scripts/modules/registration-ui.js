document.addEventListener('DOMContentLoaded', () => {
    const sections = {
        adopter: document.getElementById('registerFormAdopters'),
        volunteer: document.getElementById('registerFormVolunteer'),
        staff: document.getElementById('registerFormStaff')
    };

    // All buttons that can switch forms, grouped by the form they are in
    const buttonGroups = [
        { adopter: 'registerBtnAdopters', volunteer: 'registerBtnVolunteer', staff: 'registerBtnStaff' },
        { adopter: 'registerBtnAdopters2', volunteer: 'registerBtnVolunteer2', staff: 'registerBtnStaff2' },
        { adopter: 'registerBtnAdopters3', volunteer: 'registerBtnVolunteer3', staff: 'registerBtnStaff3' }
    ];

    function updateButtonStyles(activeUserType) {
        buttonGroups.forEach(group => {
            Object.entries(group).forEach(([userType, buttonId]) => {
                const button = document.getElementById(buttonId);
                if (button) {
                    if (userType === activeUserType) {
                        button.classList.remove('btn-outline-dark');
                        button.classList.add('btn-dark');
                    } else {
                        button.classList.remove('btn-dark');
                        button.classList.add('btn-outline-dark');
                    }
                }
            });
        });
    }

    function showSection(userType) {
        // Hide all sections
        Object.values(sections).forEach(section => {
            if (section) section.classList.add('d-none');
        });

        // Show the selected section
        if (sections[userType]) {
            sections[userType].classList.remove('d-none');
        }

        // Update button styles
        updateButtonStyles(userType);
    }

    // Add event listeners to all switching buttons
    buttonGroups.forEach(group => {
        Object.entries(group).forEach(([userType, buttonId]) => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', (e) => {
                    e.preventDefault(); // Prevent form submission if inside a form
                    showSection(userType);
                });
            }
        });
    });
});