import { showNotification } from "../../../components/notifications/notification.js";
import { updateRendezVousStatus } from "../../../services/appointmentService.js";
import {
  getDocteurNotifications,
  getRendezVousAndPatientInfoByDocteur,
} from "../../../services/doctorService.js";
import { getCurrentUser } from "../../../store/auth.js";
import { paginate } from "../../../utils/pagination.js";

let currentPage = 1;
let itemsPerPage = 2;
let mappedAppointments = [];

document.addEventListener("DOMContentLoaded", async () => {
  const user = getCurrentUser();
  displayDocteurInfo();
  const rendezVous = await getRendezVousAndPatientInfoByDocteur(user.id);
  mappedAppointments = rendezVous;
  setupPaginationControls();
  setupSearchInput();
  setupStatusFilter();
  loadPaginatedData(mappedAppointments);
  handleNotificaionCount(user.id);
  document
    .getElementById("rendezVousTableBody")
    .addEventListener("click", handleOptionClick);
  document
    .getElementById("rendezVousTableBody")
    .addEventListener("click", handleButtonClick);
  const sidebarDeviceButton = document.getElementById("sidebar-device");
  const sidebarClose = document.getElementById("sidebar-close");
  sidebarDeviceButton.addEventListener("click", openSidebar);
  sidebarClose.addEventListener("click", closeSidebar);
});

function displayDocteurInfo() {
  const user = getCurrentUser();
  const profileDoc = document.getElementById("profileDoc");
  const nameDoc = document.getElementById("nameDoc");
  const specialiteDoc = document.getElementById("specialiteDoc");
  profileDoc.src = user.avatar;
  nameDoc.textContent = `Dr. ${user.prenom} ${user.nom}`;
  specialiteDoc.textContent = user.specialite;
}

function openSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.remove("-translate-x-full");
}

async function handleNotificaionCount(id) {
  let notifications = await getDocteurNotifications(id);
  notifications = notifications.filter(
    (notification) => notification.isReadDocteur == false
  );
  const showNotif = document.getElementById("notifLength");
  showNotif.textContent = notifications.length || 0;
}

function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.add("-translate-x-full");
}

function createTableRow(rdv) {
  const row = document.createElement("tr");
  row.className = "border-b";
  const statusColor =
    {
      "En attente": "bg-orange-50 text-orange-500",
      Accepté: "bg-green-50 text-green-500",
      Annulé: "bg-red-50 text-red-500",
    }[rdv.status] || "bg-gray-50";

  row.innerHTML = `
    <td class="p-3">
    <i class="ri-calendar-schedule-line mr-2"></i>
    ${rdv.date}
    </td>
    <td class="p-3">
    <i class="ri-timer-line"></i>
    ${rdv.heure}
    </td>
    <td class="p-3">
      <div class="flex items-center">
        ${
          rdv.patientAvatar
            ? `<img src="${rdv.patientAvatar}" alt="${rdv.patientNom}" class="w-8 h-8 rounded-full object-cover mr-2">`
            : ""
        }
        <span>${rdv.patientNom}</span>
      </div>
    </td>
    <td class="p-3 overflow-visible">
    <span class="py-1 px-3 rounded-3xl ${statusColor}">${rdv.status}</span>
    </td>
    <td class="p-3 relative">
      ${
        rdv.status === "En attente"
          ? `<button data-id="${rdv.id}" class="text-gray-500 hover:text-gray-700 focus:outline-none">
            <i class="ri-more-fill"></i>
           </button>`
          : ""
      }
    </td>
  `;

  return row;
}

function createOptionCard(rdv) {
  const card = document.createElement("div");
  card.className =
    "absolute -top-11 right-0 mt-2 bg-white rounded-lg shadow-lg z-10 border border-gray-200";
  card.innerHTML = `
    <div class="p-1 flex flex-col">
      <button data-id="${rdv.id}" data-action="accepter" class="w-full text-left px-3 py-2 text-sm text-green-500 hover:bg-gray-100 border-b border-gray-200">
        <i class="ri-checkbox-circle-fill"></i>
        Accepter
      </button>
      <button data-id="${rdv.id}" data-action="refuser" class="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-gray-100"> 
        <i class="ri-close-circle-fill"></i>
        Refuser
      </button>
    </div>
  `;

  return card;
}

function handleOptionClick(event) {
  const button = event.target.closest("button");
  if (button && button.dataset.id) {
    const id = button.dataset.id;
    document.querySelectorAll(".option-card").forEach((card) => card.remove());
    const card = createOptionCard({ id });
    card.classList.add("option-card");
    button.parentElement.appendChild(card);
    const handleClickOutside = (e) => {
      if (!button.contains(e.target) && !card.contains(e.target)) {
        card.remove();
        document.removeEventListener("click", handleClickOutside);
      }
    };

    document.addEventListener("click", handleClickOutside);
  }
}

