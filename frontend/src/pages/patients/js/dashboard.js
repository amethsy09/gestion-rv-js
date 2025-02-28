import { getRendezVousStatsByPatientId } from "../../../services/patientService.js";
import { getCurrentUser } from "../../../store/auth.js";
import { handleNotifications } from "../../../store/notification.js";

document.addEventListener("DOMContentLoaded",async()=>{
    handleNotifications();
    const user= getCurrentUser();
    displayInfoPatient(user);
   await displayCardInfo();
})
function displayInfoPatient(user){
    const profilPatient= document.getElementById("profilPatient");
    const nomPatient= document.getElementById("nomPatient");
    const rolePatient=document.getElementById("rolePatient");
    const emailPatient= document.getElementById("emailPatient");
    const adressePatient= document.getElementById("adressePatient");
    const numPatient= document.getElementById("numPatient");
    profilPatient.src= user.avatar;
    nomPatient.textContent= `${user.nom} ${user.prenom}`;
    rolePatient.textContent= user.role;
    emailPatient.textContent= user.email;
    adressePatient.textContent= user.adresse;
    numPatient.textContent= user.telephone;  
};
async function displayCardInfo() {
    const user = getCurrentUser();
    const { accepted, rejected, pending } = await getRendezVousStatsByPatientId(
      user.id
    );
  
    document.getElementById("valideAppointments").textContent = accepted;
    document.getElementById("deleteAppointments").textContent = rejected;
    document.getElementById("pendingAppointments").textContent = pending;
  }