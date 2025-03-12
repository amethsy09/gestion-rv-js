import { getCurrentUser } from "../../../store/auth.js";

document.addEventListener("DOMContentLoaded", () => {
  displaySecretaireInfo();
  const user = getCurrentUser();
  displayProfileInfo(user);
});

function displayProfileInfo(user) {
  const username = document.getElementById("username");
  const email = document.getElementById("email");
  const profileBannerPhoto = document.getElementById("profileBannerPhoto");
  username.textContent = `Bonjour ${user.prenom} ${user.nom} bienvenue dans votre page  de profil👋`;
  email.textContent = user.email;
  profileBannerPhoto.src = user.avatar;
}

function displaySecretaireInfo() {
  const user = getCurrentUser();
  const profilePhoto = document.getElementById("profilePhoto");
  const profileName = document.getElementById("profileName");
  const profileEmail = document.getElementById("profileEmail");
  const profileTitle = document.getElementById("profileTitle");

  profilePhoto.src = user.avatar;
  profileName.textContent = user.prenom;
  profileEmail.textContent = user.email;
  profileTitle.textContent = `Bienvenue ${user.prenom} ${user.nom} 👋`;
}
