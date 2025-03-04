import { fetchData } from "../../../services/api.js";
import { addAppointment } from "../../../services/appointmentService.js";
import { getDoctors } from "../../../services/doctorService.js";
import { getPatients } from "../../../services/patientService.js";
import { createModal } from "../confirmation/modal_conf.js";

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

  appointmentDateError.textContent = "";
  appointmentTimeError.textContent = "";
  appointmentDoctorError.textContent = "";
  appointmentPatientError.textContent = "";
  let isValid = true;

  const { date, heure, id_docteur, id_patient } = rvData;

  if (!date) {
    appointmentDateError.textContent = "Veuillez saisir une date";
    appointmentDateError.classList.add("text-red-500");
    isValid = false;
  } else if (new Date(date) < new Date()) {
    appointmentDateError.textContent =
      "La date ne peut pas être antérieure à aujourd'hui";
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
  return isValid;
}

async function checkExistingAppointment(date, id_patient) {
  const appointments = await fetchData("rendez-vous");
  return appointments.some(
    (appointment) =>
      appointment.date === date && appointment.id_patient == id_patient
  );
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
  };
  if (!checkValidateFormAddRv(rvData)) {
    return;
  }
  const existingAppointment = await checkExistingAppointment(
    rvData.date,
    rvData.id_patient
  );
  if (existingAppointment) {
    const rModal = document.getElementById("addRvModal");
    const modal = createModal(
      "erreur.png",
      `Un rendez-vous existe déjà pour ce patient à cette date.`,
      "red"
    );
    rModal.appendChild(modal);
    return;
  }
  try {
    const newRv = await addAppointment(rvData);
    console.log(newRv);
    closeAddRvModal();
    form.reset();
    return newRv;
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
