export function initNotificationCenter() {
  const center = document.createElement("div");
  center.id = "notification-center";
  center.setAttribute("aria-live", "polite");
  center.style.position = "fixed";
  center.style.bottom = "20px";
  center.style.right = "20px";
  center.style.maxWidth = "300px";
  center.style.zIndex = "15000";
  document.body.appendChild(center);
}

export function addNotification(message) {
  const center = document.getElementById("notification-center");
  if (!center) return;
  const notif = document.createElement("div");
  notif.className = "notif";
  notif.innerText = message;
  notif.style.background = "rgba(0, 0, 0, 0.8)";
  notif.style.color = "#fff";
  notif.style.padding = "0.5rem 1rem";
  notif.style.marginBottom = "0.5rem";
  notif.style.borderRadius = "4px";
  center.appendChild(notif);
  setTimeout(() => {
    center.removeChild(notif);
  }, 5000);
}
