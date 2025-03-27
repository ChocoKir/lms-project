document.addEventListener('DOMContentLoaded', () => {
  // "Explore Now" button redirects to the login page (index.html)
  const exploreBtn = document.getElementById("cta-btn");
  exploreBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });
});
