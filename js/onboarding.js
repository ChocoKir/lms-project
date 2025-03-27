document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("onboardingSeen")) {
    startOnboardingTour();
  }
});

function startOnboardingTour() {
  const modal = document.getElementById("onboarding-modal");
  modal.style.display = "flex";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.innerHTML = `
    <div class="modal-content" tabindex="0">
      <button class="modal-close" aria-label="Close Onboarding" onclick="closeOnboarding()">×</button>
      <h2>Welcome to LMS!</h2>
      <ol class="onboarding-steps">
        <li>Use the navigation bar to explore sections.</li>
        <li>Review our key features below.</li>
        <li>Click "Explore Now" to begin your journey.</li>
      </ol>
      <button id="onboarding-done">Got It!</button>
    </div>
  `;
  document.getElementById("onboarding-done").addEventListener("click", () => {
    localStorage.setItem("onboardingSeen", "true");
    closeOnboarding();
  });
  modal.querySelector(".modal-content").focus();
}

function closeOnboarding() {
  const modal = document.getElementById("onboarding-modal");
  modal.style.display = "none";
}
