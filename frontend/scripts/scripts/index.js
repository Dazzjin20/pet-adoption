document.addEventListener('DOMContentLoaded', () => {

  const navLinks = document.querySelectorAll('#navmenu .nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // --- Button Functionality ---
  const readMoreBtn = document.getElementById('readMoreBtn');
  if (readMoreBtn) {
    readMoreBtn.addEventListener('click', () => {
      // Scrolls to the "How We Help" section
      document.querySelector('.p-5 .container .row.mb-4.text-center').scrollIntoView({ behavior: 'smooth' });
    });
  }

  const startAdoptingBtn = document.getElementById('startAdoptingBtn');
  if (startAdoptingBtn) {
    startAdoptingBtn.addEventListener('click', () => {
      // Redirects to the login page, showing the adopter form
      window.location.href = './pages/login-form.html'; 
    });
  }

  const becomeVolunteerBtn = document.getElementById('becomeVolunteerBtn');
  if (becomeVolunteerBtn) {
    becomeVolunteerBtn.addEventListener('click', () => {
      // Redirects to the login page, showing the volunteer form
      // We'll use a URL parameter to tell the login page which form to show
      window.location.href = './pages/login-form.html?form=volunteer';
    });
  }


  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1 // Trigger when 10% of the element is visible
  });

  // Select all elements you want to animate
  const elementsToAnimate = document.querySelectorAll('.card, #stats .col-12, #home #info-text, #home .image-wrapper, #contact .row, .py-5.justify-content-center .row, #contact .btn');
  elementsToAnimate.forEach(el => {
    el.classList.add('reveal'); // Add initial class for styling
    observer.observe(el);
  });
});