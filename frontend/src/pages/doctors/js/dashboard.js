import {
  getPatientsByDocteur,
  getRendezVousByDocteur,
  getStatistiquesMensuellesPatients,
  getStatistiquesMensuellesRendezVous,
  getStatistiquesRendezVousParStatut,
} from "../../../services/doctorService.js";
import { getCurrentUser } from "../../../store/auth.js";
import { handleNotifications } from "../../../store/notification.js";

document.addEventListener("DOMContentLoaded", async () => {
  handleNotifications();
  await displayCardInfo();
  displayDocteurInfo();
  const sidebarDeviceButton = document.getElementById("sidebar-device");
  const sidebarClose = document.getElementById("sidebar-close");
  sidebarDeviceButton.addEventListener("click", openSidebar);
  sidebarClose.addEventListener("click", closeSidebar);
});

async function displayCardInfo() {
  const user = getCurrentUser();
  const rendezVous = await getRendezVousByDocteur(user.id);
  const patients = await getPatientsByDocteur(user.id);
  const statistiquesRendezVous = await getStatistiquesRendezVousParStatut(
    user.id
  );
  const statistiquesPatients = await getStatistiquesMensuellesPatients(user.id);
  const statistoquesRendezVousByMonth =
    await getStatistiquesMensuellesRendezVous(user.id);

  document.getElementById("totalAppointments").textContent = rendezVous.length;
  document.getElementById("totalPatients").textContent = patients.length;
  document.getElementById("pendingAppointments").textContent =
    statistiquesRendezVous["En attente"] || 0;
  displayCharRvStatusDocteur(statistiquesRendezVous);
  displayCharPatientDocteur(statistiquesPatients);
  displayChartRvDocteurByMonth(statistoquesRendezVousByMonth);
}

function displayDocteurInfo() {
  const user = getCurrentUser();
  const profileDoc = document.getElementById("profileDoc");
  const nameDoc = document.getElementById("nameDoc");
  const specialiteDoc = document.getElementById("specialiteDoc");
  profileDoc.src = user.avatar;
  nameDoc.textContent = `Dr. ${user.prenom} ${user.nom}`;
  specialiteDoc.textContent = user.specialite;
}

function displayCharRvStatusDocteur(statistiquesStatut) {
  const ctxStatut = document
    .getElementById("statutRendezVousChart")
    .getContext("2d");
  new Chart(ctxStatut, {
    type: "bar",
    data: {
      labels: Object.keys(statistiquesStatut),
      datasets: [
        {
          label: "Rendez-vous par statut",
          data: Object.values(statistiquesStatut),
          backgroundColor: [
            "rgba(255, 206, 86, 0.5)", // En attente (jaune)
            "rgba(75, 192, 192, 0.5)", // Accepté (vert)
            "rgba(255, 99, 132, 0.5)", // Annulé (rouge)
          ],
          borderColor: [
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(255, 99, 132, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function displayCharPatientDocteur(statistiquesPatients) {
  const ctxPatients = document
    .getElementById("evolutionPatientsChart")
    .getContext("2d");
  new Chart(ctxPatients, {
    type: "line",
    data: {
      labels: Object.keys(statistiquesPatients),
      datasets: [
        {
          label: "Patients par mois",
          data: Object.values(statistiquesPatients),
          backgroundColor: "rgba(34, 197, 94, 0.5)",
          borderColor: "rgba(34, 197, 94, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function displayChartRvDocteurByMonth(statistiquesRendezVous) {
  const ctxRendezVous = document
    .getElementById("evolutionRendezVousChart")
    .getContext("2d");
  new Chart(ctxRendezVous, {
    type: "bar",
    data: {
      labels: Object.keys(statistiquesRendezVous),
      datasets: [
        {
          label: "Rendez-vous par mois",
          data: Object.values(statistiquesRendezVous),
          backgroundColor: "rgba(59, 130, 246, 0.5)",
          borderColor: "rgba(59, 130, 246, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function openSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.remove("-translate-x-full");
}

function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.add("-translate-x-full");
}