function createCard(rdv) {
  const card = document.createElement("div");
  card.className = "bg-white p-4 rounded-lg shadow-md";
  const statusColor =
    {
      "En attente": "bg-orange-50 text-orange-500",
      Accepté: "bg-green-50 text-green-500",
      Annulé: "bg-red-50 text-red-500",
    }[rdv.status] || "bg-gray-50";

  card.innerHTML = `
    <div class="space-y-2 flex flex-col gap-2">
    <div class="flex justify-between items-center">
          <p class="text-lg">
      <i class="ri-calendar-schedule-line"></i>
      ${rdv.date}
      </p>
      <p class="text-lg">
      <i class="ri-timer-line"></i>
       ${rdv.heure}
      </p>
    </div>
      <div class="flex items-center">
        ${
          rdv.patientAvatar
            ? `<img src="${rdv.patientAvatar}" alt="${rdv.patientNom}" class="w-8 h-8 rounded-full mr-2 object-cover">`
            : ""
        }
        <p class=" text-gray-500"> ${rdv.patientNom}</p>
      </div>       
      <p class="text-sm">Statut : <span class="px-2 py-1 text-white rounded ${statusColor}">${
    rdv.status
  }</span></p>
      ${
        rdv.status === "En attente"
          ? `<div class="flex space-x-2 mt-4">
             <button data-id="${rdv.id}" data-action="accepter" class="bg-green-500 text-white px-3 py-1 rounded-md">✅ Accepter</button>
             <button data-id="${rdv.id}" data-action="refuser" class="bg-red-500 text-white px-3 py-1 rounded-md">❌ Refuser</button>
           </div>`
          : ""
      }
    </div>
  `;

  return card;
}

function displayTable(rendezVous) {
  const tbody = document.getElementById("rendezVousTableBody");
  tbody.innerHTML = "";

  rendezVous.forEach((rdv) => {
    const row = createTableRow(rdv);
    tbody.appendChild(row);
  });
}

function displayCards(rendezVous) {
  const cardsContainer = document.getElementById("rendezVousCards");
  cardsContainer.innerHTML = "";

  rendezVous.forEach((rdv) => {
    const card = createCard(rdv);
    cardsContainer.appendChild(card);
  });
}

function loadPaginatedData(appointments) {
  const { paginatedData, totalPages } = paginate(
    appointments,
    itemsPerPage,
    currentPage
  );
  if (paginatedData.length === 0) {
    displayNoResultsMessage();
  } else {
    displayTable(paginatedData);
    displayCards(paginatedData);
  }
  updatePaginationControls(currentPage, totalPages);
}

function displayNoResultsMessage() {
  const tbody = document.getElementById("rendezVousTableBody");
  const cardsContainer = document.getElementById("rendezVousCards");

  // Message pour le tableau
  tbody.innerHTML = `
    <tr>
      <td colspan="5" class="text-center py-4 text-gray-500">
        Aucun rendez-vous trouvé.
      </td>
    </tr>
  `;

  // Message pour les cartes
  cardsContainer.innerHTML = `
    <div class="text-center py-4 text-gray-500">
      Aucun rendez-vous trouvé.
    </div>
  `;
}

function handleButtonClick(event) {
  const button = event.target;

  if (
    button.tagName === "BUTTON" &&
    button.dataset.id &&
    button.dataset.action
  ) {
    const id = button.dataset.id;
    const action = button.dataset.action;

    if (action === "accepter") {
      validerRendezVous(id);
    } else if (action === "refuser") {
      refuserRendezVous(id);
    }
  }
}

async function validerRendezVous(id) {
  showNotification("Rendez-vous accepté avec succès !");
  await updateRendezVousStatus(id, "Accepté");
}

async function refuserRendezVous(id) {
  showNotification("Rendez-vous refusé.", "error");
  await updateRendezVousStatus(id, "Annulé");
}

function setupPaginationControls() {
  const prevButton = document.getElementById("prevPage");
  const nextButton = document.getElementById("nextPage");

  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      loadPaginatedData(filterAndSortAppointments());
    }
  });

  nextButton.addEventListener("click", () => {
    const { totalPages } = paginate(
      mappedAppointments,
      itemsPerPage,
      currentPage
    );
    if (currentPage < totalPages) {
      currentPage++;
      loadPaginatedData(filterAndSortAppointments());
    }
  });
}

function updatePaginationControls(currentPage, totalPages) {
  const prevButton = document.getElementById("prevPage");
  const nextButton = document.getElementById("nextPage");
  const pageInfo = document.getElementById("pageInfo");

  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === totalPages;
  pageInfo.textContent = `Page ${currentPage} sur ${totalPages}`;
}

function filterByStatus(appointments, status) {
  if (status === "Tous") return appointments;
  return appointments.filter((appointment) => appointment.status === status);
}

function setupStatusFilter() {
  const statusFilter = document.getElementById("statusFilter");

  statusFilter.addEventListener("change", (event) => {
    const status = event.target.value;
    currentPage = 1;
    loadPaginatedData(filterAndSortAppointments(status));
  });
}

function setupSearchInput() {
  const searchInput = document.getElementById("searchInput");

  searchInput.addEventListener("input", (event) => {
    const searchQuery = event.target.value.toLowerCase();
    currentPage = 1;
    loadPaginatedData(filterAndSortAppointments(null, searchQuery));
  });
}

function filterAppointments(appointments, searchQuery) {
  if (!searchQuery) return appointments;
  return appointments.filter((appointment) => {
    return appointment.patientNom.toLowerCase().includes(searchQuery);
  });
}

function filterAndSortAppointments(status = null, searchQuery = null) {
  let filteredAppointments = mappedAppointments;

  if (status) {
    filteredAppointments = filterByStatus(filteredAppointments, status);
  }

  if (searchQuery) {
    filteredAppointments = filterAppointments(
      filteredAppointments,
      searchQuery
    );
  }

  return filteredAppointments;
}
