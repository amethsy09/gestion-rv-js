import {
  closeAddPatientModal,
  handleAddPatientFormSubmit,
  openAddPatientModal,
} from "../../../components/modals/patients/patient_modal.js";
import { getPatients } from "../../../services/patientService.js";

document.addEventListener("DOMContentLoaded", async () => {
  await loadPatientsTable();
  await loadModal();
  const sidebarDeviceButton = document.getElementById("sidebar-device");
  const sidebarClose = document.getElementById("sidebar-close");
  sidebarDeviceButton.addEventListener("click", openSidebar);
  sidebarClose.addEventListener("click", closeSidebar);
});

async function loadPatientsTable() {
  try {
    const patients = await getPatients();
    const tableBody = document.getElementById("patientsTableBody");
    tableBody.innerHTML = "";

    patients.forEach((patient) => {
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

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await handleAddPatientFormSubmit();
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
