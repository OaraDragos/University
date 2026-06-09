const configuredApiBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL;
const browserHost =
  typeof window !== "undefined" && window.location.hostname
    ? window.location.hostname
    : "localhost";
const browserProtocol =
  typeof window !== "undefined" && window.location.protocol === "https:"
    ? "https"
    : "http";

export const API_BASE_URL = configuredApiBaseUrl || `${browserProtocol}://${browserHost}:4000`;

export const API_URLS = {
  health: `${API_BASE_URL}/api/health`,
  auth: `${API_BASE_URL}/api/auth`,
  chat: `${API_BASE_URL}/api/chat`,
  groups: `${API_BASE_URL}/api/groups`,
  generator: `${API_BASE_URL}/api/generator`,
  graphql: `${API_BASE_URL}/graphql`,
  ws: `${API_BASE_URL.replace(/^http/, "ws")}/ws`,
};
