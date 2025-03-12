import { showNotification } from "../../../components/notifications/notification.js";
import { getDocteurNotifications } from "../../../services/doctorService.js";
import { markNotificationAsRead } from "../../../services/notificationService.js";
import { getCurrentUser } from "../../../store/auth.js";

let notifications = [];

document.addEventListener("DOMContentLoaded", async () => {
  const user = getCurrentUser();
  displayDocteurInfo(user);
  await handleNotificaionCount(user.id);
  displayNotifications(notifications);
  const sidebarDeviceButton = document.getElementById("sidebar-device");
  const sidebarClose = document.getElementById("sidebar-close");
  sidebarDeviceButton.addEventListener("click", openSidebar);
  sidebarClose.addEventListener("click", closeSidebar);
});

function displayDocteurInfo(user) {
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

function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.add("-translate-x-full");
}

function displayNotifications(notifications) {
  const notificationsList = document.getElementById("notificationsList");
  notificationsList.innerHTML = "";
  if (notifications.length === 0) {
    notificationsList.innerHTML = `
      <div class="flex flex-col gap-3 items-center justify-center">
        <img src="/frontend/public/assets/nothing.png" class="h-48 object-cover" />
        <p class="text-gray-500">Aucune notification pour le moment.</p>
      </div>
    `;
    return;
  }
  notifications.forEach((notification) => {
    const notificationCard = document.createElement("div");
    notificationCard.className = "p-5 bg-white rounded shadow-md";
    notificationCard.innerHTML = `
      <div class="flex flex-col md:flex-row justify-between items-center">
      <div>
        <input type="checkbox" class="notification-checkbox" data-id="${
          notification.id
        }">
        
        <span class="flex-1 ml-2 text-sm font-medium md:text-md">${
          notification.message
        }</span>
        <span class="text-sm text-blue-500 bg-blue-50 p-1 rounded">${new Date(
          notification.createdAt
        ).toLocaleString()}</span>
        </div>
        <button class="archive-button px-3 py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded hidden" data-id="${
          notification.id
        }">
      <i class="ri-archive-line"></i>
      Archiver</button>
      </div>
    `;
    const checkbox = notificationCard.querySelector(".notification-checkbox");
    const archiveButton = notificationCard.querySelector(".archive-button");

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        archiveButton.classList.remove("hidden");
      } else {
        archiveButton.classList.add("hidden");
      }
    });
    archiveButton.addEventListener("click", async () => {
      await markNotificationAsRead(notification.id, "docteurs");
      showNotification("La notification a été archivée avec succès");
      notificationsList.removeChild(notificationCard);
    });
    notificationsList.appendChild(notificationCard);
  });
}

async function handleNotificaionCount(id) {
  notifications = await getDocteurNotifications(id);
  notifications = notifications.filter(
    (notification) => notification.isReadDocteur == false
  );
  const showNotif = document.getElementById("notifLength");
  showNotif.textContent = notifications.length || 0;
}
