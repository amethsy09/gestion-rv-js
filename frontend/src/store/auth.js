export function setCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

export function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

export function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "/frontend/public/index.html";
}
