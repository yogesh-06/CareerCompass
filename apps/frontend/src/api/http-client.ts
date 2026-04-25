import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api/v1";

export const httpClient = axios.create({
  baseURL,
});

export function setAccessToken(accessToken: string | null) {
  if (accessToken) {
    httpClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    localStorage.setItem("careercompass_access_token", accessToken);
    return;
  }
  delete httpClient.defaults.headers.common.Authorization;
  localStorage.removeItem("careercompass_access_token");
}

export function restoreAccessToken() {
  const token = localStorage.getItem("careercompass_access_token");
  if (token) {
    setAccessToken(token);
  }
}
