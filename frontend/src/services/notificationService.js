import { fetchData } from "./api.js";

const API_BASE_URL = "http://localhost:3000";

export async function getNotifications() {
  return await fetchData("notifications");
}

export async function sendNotification(data) {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Erreur lors de l'envoi de la notification");
    }
    return await response.json();
  } catch (error) {
    console.error("Erreur :", error);
    throw error;
  }
}

export async function markNotificationAsRead(notificationId, role) {
  try {
    const notification = await fetchData(`notifications/${notificationId}`);
    if (role === "patients") {
      notification.isReadPatient = true;
    } else if (role === "docteurs") {
      notification.isReadDocteur = true;
    }
    await updateNotification(notificationId, notification);
    if (notification.isReadPatient && notification.isReadDocteur) {
      await archiveNotification(notificationId);
    }
    console.log("Notification marquée comme lue.");
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la notification :", error);
    throw error;
  }
}

export async function updateNotification(notificationId, updatedData) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/notifications/${notificationId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      }
    );
    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour de la notification");
    }
    return await response.json();
  } catch (error) {
    console.error("Erreur :", error);
    throw error;
  }
}

export async function archiveNotification(notificationId) {
  try {
    const notification = await fetchData(`notifications/${notificationId}`);
    await fetch(`${API_BASE_URL}/archives`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notification),
    });
    await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Erreur lors de l'archivage de la notification :", error);
    throw error;
  }
}
