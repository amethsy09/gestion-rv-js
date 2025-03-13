import { createModal } from "../../../components/modals/confirmation/modal_conf.js";
import {
  closeAddDocteurModal,
  handleAddDocteurFormSubmit,
  handleUpdateDoctor,
  openAddDocteurModal,
} from "../../../components/modals/docteurs/docteur_modal.js";
import { deleteDocteur, getDoctors } from "../../../services/doctorService.js";
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
  form.setAttribute("data-action", "add");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const action = form.getAttribute("data-action");
    if (action === "add") {
      console.log("bon");
      console.log(action);
      const newDocteur = await handleAddDocteurFormSubmit();
      const checkModal = document.getElementById("checkModal");
      if (newDocteur) {
        const modal = createModal(
          "verifier.png",
          `Dr ${newDocteur.prenom} ${newDocteur.nom} ajouté avec succès`,
          "blue"
        );
        checkModal.appendChild(modal);
      }
    } else if (action === "edit") {
      const doctorId = form.getAttribute("data-doctor-id");
      const updatedDoctor = await handleUpdateDoctor(doctorId);
      if (updatedDoctor) {
        closeAddDocteurModal();
        loadDoctorsTable();
      }
    }
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
                      <button data-id="${doctor.id}" class="bg-gray-100 py-1 px-3 rounded-md hover:bg-gray-200 edit-button">
                      <span>Modifier</span>
                      <i class="ri-edit-box-line"></i>
                      </button>
                      <button data-id="${doctor.id}" class="bg-gray-100 py-1 px-3 rounded-md hover:bg-gray-200 delete-button">
                      <span>Supprimer</span>
                      <i class="ri-delete-bin-6-line"></i>
                      </button>
                  </td>
              `;
      tableBody.appendChild(row);
    });
    document.querySelectorAll(".edit-button").forEach((button) => {
      button.addEventListener("click", async (e) => {
        const doctorId = e.target.closest("button").dataset.id;
        await handleEditDoctor(doctorId);
      });
    });
    document.querySelectorAll(".delete-button").forEach((button) => {
      button.addEventListener("click", async (e) => {
        const doctorId = e.target.closest("button").dataset.id;
        await handleDeleteDoctor(doctorId);
      });
    });
    updatePaginationControls(currentPage, totalPages);
  } catch (error) {
    console.error("Erreur lors du chargement des docteurs :", error);
    alert("Une erreur s'est produite lors du chargement des docteurs.");
  }
}

async function handleEditDoctor(doctorId) {
  const doctor = doctors.find((d) => d.id == doctorId);
  if (!doctor) return;

  document.getElementById("docteurNom").value = doctor.nom;
  document.getElementById("docteurPrenom").value = doctor.prenom;
  document.getElementById("docteurEmail").value = doctor.email;
  document.getElementById("docteurTelephone").value = doctor.telephone;
  document.getElementById("docteurSpecialite").value = doctor.specialite;
  document.getElementById("docteurAvatar").value = doctor.avatar;
  document.getElementById("docteurPassword").value = doctor.password;

  openAddDocteurModal();

  const submitButton = document.querySelector(
    "#addDocteurForm button[type='submit']"
  );
  submitButton.textContent = "Modifier";
  submitButton.innerHTML = `Modifier <i class="ri-edit-box-line"></i>`;

  const form = document.getElementById("addDocteurForm");
  form.setAttribute("data-action", "edit");
  form.setAttribute("data-doctor-id", doctorId);
}

async function handleDeleteDoctor(doctorId) {
  const modal = createModal(
    "warning.png",
    "Êtes-vous sûr de vouloir supprimer ce medcin ?"
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
      const success = await deleteDocteur(doctorId);
      if (success) {
        await loadDoctorsTable();
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
