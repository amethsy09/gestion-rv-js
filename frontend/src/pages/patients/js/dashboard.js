import {
  getPatientNotifications,
  getRendezVousByMonth,
  getRendezVousStatsByPatientId,
} from "../../../services/patientService.js";
import { getCurrentUser } from "../../../store/auth.js";
import { handleNotifications } from "../../../store/notification.js";

document.addEventListener("DOMContentLoaded", async () => {
  handleNotifications();
  const user = getCurrentUser();
  displayInfoPatient(user);
  await handleNotificaionCount(user.id);
  await displayCardInfo();
  displayNotificationsRecentModals(user);
  const { labels, acceptedData, rejectedData, pendingData } =
    await getRendezVousByMonth(user.id);
  initChart(labels, acceptedData, rejectedData, pendingData);
  const sidebarDeviceButton = document.getElementById("sidebar-device");
  const sidebarClose = document.getElementById("sidebar-close");

  sidebarDeviceButton.addEventListener("click", openSidebar);
  sidebarClose.addEventListener("click", closeSidebar);
});

function displayRecentNotifications(notifications) {
  const recentNotifications = document.getElementById("recentNotifications");
  recentNotifications.innerHTML = "";

  if (notifications.length === 0) {
    recentNotifications.innerHTML = `
      <p class="text-gray-500">Aucune notification récente.</p>
    `;
    return;
  }

  notifications.forEach((notification) => {
    const notificationItem = document.createElement("div");
    notificationItem.className = "p-2 bg-gray-50 rounded-md";
    notificationItem.innerHTML = `
      <p class="text-sm">${notification.message}</p>
      <span class="text-xs text-gray-500">${new Date(
        notification.createdAt
      ).toLocaleString()}</span>
    `;
    recentNotifications.appendChild(notificationItem);
  });
}

function displayInfoPatient(user) {
  const profilPatient = document.getElementById("profilPatient");
  const nomPatient = document.getElementById("nomPatient");
  const rolePatient = document.getElementById("rolePatient");
  const emailPatient = document.getElementById("emailPatient");
  const adressePatient = document.getElementById("adressePatient");
  const numPatient = document.getElementById("numPatient");
  profilPatient.src = user.avatar;
  nomPatient.textContent = `${user.nom} ${user.prenom}`;
  rolePatient.textContent = user.role;
  emailPatient.textContent = user.email;
  adressePatient.textContent = user.adresse;
  numPatient.textContent = user.telephone;
}

async function displayCardInfo() {
  const user = getCurrentUser();
  const { accepted, rejected, pending } = await getRendezVousStatsByPatientId(
    user.id
  );

  document.getElementById("valideAppointments").textContent = accepted;
  document.getElementById("deleteAppointments").textContent = rejected;
  document.getElementById("pendingAppointments").textContent = pending;
}

function displayNotificationsRecentModals(user) {
  const notificationIcon = document.getElementById("notificationIcon");
  const notificationModal = document.getElementById("notificationModal");
  notificationIcon.addEventListener("mouseenter", async () => {
    const notifications = await getPatientNotifications(user.id);
    displayRecentNotifications(notifications.slice(0, 3));
    notificationModal.classList.remove("hidden");
  });

  notificationIcon.addEventListener("mouseleave", () => {
    notificationModal.classList.add("hidden");
  });

  notificationModal.addEventListener("mouseenter", () => {
    notificationModal.classList.remove("hidden");
  });

  notificationModal.addEventListener("mouseleave", () => {
    notificationModal.classList.add("hidden");
  });
}

export function initChart(labels, acceptedData, rejectedData, pendingData) {
  const ctx = document.getElementById("statutRendezVousChart").getContext("2d");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Rendez-vous acceptés",
          data: acceptedData,
          borderColor: "#10B981", // Couleur verte
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          fill: true,
        },
        {
          label: "Rendez-vous refusés",
          data: rejectedData,
          borderColor: "#EF4444", // Couleur rouge
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          fill: true,
        },
        {
          label: "Rendez-vous en attente",
          data: pendingData,
          borderColor: "#F59E0B", // Couleur orange
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Évolution des rendez-vous par mois",
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Mois",
          },
        },
        y: {
          title: {
            display: true,
            text: "Nombre de rendez-vous",
          },
          beginAtZero: true,
        },
      },
    },
  });
}

async function handleNotificaionCount(id) {
  const notifications = await getPatientNotifications(id);
  const showNotif = document.getElementById("notifLength");
  showNotif.textContent = notifications.length;
}

function openSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.remove("-translate-x-full");
}

function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.add("-translate-x-full");
}
