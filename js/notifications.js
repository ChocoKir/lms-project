// js/notifications.js
export function sendBrowserNotification(title, options = {}) {
  if ("Notification" in window) {
    if (Notification.permission === "granted") {
      new Notification(title, options);
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(title, options);
        }
      });
    }
  } else {
    console.log("This browser does not support notifications.");
  }
}
