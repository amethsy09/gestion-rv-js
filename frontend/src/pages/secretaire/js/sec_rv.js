import { createModal } from "../../../components/modals/confirmation/modal_conf.js";
import {
  closeAddRvModal,
  handleAddRvFormSubmit,
  handleUpdateAppointment,
  loadDoctorsAndPatients,
  openAddRvModal,
} from "../../../components/modals/rv/rv_modal.js";
import { fetchData } from "../../../services/api.js";
import { deleteAppointment } from "../../../services/appointmentService.js";
import { paginate } from "../../../utils/pagination.js";

let currentPage = 1;
let itemsPerPage = 3;
let mappedAppointments = [];
let sortByDateAsc = true;

document.addEventListener("DOMContentLoaded", async () => {
  await loadAppointmentsTable();
  await loadModal();
  await loadDoctorsAndPatients();
  setupPaginationControls();
  setupSearchInput();
  setupStatusFilter();
  setupSortButtons();
  const sidebarDeviceButton = document.getElementById("sidebar-device");
  const sidebarClose = document.getElementById("sidebar-close");
  sidebarDeviceButton.addEventListener("click", openSidebar);
  sidebarClose.addEventListener("click", closeSidebar);
});

async function fetchAppointmentsData() {
  try {
    const [appointments, doctors, patients] = await Promise.all([
      fetchData("rendez-vous"),
      fetchData("docteurs"),
      fetchData("patients"),
    ]);

    return { appointments, doctors, patients };
  } catch (error) {
    console.error("Erreur lors de la récupération des données :", error);
    throw error;
  }
}

function mapAppointmentsData(appointments, doctors, patients) {
  return appointments.map((appointment) => {
    const doctor = doctors.find((d) => d.id == appointment.id_docteur);
    const patient = patients.find((p) => p.id == appointment.id_patient);

    return {
      ...appointment,
      docteur_nom: doctor ? `${doctor.nom} ${doctor.prenom}` : "Inconnu",
      patient_nom: patient ? `${patient.nom} ${patient.prenom}` : "Inconnu",
    };
  });
}

function setupSearchInput() {
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", (event) => {
    const searchQuery = event.target.value.toLowerCase();
    currentPage = 1;
    loadAppointmentsTable(searchQuery);
  });
}

function filterAppointments(appointments, searchQuery) {
  if (!searchQuery) return appointments;
  return appointments.filter((appointment) => {
    return (
      appointment.patient_nom.toLowerCase().includes(searchQuery) ||
      appointment.docteur_nom.toLowerCase().includes(searchQuery)
    );
  });
}

