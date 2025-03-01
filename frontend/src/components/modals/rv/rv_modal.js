import { fetchData } from "../../../services/api.js";
import { addAppointment } from "../../../services/appointmentService.js";
import { getDoctors } from "../../../services/doctorService.js";
import { getPatients } from "../../../services/patientService.js";

export function openAddRvModal() {
  const modal = document.getElementById("addRvModal");
  modal.classList.remove("hidden");
}

export function closeAddRvModal() {
  const modal = document.getElementById("addRvModal");
  modal.classList.add("hidden");
}

function checkValidateFormAddRv(rvData) {
  const appointmentDateError = document.getElementById("appointmentDateError");
  const appointmentTimeError = document.getElementById("appointmentTimeError");
  const appointmentDoctorError = document.getElementById(
    "appointmentDoctorError"
  );
  const appointmentPatientError = document.getElementById(
    "appointmentPatientError"
  );
  const appointmentSpecialiteError = document.getElementById(
    "appointmentSpecialiteError"
  );

  appointmentDateError.textContent = "";
  appointmentTimeError.textContent = "";
  appointmentDoctorError.textContent = "";
  appointmentPatientError.textContent = "";
  appointmentSpecialiteError.textContent = "";
  let isValid = true;

  const { date, heure, id_docteur, id_patient, specialite } = rvData;

  if (!date) {
    appointmentDateError.textContent = "Veuillez saisir une date";
    appointmentDateError.classList.add("text-red-500");
    isValid = false;
  }
  if (!heure) {
    appointmentTimeError.textContent = "Veuillez saisir un heure";
    appointmentTimeError.classList.add("text-red-500");
    isValid = false;
  }
  if (!id_docteur) {
    appointmentDoctorError.textContent = "Veuillez selectionnez un docteur";
    appointmentDoctorError.classList.add("text-red-500");
    isValid = false;
  }
  if (!id_patient) {
    appointmentPatientError.textContent = "Veuillez selectionnez un patient";
    appointmentPatientError.classList.add("text-red-500");
    isValid = false;
  }
  if (!specialite) {
    appointmentSpecialiteError.textContent = "Veuillez saisir une specialite";
    appointmentSpecialiteError.classList.add("text-red-500");
    isValid = false;
  }
  return isValid;
}

export async function handleAddRvFormSubmit() {
  const form = document.getElementById("addRvForm");
  const formData = new FormData(form);
  const rvData = {
    id: await generateId(),
    date: formData.get("date"),
    heure: formData.get("heure"),
    id_docteur: parseInt(formData.get("id_docteur")),
    id_patient: parseInt(formData.get("id_patient")),
    id_secretaire: 1,
    status: "en attente",
    specialite: formData.get("specialite"),
  };
  if (!checkValidateFormAddRv(rvData)) {
    return;
  }
  try {
    const newRv = await addAppointment(rvData);
    console.log(newRv);
    closeAddRvModal();
    form.reset();
  } catch (error) {
    console.error("Erreur :", error);
  }
}

async function generateId() {
  const rv = await fetchData("rendez-vous");
  const id = rv.length > 0 ? parseInt(rv[rv.length - 1].id) + 1 : 1;
  return id;
}

export async function loadDoctorsAndPatients() {
  try {
    const doctors = await getDoctors();
    const patients = await getPatients();

    const doctorSelect = document.getElementById("appointmentDoctor");
    const patientSelect = document.getElementById("appointmentPatient");

    doctors.forEach((doctor) => {
      const option = document.createElement("option");
      option.value = doctor.id;
      option.textContent = `${doctor.nom} ${doctor.prenom}`;
      doctorSelect.appendChild(option);
    });

    patients.forEach((patient) => {
      const option = document.createElement("option");
      option.value = patient.id;
      option.textContent = `${patient.nom} ${patient.prenom}`;
      patientSelect.appendChild(option);
    });
  } catch (error) {
    console.error(
      "Erreur lors du chargement des docteurs ou des patients :",
      error
    );
    alert(
      "Une erreur s'est produite lors du chargement des docteurs ou des patients."
    );
  }
}
