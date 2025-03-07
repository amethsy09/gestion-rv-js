import { fetchData } from "./api.js";
const API_BASE_URL = "http://localhost:3000";

export async function getPatients() {
  return await fetchData("patients");
}

export async function addPatient(patientData) {
  try {
    const response = await fetch(`${API_BASE_URL}/patients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patientData),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de l'ajout du patient");
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur :", error);
    throw error;
  }
}

export async function getRendezVousByPatientId(patientId) {
  const rendezVous = await fetchData("rendez-vous");
  return rendezVous.filter((rdv) => rdv.id_patient == patientId);
}

export async function getRendezVousAndDocteurInfoByDocteur(patientId) {
  const rendezVous = await fetchData("rendez-vous");
  const docteurs = await fetchData("docteurs");

  const rendezVousPatients = rendezVous
    .filter((rdv) => rdv.id_patient == patientId)
    .map((rdv) => {
      const docteur = docteurs.find((d) => d.id == rdv.id_docteur);
      return {
        ...rdv,
        docteurNom: docteur ? `${docteur.prenom} ${docteur.nom}` : "Inconnu",
        docteurAvatar: docteur ? docteur.avatar : "",
      };
    });

  return rendezVousPatients;
}

export async function getRendezVousStatsByPatientId(patientId) {
  const rendezVous = await getRendezVousByPatientId(patientId);
  return {
    accepted: rendezVous.filter((rdv) => rdv.status === "Accepté").length,
    rejected: rendezVous.filter((rdv) => rdv.status === "Annulé").length,
    pending: rendezVous.filter((rdv) => rdv.status === "En attente").length,
  };
}

export async function getRendezVousByMonth(patientId) {
  const rendezVous = await getRendezVousByPatientId(patientId);

  const dataByMonth = rendezVous.reduce((acc, rdv) => {
    const date = new Date(rdv.date);
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    const key = `${month} ${year}`;

    if (!acc[key]) {
      acc[key] = { accepted: 0, rejected: 0, pending: 0 };
    }

    if (rdv.status === "Accepté") acc[key].accepted++;
    else if (rdv.status === "Annulé") acc[key].rejected++;
    else if (rdv.status === "En attente") acc[key].pending++;

    return acc;
  }, {});

  const labels = Object.keys(dataByMonth);
  const acceptedData = labels.map((month) => dataByMonth[month].accepted);
  const rejectedData = labels.map((month) => dataByMonth[month].rejected);
  const pendingData = labels.map((month) => dataByMonth[month].pending);

  return { labels, acceptedData, rejectedData, pendingData };
}

export async function updatePatient(patientId, patientData) {
  const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patientData),
  });
  if (!response.ok) {
    throw new Error("Erreur lors de la mise à jour du patient");
  }
  return response.json();
}

export async function deletePatient(patientId) {
  const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Erreur lors de la suppression du patient");
  }
  return response.ok;
}
