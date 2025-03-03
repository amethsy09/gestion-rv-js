import { fetchData } from "../../../services/api.js";
import { addPatient } from "../../../services/patientService.js";

export function openAddPatientModal() {
  const modal = document.getElementById("addPatientModal");
  modal.classList.remove("hidden");
}

export function closeAddPatientModal() {
  const modal = document.getElementById("addPatientModal");
  modal.classList.add("hidden");
}

function checkValidateFormAddPatient(patientData) {
  const nomPatientError = document.getElementById("nomPatientError");
  const prenomPatientError = document.getElementById("patientPrenomError");
  const adressePatientError = document.getElementById("patientAdresseError");
  const telephonePatientError = document.getElementById(
    "patientTelephoneError"
  );
  const emailPatientError = document.getElementById("patientEmailError");
  const passwordPatientError = document.getElementById("patientPaswordError");
  const avatarPatientError = document.getElementById("patientAvatarError");

  nomPatientError.textContent = "";
  prenomPatientError.textContent = "";
  adressePatientError.textContent = "";
  telephonePatientError.textContent = "";
  emailPatientError.textContent = "";
  passwordPatientError.textContent = "";
  avatarPatientError.textContent = "";
  let isValid = true;

  const { nom, prenom, telephone, email, password, adresse, avatar } =
    patientData;

  if (!nom) {
    nomPatientError.textContent = "Veuillez saisir un nom";
    nomPatientError.classList.add("text-red-500");
    isValid = false;
  }
  if (!prenom) {
    prenomPatientError.textContent = "Veuillez saisir un prénom";
    prenomPatientError.classList.add("text-red-500");
    isValid = false;
  }
  if (!telephone) {
    telephonePatientError.textContent =
      "Veuillez saisir un numéro de téléphone";
    telephonePatientError.classList.add("text-red-500");
    isValid = false;
  }
  if (!email) {
    emailPatientError.textContent = "Veuillez saisir un email";
    emailPatientError.classList.add("text-red-500");
    isValid = false;
  }
  if (!password) {
    passwordPatientError.textContent = "Veuillez saisir un mot de passe";
    passwordPatientError.classList.add("text-red-500");
    isValid = false;
  }
  if (!adresse) {
    adressePatientError.textContent = "Veuillez saisir une adresse";
    adressePatientError.classList.add("text-red-500");
    isValid = false;
  }
  if (!avatar) {
    avatarPatientError.textContent = "Veuillez choisir un avatar";
    avatarPatientError.classList.add("text-red-500");
    isValid = false;
  }
  return isValid;
}

export async function handleAddPatientFormSubmit() {
  const form = document.getElementById("addPatientForm");
  const formData = new FormData(form);
  const patientData = {
    id: await generateId(),
    nom: formData.get("nom"),
    prenom: formData.get("prenom"),
    telephone: formData.get("telephone"),
    email: formData.get("email"),
    password: formData.get("password"),
    adresse: formData.get("adresse"),
    avatar: formData.get("avatar"),
    id_role: 3,
  };
  if (!checkValidateFormAddPatient(patientData)) {
    return;
  }
  try {
    const newPatient = await addPatient(patientData);
    console.log(newPatient);
    closeAddPatientModal();
    form.reset();
    return newPatient;
  } catch (error) {
    console.error("Erreur :", error);
  }
}

async function generateId() {
  const patients = await fetchData("patients");
  const id =
    patients.length > 0 ? parseInt(patients[patients.length - 1].id) + 1 : 1;
  return id;
}
