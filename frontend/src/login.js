import { login } from "./services/authServices.js";
import { setCurrentUser } from "./store/auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#loginForm");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    let isValid = true;

    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    const errorEmail = document.getElementById("errorEmail");
    const errorPassword = document.getElementById("errorPassword");

    errorEmail.textContent = "";
    errorPassword.textContent = "";

    if (!email) {
      errorEmail.textContent = "l'email est requise";
      errorEmail.classList.add("text-red-500");
      isValid = false;
    }
    if (!password) {
      errorPassword.textContent = "le mot de passe est requis";
      errorPassword.classList.add("text-red-500");
      isValid = false;
    }
    if (!isValid) {
      return;
    }

    try {
      const user = await login(email, password);
      setCurrentUser(user);
      redirectUser(user.role);
    } catch (error) {
        console.log(error.message);
        
    }
  });
});

function redirectUser(role) {
  switch (role) {
    case "secretaire":
      window.location.href = "/frontend/src/pages/secretaire/dashboard.html";
      break;
    case "docteurs":
      window.location.href = "/frontend/src/pages/doctors/dashboard.html";
      break;
    case "patients":
      window.location.href = "/frontend/src/pages/patients/dashboard.html";
      break;
    default:
      window.location.href = "/frontend/public/index.html";
  }
}
