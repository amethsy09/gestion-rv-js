import {
  getPatientNotifications,
  getRendezVousAndDocteurInfoByDocteur,
} from "../../../services/patientService.js";
import { getCurrentUser } from "../../../store/auth.js";
import { paginate } from "../../../utils/pagination.js";

let currentPage = 1;
let itemsPerPage = 5;
let mappedAppointments = [];

document.addEventListener("DOMContentLoaded", async () => {
  const user = getCurrentUser();
  const rendezVous = await getRendezVousAndDocteurInfoByDocteur(user.id);
  await handleNotificaionCount(user.id);
  mappedAppointments = rendezVous; // Stocker les rendez-vous dans une variable globale
  setupPaginationControls();
  setupSearchInput();
  setupStatusFilter();
  loadPaginatedData(mappedAppointments);
  const sidebarDeviceButton = document.getElementById("sidebar-device");
  const sidebarClose = document.getElementById("sidebar-close");
  sidebarDeviceButton.addEventListener("click", openSidebar);
  sidebarClose.addEventListener("click", closeSidebar);
});

function createAppointmentRow(rdv) {
  const row = document.createElement("tr");
  row.className = "border-b hover:bg-gray-50";
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
          rdv.docteurAvatar
            ? `<img src="${rdv.docteurAvatar}" alt="${rdv.docteurNom}" class="w-8 h-8 rounded-full object-cover mr-2">`
            : ""
        }
        <span>Dr. ${rdv.docteurNom}</span>
      </div>
    </td>
    <td class="p-3 overflow-visible">
      <span class="py-1 px-3 rounded-3xl ${statusColor}">${rdv.status}</span>
    </td>
  `;

  return row;
}

function loadPaginatedData(appointments) {
  const { paginatedData, totalPages } = paginate(
    appointments,
    itemsPerPage,
    currentPage
  );
  displayPatientAppointments(paginatedData);
  updatePaginationControls(currentPage, totalPages);
}

function displayPatientAppointments(rendezVous) {
  const tbody = document.getElementById("rendezVousTableBody");
  tbody.innerHTML = "";

  if (rendezVous.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-4 text-gray-500">
          Aucun rendez-vous trouvé.
        </td>
      </tr>
    `;
  } else {
    rendezVous.forEach((rdv) => {
      const row = createAppointmentRow(rdv);
      tbody.appendChild(row);
    });
  }
}

function openSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.remove("-translate-x-full");
}

function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.add("-translate-x-full");
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
    return appointment.docteurNom.toLowerCase().includes(searchQuery);
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

async function handleNotificaionCount(id) {
  const notifications = await getPatientNotifications(id);
  const showNotif = document.getElementById("notifLength");
  showNotif.textContent = notifications.length;
}