async function loadAppointmentsTable(searchQuery = "", status = "Tous") {
  try {
    const { appointments, doctors, patients } = await fetchAppointmentsData();
    mappedAppointments = mapAppointmentsData(appointments, doctors, patients);
    if (searchQuery) {
      mappedAppointments = filterAppointments(mappedAppointments, searchQuery);
    }
    mappedAppointments = filterByStatus(mappedAppointments, status);

    if (sortByDateAsc !== null) {
      mappedAppointments = sortAppointmentsByDate(
        mappedAppointments,
        sortByDateAsc
      );
    }
    const { paginatedData, totalPages } = paginate(
      mappedAppointments,
      itemsPerPage,
      currentPage
    );

    const tableBody = document.getElementById("appointmentsTableBody");
    tableBody.innerHTML = "";
    if (paginatedData.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4 text-gray-500">
            Aucun rendez-vous trouvé.
          </td>
        </tr>
      `;
    } else {
      paginatedData.forEach((appointment) => {
        const row = document.createElement("tr");
        row.className = "border-b p";
        row.innerHTML = `
          <td class="py-2 px-4">${appointment.id}</td>
          <td class="py-2 px-4">${appointment.patient_nom}</td>
          <td class="py-2 px-4">${appointment.docteur_nom}</td>
          <td class="py-2 px-4">${appointment.date}</td>
          <td class="py-2 px-4">${appointment.heure}</td>
          <td class="py-2 px-4">
              <span class="px-2 py-1 rounded-full ${
                appointment.status === "Accepté"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }">
                  ${appointment.status}
              </span>
          </td>
          <td class="py-2 px-4">
             <button data-id="${
               appointment.id
             }" class="bg-gray-100 py-1 px-3 rounded-md hover:bg-gray-200 edit-button">
              <span>Modifier</span>
              <i class="ri-edit-box-line"></i>
              </button>
              <button data-id="${
                appointment.id
              }" class="bg-gray-100 py-1 px-3 rounded-md hover:bg-gray-200 delete-button">
              <span>Supprimer</span>
              <i class="ri-delete-bin-6-line"></i>
              </button>
          </td>
        `;
        tableBody.appendChild(row);
      });
      document.querySelectorAll(".edit-button").forEach((button) => {
        button.addEventListener("click", async (e) => {
          const rvId = e.target.closest("button").dataset.id;
          await handleEditAppointment(rvId);
        });
      });
      document.querySelectorAll(".delete-button").forEach((button) => {
        button.addEventListener("click", async (e) => {
          const rvId = e.target.closest("button").dataset.id;
          await handleDeleteAppointment(rvId);
        });
      });
    }
    updatePaginationControls(currentPage, totalPages);
  } catch (error) {
    console.error("Erreur lors du chargement des rendez-vous :", error);
    alert("Une erreur s'est produite lors du chargement des rendez-vous.");
  }
}

async function loadModal() {
  try {
    const response = await fetch(
      "/frontend/src/components/modals/rv/rv_modal.html"
    );
    if (!response.ok) {
      throw new Error("Erreur lors du chargement de la modale");
    }

    const modalHTML = await response.text();
    const modalContainer = document.getElementById("modalContainer");
    modalContainer.innerHTML = modalHTML;
    const openModalButton = document.getElementById("openAddRvModal");
    const cancelAddPatientButton = document.getElementById("cancelAddRv");
    openModalButton.addEventListener("click", openAddRvModal);
    cancelAddPatientButton.addEventListener("click", closeAddRvModal);
    const form = document.getElementById("addRvForm");
    form.setAttribute("data-action", "add");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const action = form.getAttribute("data-action");
      if (action === "add") {
        const checkModal = document.getElementById("checkModal");
        const newRv = await handleAddRvFormSubmit(checkModal);
        if (newRv) {
          const modal = createModal(
            "verifier.png",
            `Nouvelle rv ajouter avec success `,
            "blue"
          );
          checkModal.appendChild(modal);
        }
      } else if (action === "edit") {
        const rvId = form.getAttribute("data-appointment-id");
        const updatedDoctor = await handleUpdateAppointment(rvId);
        if (updatedDoctor) {
          closeAddRvModal();
          loadAppointmentsTable();
        }
      }
    });
  } catch (error) {
    console.error("Erreur :", error);
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
      loadAppointmentsTable(document.getElementById("searchInput").value);
    }
  });

  nextButton.addEventListener("click", () => {
    const { totalPages } = paginate(
      mappedAppointments,
      itemsPerPage,
      currentPage
    );
    console.log(totalPages);

    if (currentPage < totalPages) {
      currentPage++;
      loadAppointmentsTable(document.getElementById("searchInput").value);
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
    loadAppointmentsTable(document.getElementById("searchInput").value, status);
  });
}
function sortAppointmentsByDate(appointments, ascending = true) {
  return appointments.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return ascending ? dateA - dateB : dateB - dateA;
  });
}
function setupSortButtons() {
  const sortDateButton = document.getElementById("sortDate");

  sortDateButton.addEventListener("click", () => {
    sortByDateAsc = !sortByDateAsc;
    loadAppointmentsTable(
      document.getElementById("searchInput").value,
      document.getElementById("statusFilter").value
    );
  });
}
async function handleEditAppointment(appointmentId) {
  const appointment = mappedAppointments.find((a) => a.id == appointmentId);
  if (!appointment) return;

  document.getElementById("appointmentDate").value = appointment.date;
  document.getElementById("appointmentTime").value = appointment.heure;
  document.getElementById("appointmentDoctor").value = appointment.id_docteur;
  document.getElementById("appointmentPatient").value = appointment.id_patient;

  openAddRvModal();

  const submitButton = document.querySelector(
    "#addRvForm button[type='submit']"
  );
  submitButton.textContent = "Modifier";
  submitButton.innerHTML = `Modifier <i class="ri-edit-box-line"></i>`;

  const form = document.getElementById("addRvForm");
  form.setAttribute("data-action", "edit");
  form.setAttribute("data-appointment-id", appointmentId);
}
export async function handleDeleteAppointment(appointmentId) {
  const modal = createModal(
    "warning.png",
    "Êtes-vous sûr de vouloir supprimer ce patient ?"
  );

  const modalContent = modal.querySelector("div");
  modalContent.innerHTML += `
    <div class="flex justify-center space-x-4 mt-4">
      <button id="confirmDelete" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
        Confirmer
      </button>
      <button id="cancelDelete" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
        Annuler
      </button>
    </div>
  `;
  const checkModal = document.getElementById("checkModal");
  checkModal.appendChild(modal);
  const confirmDeleteButton = modal.querySelector("#confirmDelete");
  confirmDeleteButton.addEventListener("click", async () => {
    try {
      const success = await deleteAppointment(appointmentId);
      if (success) {
        await loadAppointmentsTable();
      }
    } catch (error) {
      console.error("Erreur :", error);
    } finally {
      modal.remove();
    }
  });
  const cancelDeleteButton = modal.querySelector("#cancelDelete");
  cancelDeleteButton.addEventListener("click", () => {
    modal.remove();
  });
}
