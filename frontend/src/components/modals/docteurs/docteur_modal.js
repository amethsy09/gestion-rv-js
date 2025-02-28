import { fetchData } from "../../../services/api.js";
import { addDocteur } from "../../../services/doctorService.js";


export function openAddDocteurModal() {
  const modal = document.getElementById("addDocteurModal");
  modal.classList.remove("hidden");
}

export function closeAddDocteurModal() {
  const modal = document.getElementById("addDocteurModal");
  modal.classList.add("hidden");
}

function checkValidateFormAddDocteur(docteurData) {
  const nomDocteurError = document.getElementById("nomDocteurError");
  const prenomDocteurError = document.getElementById("docteurPrenomError");
  const specialiteDocteurError = document.getElementById(
    "docteurSpecialiteError"
  );
  const telephoneDocteurError = document.getElementById(
    "docteurTelephoneError"
  );
  const emailDocteurError = document.getElementById("docteurEmailError");
  const passwordDocteurError = document.getElementById("docteurPaswordError");
  const avatarDocteurError = document.getElementById("docteurAvatarError");

  nomDocteurError.textContent = "";
  prenomDocteurError.textContent = "";
  specialiteDocteurError.textContent = "";
  telephoneDocteurError.textContent = "";
  emailDocteurError.textContent = "";
  passwordDocteurError.textContent = "";
  avatarDocteurError.textContent = "";
  let isValid = true;

  const { nom, prenom, telephone, email, password, specialite, avatar } =
    docteurData;

  if (!nom) {
    nomDocteurError.textContent = "Veuillez saisir un nom";
    nomDocteurError.classList.add("text-red-500");
    isValid = false;
  }
  if (!prenom) {
    prenomDocteurError.textContent = "Veuillez saisir un prénom";
    prenomDocteurError.classList.add("text-red-500");
    isValid = false;
  }
  if (!telephone) {
    telephoneDocteurError.textContent =
      "Veuillez saisir un numéro de téléphone";
    telephoneDocteurError.classList.add("text-red-500");
    isValid = false;
  }
  if (!email) {
    emailDocteurError.textContent = "Veuillez saisir un email";
    emailDocteurError.classList.add("text-red-500");
    isValid = false;
  }
  if (!password) {
    passwordDocteurError.textContent = "Veuillez saisir un mot de passe";
    passwordDocteurError.classList.add("text-red-500");
    isValid = false;
  }
  if (!specialite) {
    specialiteDocteurError.textContent = "Veuillez saisir une specialite";
    specialiteDocteurError.classList.add("text-red-500");
    isValid = false;
  }
  if (!avatar) {
    avatarDocteurError.textContent = "Veuillez choisir un avatar";
    avatarDocteurError.classList.add("text-red-500");
    isValid = false;
  }
  return isValid;
}

export async function handleAddDocteurFormSubmit() {
  const form = document.getElementById("addDocteurForm");
  const formData = new FormData(form);
  const docteurData = {
    id: await generateId(),
    nom: formData.get("nom"),
    prenom: formData.get("prenom"),
    telephone: formData.get("telephone"),
    email: formData.get("email"),
    password: formData.get("password"),
    specialite: formData.get("specialite"),
    avatar: formData.get("avatar"),
    id_role: 2,
  };
  if (!checkValidateFormAddDocteur(docteurData)) {
    return;
  }
  try {
    const newDocteur = await addDocteur(docteurData);
    console.log(newDocteur);
    closeAddDocteurModal();
    form.reset();
  } catch (error) {
    console.error("Erreur :", error);
  }
}

async function generateId() {
  const docteurs = await fetchData("docteurs");
  const id =
    docteurs.length > 0 ? parseInt(docteurs[docteurs.length - 1].id) + 1 : 1;
  return id;
}
