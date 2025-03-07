import { getCurrentUser } from "../../../store/auth.js";

document.addEventListener("DOMContentLoaded",() =>{
    const user= getCurrentUser();
    displayProfileInfo(user);
});
function displayProfileInfo(user){
    const username= document.getElementById("username");
    const email= document.getElementById("email");
    const live= document.getElementById("live");
    const profileBannerPhoto= document.getElementById("profileBannerPhoto");
username.textContent = `Bonjour ${user.prenom} ${user.nom} bienvenue dans votre page  de profil👋`;
email.textContent = user.email;
profileBannerPhoto.src= user.avatar;
}