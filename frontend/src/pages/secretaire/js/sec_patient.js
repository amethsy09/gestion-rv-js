import { createModal } from "../../../components/modals/confirmation/modal_conf.js";
import {
  closeAddPatientModal,
  handleAddPatientFormSubmit,
  handleUpdatePatient,
  openAddPatientModal,
} from "../../../components/modals/patients/patient_modal.js";
import { showNotification } from "../../../components/notifications/notification.js";
import {
  deletePatient,
  getPatients,
} from "../../../services/patientService.js";
import { paginate } from "../../../utils/pagination.js";

let currentPage = 1;
let itemsPerPage = 2;
let patients = [];

document.addEventListener("DOMContentLoaded", async () => {
  await loadPatientsTable();
  await loadModal();
  setupPaginationControls();
  setupSearchInput();
  const sidebarDeviceButton = document.getElementById("sidebar-device");
  const sidebarClose = document.getElementById("sidebar-close");
  sidebarDeviceButton.addEventListener("click", openSidebar);
  sidebarClose.addEventListener("click", closeSidebar);
});

async function loadPatientsTable(searchQuery = "") {
  try {
    patients = await getPatients();
    if (searchQuery) {
      patients = filterPatients(patients, searchQuery);
    }
    const { paginatedData, totalPages } = paginate(
      patients,
      itemsPerPage,
      currentPage
    );
    const tableBody = document.getElementById("patientsTableBody");
    tableBody.innerHTML = "";

    if (paginatedData.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4 text-gray-500">
            Aucun patient trouvé.
          </td>
        </tr>
      `;
    } else {
      paginatedData.forEach((patient) => {
        const row = document.createElement("tr");
        row.classList.add("border-b", "font-medium", "hover:bg-gray-50");
        row.innerHTML = `
                <td class="py-2 px-4"><img src="${patient.avatar}" class="w-10 h-10 rounded-full object-cover"/></td>
                <td class="py-2 px-4">${patient.nom}</td>
                <td class="py-2 px-4">${patient.prenom}</td>
                <td class="py-2 px-4">${patient.email}</td>
                <td class="py-2 px-4">${patient.telephone}</td>
                <td class="py-2 px-4">${patient.adresse}</td>
                <td class="py-2 px-4">
            <button data-id="${patient.id}" class="bg-gray-100 py-1 px-3 rounded-md hover:bg-gray-200 edit-button">
              <span>Modifier</span>
              <i class="ri-edit-box-line"></i>
            </button>
            <button data-id="${patient.id}" class="bg-gray-100 py-1 px-3 rounded-md hover:bg-gray-200 delete-button">
              <span>Supprimer</span>
              <i class="ri-delete-bin-6-line"></i>
            </button>
          </td>
            `;
        tableBody.appendChild(row);
      });
      document.querySelectorAll(".edit-button").forEach((button) => {
        button.addEventListener("click", async (e) => {
          const patientId = e.target.closest("button").dataset.id;
          await handleEditPatient(patientId);
        });
      });

      document.querySelectorAll(".delete-button").forEach((button) => {
        button.addEventListener("click", async (e) => {
          const patientId = e.target.closest("button").dataset.id;
          await handleDeletePatient(patientId);
        });
      });
      updatePaginationControls(currentPage, totalPages);
    }
  } catch (error) {
    console.error("Erreur lors du chargement des patients :", error);
    alert("Une erreur s'est produite lors du chargement des patients.");
  }
}

async function loadModal() {
  try {
    const response = await fetch(
      "/frontend/src/components/modals/patients/patient_modal.html"
    );
    if (!response.ok) {
      throw new Error("Erreur lors du chargement de la modale");
    }

    const modalHTML = await response.text();
    const modalContainer = document.getElementById("modalContainer");
    modalContainer.innerHTML = modalHTML;
    const openModalButton = document.getElementById("openAddPatientModal");
    const cancelAddPatientButton = document.getElementById("cancelAddPatient");
    openModalButton.addEventListener("click", openAddPatientModal);
    cancelAddPatientButton.addEventListener("click", closeAddPatientModal);
    const form = document.getElementById("addPatientForm");
    form.setAttribute("data-action", "add");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const action = form.getAttribute("data-action");
      if (action === "add") {
        const newPatient = await handleAddPatientFormSubmit();
        const checkModal = document.getElementById("checkModal");
        if (newPatient) {
          const modal = createModal(
            "verifier.png",
            `Dr ${newPatient.prenom} ${newPatient.nom} ajouter avec success`,
            "blue"
          );
          checkModal.appendChild(modal);
        }
      } else if (action === "edit") {
        const patientId = form.getAttribute("data-patient-id");
        const updatedDoctor = await handleUpdatePatient(patientId);
        if (updatedDoctor) {
          closeAddDocteurModal();
          showNotification("Patient modifier avec success");
          loadDoctorsTable();
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
      loadPatientsTable(document.getElementById("searchInput").value);
    }
  });

  nextButton.addEventListener("click", () => {
    const { totalPages } = paginate(patients, itemsPerPage, currentPage);
    console.log(totalPages);

    if (currentPage < totalPages) {
      currentPage++;
      loadPatientsTable(document.getElementById("searchInput").value);
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

function filterPatients(patients, searchQuery) {
  if (!searchQuery) return patients;
  return patients.filter((patient) => {
    return (
      patient.prenom.toLowerCase().includes(searchQuery) ||
      patient.nom.toLowerCase().includes(searchQuery)
    );
  });
}

function setupSearchInput() {
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", (event) => {
    const searchQuery = event.target.value.toLowerCase();
    currentPage = 1;
    loadPatientsTable(searchQuery);
  });
}

async function handleEditPatient(patientId) {
  const patient = patients.find((p) => p.id == patientId);
  if (!patient) return;

  document.getElementById("patientNom").value = patient.nom;
  document.getElementById("patientPrenom").value = patient.prenom;
  document.getElementById("patientEmail").value = patient.email;
  document.getElementById("patientTelephone").value = patient.telephone;
  document.getElementById("patientAdresse").value = patient.adresse;
  document.getElementById("patientAvatar").value = patient.avatar;
  document.getElementById("patientPassword").value = patient.password;

  openAddPatientModal();

  const submitButton = document.querySelector(
    "#addPatientForm button[type='submit']"
  );
  submitButton.textContent = "Modifier";
  submitButton.innerHTML = `Modifier <i class="ri-edit-box-line"></i>`;

  const form = document.getElementById("addPatientForm");
  form.setAttribute("data-action", "edit");
  form.setAttribute("data-patient-id", patientId);
}

async function handleDeletePatient(patientId) {
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
      const success = await deletePatient(patientId);
      if (success) {
        await loadPatientsTable();
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
