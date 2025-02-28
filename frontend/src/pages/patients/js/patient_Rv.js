import { getRendezVousAndDocteurInfoByDocteur } from "../../../services/patientService.js";
import { getCurrentUser } from "../../../store/auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  const user = getCurrentUser();
  const rendezVous = await getRendezVousAndDocteurInfoByDocteur(user.id);
//   console.log(rendezVous); 
  
  displayPatientAppointments(rendezVous);
  const sidebarDeviceButton = document.getElementById("sidebar-device");
  const sidebarClose = document.getElementById("sidebar-close");
  sidebarDeviceButton.addEventListener("click", openSidebar);
  sidebarClose.addEventListener("click", closeSidebar);
});

function createAppointmentRow(rdv) {
  const row = document.createElement("tr");
  row.className = "border-b";
  const statusColor =
    {
      "En attente": "bg-orange-50 text-orange-500",
      Accepté: "bg-green-50 text-green-500",
      Annulé: "bg-red-50 text-red-500",
    }
    [rdv.status] || "bg-gray-50";

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

function displayPatientAppointments(rendezVous) {
  const tbody = document.getElementById("rendezVousTableBody");
  tbody.innerHTML = "";

  rendezVous.forEach((rdv) => {
    const row = createAppointmentRow(rdv);

    tbody.appendChild(row);
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
