// js/utils.js

// Toast notification function
export function showToast(message) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerText = message;
  container.appendChild(toast);
  setTimeout(() => {
    container.removeChild(toast);
  }, 4000);
}

// Optional: Modal (for future use)
// function showModal(content) { ... }
