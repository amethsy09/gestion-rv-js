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
