import { showNotification } from "../components/notifications/notification.js";

export function setNotification(message, type = "success") {
  localStorage.setItem("notifications", JSON.stringify({ message, type }));
}

export function handleNotifications() {
  const notificationData = JSON.parse(localStorage.getItem("notifications"));

  if (notificationData) {
    const { message, type } = notificationData;
    showNotification(message, type);
    localStorage.removeItem("notifications");
  }
}
