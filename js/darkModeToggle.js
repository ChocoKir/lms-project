document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggle-dark-mode");
  if (!toggleBtn) return;
  if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
  }
  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode") ? "enabled" : "disabled");
  });
});
