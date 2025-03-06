import { getAppointments } from "../../../services/appointmentService.js";
import { getDoctors } from "../../../services/doctorService.js";
import { getPatients } from "../../../services/patientService.js";
import { getCurrentUser } from "../../../store/auth.js";
import { handleNotifications } from "../../../store/notification.js";

document.addEventListener("DOMContentLoaded", async () => {
  handleNotifications();
  displaySecretaireInfo();
  await loadDashboardData();
  const sidebarDeviceButton = document.getElementById("sidebar-device");
  const sidebarClose = document.getElementById("sidebar-close");
  sidebarDeviceButton.addEventListener("click", openSidebar);
  sidebarClose.addEventListener("click", closeSidebar);
});

export async function loadDashboardData() {
  const patients = await getPatients();
  const doctors = await getDoctors();
  const appointments = await getAppointments();

  document.getElementById("totalPatients").textContent = patients.length;
  document.getElementById("totalDoctors").textContent = doctors.length;
  document.getElementById("totalAppointments").textContent =
    appointments.length;
}

function displaySecretaireInfo() {
  const user = getCurrentUser();
  if (user.role === "secretaire") {
    const profilePhoto = document.getElementById("profilePhoto");
    const profileName = document.getElementById("profileName");
    const profileEmail = document.getElementById("profileEmail");
    const profileTitle = document.getElementById("profileTitle");

    profilePhoto.src = user.avatar;
    profileName.textContent = user.prenom;
    profileEmail.textContent = user.email;
    profileTitle.textContent = `Bienvenue ${user.prenom} ${user.nom} 👋`;
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
