document.addEventListener('DOMContentLoaded', () => {
  // "Explore Now" button redirects to the login page
  const exploreBtn = document.getElementById("cta-btn");
  exploreBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });
});
