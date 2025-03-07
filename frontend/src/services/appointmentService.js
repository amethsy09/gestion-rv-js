import { fetchData } from "./api.js";
const API_BASE_URL = "http://localhost:3000";

export async function getAppointments() {
  return await fetchData("rendez-vous");
}

export async function addAppointment(appointmentData) {
  try {
    const response = await fetch(`${API_BASE_URL}/rendez-vous`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(appointmentData),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de l'ajout du rendez-vous");
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur :", error);
    throw error;
  }
}

export async function updateRendezVousStatus(id, status) {
  try {
    const response = await fetch(`${API_BASE_URL}/rendez-vous/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
    return response.json();
  } catch (error) {
    console.error("Erreur :", error);
    throw error;
  }
}
export async function updateAppointment(appointmentId, updatedData) {
  try {
    const response = await fetch(`${API_BASE_URL}/rendez-vous/${appointmentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour du rendez-vous");
    }

    const updatedAppointment = await response.json();
    return updatedAppointment;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du rendez-vous :", error);
    throw error;
  }
}
export async function deleteAppointment(appointmentId) {
  try {
    const response = await fetch(`${API_BASE_URL}/rendez-vous/${appointmentId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la suppression du rendez-vous");
    }

    return true; // Suppression réussie
  } catch (error) {
    console.error("Erreur lors de la suppression du rendez-vous :", error);
    throw error;
  }
}
