export function apiUrl(): string {
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    return "http://localhost:5000";
  }
  return `${window.location.origin}/api`;
}
