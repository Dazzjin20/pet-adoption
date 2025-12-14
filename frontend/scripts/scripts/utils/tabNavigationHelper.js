// Helper to preserve pet ID across tab navigation
document.addEventListener('DOMContentLoaded', () => {
  // Get pet ID from current URL
  const urlParams = new URLSearchParams(window.location.search);
  const petId = urlParams.get('id');

  if (!petId) return; // No pet ID to preserve

  // Update all tab links that have data-page attribute
  const tabLinks = document.querySelectorAll('[data-page]');
  tabLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href !== '#') {
      // Append or update query parameter
      const separator = href.includes('?') ? '&' : '?';
      link.setAttribute('href', `${href}${separator}id=${petId}`);
    }
  });
});
