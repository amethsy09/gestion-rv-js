import { createModal } from "../../../components/modals/confirmation/modal_conf.js";
import {
  closeAddDocteurModal,
  handleAddDocteurFormSubmit,
  openAddDocteurModal,
} from "../../../components/modals/docteurs/docteur_modal.js";
import { getDoctors } from "../../../services/doctorService.js";
import { paginate } from "../../../utils/pagination.js";

let currentPage = 1;
let itemsPerPage = 3;
let doctors = [];

document.addEventListener("DOMContentLoaded", async () => {
  await loadDoctorsTable();
  await loadModal();
  setupPaginationControls();
  setupSearchInput();
  const sidebarDeviceButton = document.getElementById("sidebar-device");
  const sidebarClose = document.getElementById("sidebar-close");
  sidebarDeviceButton.addEventListener("click", openSidebar);
  sidebarClose.addEventListener("click", closeSidebar);
  const form = document.getElementById("addDocteurForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newDocteur = await handleAddDocteurFormSubmit(e);
    const checkModal = document.getElementById("checkModal");
    if (newDocteur) {
      const modal = createModal(
        "verifier.png",
        `Dr ${newPatient.prenom} ${newPatient.nom} ajouter avec success`,
        "blue"
      );
      checkModal.appendChild(modal);
    }
    checkModal.appendChild(modal);
  });
});

async function loadDoctorsTable(searchQuery = "") {
  try {
    doctors = await getDoctors();
    if (searchQuery) {
      doctors = filterDocteurs(doctors, searchQuery);
    }
    const { paginatedData, totalPages } = paginate(
      doctors,
      itemsPerPage,
      currentPage
    );
    const tableBody = document.getElementById("doctorsTableBody");
    tableBody.innerHTML = "";
    if (paginatedData.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4 text-gray-500">
            Aucun docteur trouvé.
          </td>
        </tr>
      `;
    } else {
      paginatedData.forEach((doctor) => {
        const row = document.createElement("tr");
        row.className = "border-b border-gray-100 hover:bg-slate-50";
        row.innerHTML = `
                  <td class="py-2 px-4"><img src="${doctor.avatar}" class="w-10 h-10 rounded-full object-cover"/></td>
                  <td class="py-2 px-4">${doctor.prenom}</td>
                  <td class="py-2 px-4">${doctor.nom}</td>
                  <td class="py-2 px-4">${doctor.email}</td>
                  <td class="py-2 px-4">${doctor.specialite}</td>
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
    }
  } catch (error) {
    console.error("Erreur lors du chargement des docteurs :", error);
    alert("Une erreur s'est produite lors du chargement des docteurs.");
  }
}

async function loadModal() {
  try {
    const response = await fetch(
      "/frontend/src/components/modals/docteurs/docteur_modal.html"
    );
    if (!response.ok) {
      throw new Error("Erreur lors du chargement de la modale");
    }

    const modalHTML = await response.text();
    const modalContainer = document.getElementById("modalContainer");
    modalContainer.innerHTML = modalHTML;
    const openModalButton = document.getElementById("openAddDocteurModal");
    const cancelAddDocteurButton = document.getElementById("cancelAddDocteur");
    openModalButton.addEventListener("click", openAddDocteurModal);
    cancelAddDocteurButton.addEventListener("click", closeAddDocteurModal);
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
      loadDoctorsTable(document.getElementById("searchInput").value);
    }
  });

  nextButton.addEventListener("click", () => {
    const { totalPages } = paginate(doctors, itemsPerPage, currentPage);
    if (currentPage < totalPages) {
      currentPage++;
      loadDoctorsTable(document.getElementById("searchInput").value);
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

function filterDocteurs(docteurs, searchQuery) {
  if (!searchQuery) return docteurs;
  return docteurs.filter((docteur) => {
    return (
      docteur.prenom.toLowerCase().includes(searchQuery) ||
      docteur.nom.toLowerCase().includes(searchQuery)
    );
  });
}

function setupSearchInput() {
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", (event) => {
    const searchQuery = event.target.value.toLowerCase();
    currentPage = 1;
    loadDoctorsTable(searchQuery);
  });
}
