import { createModal } from "../../../components/modals/confirmation/modal_conf.js";
import {
  closeAddRvModal,
  handleAddRvFormSubmit,
  loadDoctorsAndPatients,
  openAddRvModal,
} from "../../../components/modals/rv/rv_modal.js";
import { fetchData } from "../../../services/api.js";
import { paginate } from "../../../utils/pagination.js";

let currentPage = 1;
let itemsPerPage = 3;
let mappedAppointments = [];

document.addEventListener("DOMContentLoaded", async () => {
  await loadAppointmentsTable();
  await loadModal();
  await loadDoctorsAndPatients();
  setupPaginationControls();
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

async function loadAppointmentsTable() {
  try {
    const { appointments, doctors, patients } = await fetchAppointmentsData();
    mappedAppointments = mapAppointmentsData(appointments, doctors, patients);
    const { paginatedData, totalPages } = paginate(
      mappedAppointments,
      itemsPerPage,
      currentPage
    );

    const tableBody = document.getElementById("appointmentsTableBody");
    tableBody.innerHTML = "";

    paginatedData.forEach((appointment) => {
      const row = document.createElement("tr");
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
                   <button class="bg-gray-100 py-1 px-3 rounded-md hover:bg-gray-200 cursor-not-allowed" disabled>
                    <span>Modifier</span>
                    <i class="ri-edit-box-line"></i>
                    </button>
                    <button class="bg-gray-100 py-1 px-3 rounded-md hover:bg-gray-200 cursor-not-allowed" disabled>
                    <span>Supprimer</span>
                    <i class="ri-delete-bin-6-line"></i>
                    </button>
                </td>
            `;
      tableBody.appendChild(row);
    });
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

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
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
      loadAppointmentsTable();
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
      loadAppointmentsTable();
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
