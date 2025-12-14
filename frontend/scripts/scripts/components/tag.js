document.querySelectorAll(".staff-pet-tag").forEach(btn => {
  btn.addEventListener("click", () => {
    btn.classList.toggle("selected");
  });
});
