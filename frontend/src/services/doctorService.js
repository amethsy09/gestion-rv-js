import { fetchData } from "./api.js";
import { getNotifications } from "./notificationService.js";
const API_BASE_URL = "http://localhost:3000";

export async function getDoctors() {
  return await fetchData("docteurs");
}

export async function addDocteur(docteurData) {
  try {
    const response = await fetch(`${API_BASE_URL}/docteurs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(docteurData),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de l'ajout du docteur");
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur :", error);
    throw error;
  }
}

export async function getRendezVousByDocteur(idDocteur) {
  const rendezVous = await fetchData("rendez-vous");
  return rendezVous.filter((rdv) => rdv.id_docteur == idDocteur);
}

export async function getRendezVousAndPatientInfoByDocteur(idDocteur) {
  const rendezVous = await fetchData("rendez-vous");
  const patients = await fetchData("patients");

  const rendezVousDocteur = rendezVous
    .filter((rdv) => rdv.id_docteur == idDocteur)
    .map((rdv) => {
      const patient = patients.find((p) => p.id == rdv.id_patient);
      return {
        ...rdv,
        patientNom: patient ? `${patient.prenom} ${patient.nom}` : "Inconnu",
        patientAvatar: patient ? patient.avatar : "",
      };
    });

  return rendezVousDocteur;
}

export async function getPatientsByDocteur(idDocteur) {
  const rendezVous = await fetchData("rendez-vous");
  const patientsIds = new Set(
    rendezVous
      .filter((rdv) => rdv.id_docteur == idDocteur)
      .map((rdv) => rdv.id_patient)
  );
  console.log(patientsIds);

  const patients = await fetchData("patients");
  return patients.filter((patient) => patientsIds.has(parseInt(patient.id)));
}

export async function getStatistiquesRendezVousParStatut(idDocteur) {
  const rendezVous = await fetchData("rendez-vous");
  const rendezVousDocteur = rendezVous.filter(
    (rdv) => rdv.id_docteur == idDocteur
  );

  const statistiques = rendezVousDocteur.reduce((acc, rdv) => {
    acc[rdv.status] = (acc[rdv.status] || 0) + 1;
    return acc;
  }, {});

  return statistiques;
}

export async function getStatistiquesMensuellesRendezVous(idDocteur) {
  const rendezVous = await fetchData("rendez-vous");
  const rendezVousDocteur = rendezVous.filter(
    (rdv) => rdv.id_docteur == idDocteur
  );

  const statistiques = rendezVousDocteur.reduce((acc, rdv) => {
    const mois = new Date(rdv.date).toLocaleString("fr-FR", {
      month: "long",
      year: "numeric",
    });
    acc[mois] = (acc[mois] || 0) + 1;
    return acc;
  }, {});

  return statistiques;
}

export async function getStatistiquesMensuellesPatients(idDocteur) {
  const rendezVous = await fetchData("rendez-vous");
  const rendezVousDocteur = rendezVous.filter(
    (rdv) => rdv.id_docteur == idDocteur
  );

  const statistiques = rendezVousDocteur.reduce((acc, rdv) => {
    const mois = new Date(rdv.date).toLocaleString("fr-FR", {
      month: "long",
      year: "numeric",
    });
    if (!acc[mois]) {
      acc[mois] = new Set();
    }
    acc[mois].add(rdv.id_patient);
    return acc;
  }, {});

  const result = {};
  for (const [mois, patients] of Object.entries(statistiques)) {
    result[mois] = patients.size;
  }

  return result;
}

export async function updateDocteur(id, docteurData) {
  try {
    const response = await fetch(`${API_BASE_URL}/docteurs/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(docteurData),
    });
    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour du docteur");
    }
    return await response.json();
  } catch (error) {
    console.error("Erreur :", error);
    throw error;
  }
}

export async function deleteDocteur(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/docteurs/${String(id)}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Erreur lors de la suppression du docteur");
    }
    return true;
  } catch (error) {
    console.error("Erreur :", error);
    throw error;
  }
}

export async function getDocteurNotifications(docteurId) {
  try {
    const notifications = await getNotifications();
    const docteurNotifications = notifications.filter(
      (notification) => notification.id_docteur == docteurId
    );
    return docteurNotifications;
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications :", error);
    throw error;
  }
}
