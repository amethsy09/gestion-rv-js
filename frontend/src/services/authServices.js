import { fetchData } from "./api.js";

export async function login(email, password) {
  let user = null;
  let role = null;

  const types = ["secretaire", "docteurs", "patients"];

  for (const type of types) {
    const users = await fetchData(type);
    user = users.find((u) => u.email === email && u.password === password);
    if (user) {
      role = await fetchUserRole(user.id_role);
      break;
    }
  }

  if (!user || !role) {
    throw new Error("Identifiants incorrects");
  }

  return { ...user, role };
}

async function fetchUserRole(id_role) {
  const role = await fetchData("role", id_role);
  return role ? role.libelle : null;
}
