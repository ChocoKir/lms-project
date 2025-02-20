// js/notifications.js
document.addEventListener('DOMContentLoaded', () => {
  // Check if browser supports notifications
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notifications.");
    return;
  }
  // Request permission if not already granted
  if (Notification.permission !== "granted") {
    Notification.requestPermission().then(permission => {
      console.log("Notification permission:", permission);
    });
  }
});

// Function to send a notification
export function sendNotification(title, options = {}) {
  if (Notification.permission === "granted") {
    new Notification(title, options);
  }
}
