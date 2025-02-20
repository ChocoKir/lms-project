// js/onboarding.js
document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("onboardingSeen")) {
    openOnboarding();
  }
});

function openOnboarding() {
  const modal = document.createElement("div");
  modal.id = "onboarding-modal";
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" onclick="closeOnboarding()" aria-label="Close onboarding">×</button>
      <h2>Welcome to LMS!</h2>
      <p>This tour shows the main features:</p>
      <ul>
        <li>Search and view books</li>
        <li>Borrow, return, and reserve books</li>
        <li>Mark books as favorites</li>
        <li>Write reviews and rate books</li>
        <li>Chat with other users</li>
        <li>View and update your profile</li>
        <li>Export your borrowing history</li>
      </ul>
      <button id="onboarding-done">Got it!</button>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById("onboarding-done").addEventListener("click", () => {
    localStorage.setItem("onboardingSeen", "true");
    closeOnboarding();
  });
}

function closeOnboarding() {
  const modal = document.getElementById("onboarding-modal");
  if (modal) modal.remove();
}
