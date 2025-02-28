const API_BASE_URL = "http://localhost:3000";

export async function fetchData(endpoint, id = "") {
  const url = id
    ? `${API_BASE_URL}/${endpoint}/${id}`
    : `${API_BASE_URL}/${endpoint}`;
  const response = await fetch(url);
  return response.json();
}
