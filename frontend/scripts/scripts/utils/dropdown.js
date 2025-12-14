function myFunction() {
  document.getElementById("managementMenu").classList.toggle("show");
}

// Close dropdown when clicking outside
window.onclick = function(event) {
  if (!event.target.matches('#managementBtn')) {
    var dropdown = document.getElementById("managementMenu");
    if (dropdown.classList.contains("show")) {
      dropdown.classList.remove("show");
    }
  }
}
