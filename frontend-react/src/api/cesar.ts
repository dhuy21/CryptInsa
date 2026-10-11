import { apiUrl } from "./client";

const API_PATH = {
  encrypt: "/cesar",
  decrypt: "/cesar/decrypt",
} as const;

export type CesarMode = keyof typeof API_PATH;

export function normalizeForCesar(text: string): string {
  return text
    .replace(/œ/g, "oe")
    .replace(/Œ/g, "OE")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z.,]/g, " ")
    .replace(/\s+/g, " ");
}

export async function cesar(message: string, shift: number, mode: CesarMode): Promise<string> {
  const response = await fetch(`${apiUrl()}${API_PATH[mode]}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, shift }),
  });
  if (!response.ok) {
    throw new Error("Erreur de chiffrement");
  }
  const data = await response.json() as { encrypted?: string; decrypted?: string };
  return mode === "encrypt" ? data.encrypted ?? "" : data.decrypted ?? "";
}
