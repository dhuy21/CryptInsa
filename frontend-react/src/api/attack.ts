import { apiUrl } from "./client";

export type StartedAttack = {
  message: string;
  attackId: string;
};

export type AttackStep = {
  mot_chiffre: string;
  mot_traduit: string | null;
  dictionnaire: Record<string, string | null>;
};

export function readStoredAttackId(): string {
  const raw = localStorage.getItem("attackData");
  if (!raw) {
    return "";
  }
  try {
    const data = JSON.parse(raw) as { attackId?: unknown; cipherText?: unknown };
    if (!data || typeof data.attackId !== "string" || !data.attackId) {
      return "";
    }
    const cipherText = localStorage.getItem("cipherText") || "";
    if (typeof data.cipherText === "string" && data.cipherText && cipherText && data.cipherText !== cipherText) {
      return "";
    }
    return data.attackId;
  } catch {
    return "";
  }
}

export async function updateAttack(attackId: string): Promise<AttackStep[]> {
  const response = await fetch(`${apiUrl()}/update_attack`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ attackId }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(data)) {
    throw new Error("Attaque introuvable");
  }
  return data as AttackStep[];
}

export async function startAttack(cipherText: string): Promise<StartedAttack> {
  const response = await fetch(`${apiUrl()}/start_attack`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cipherText }),
  });
  const data = await response.json().catch(() => ({})) as { error?: string; attackId?: string; message?: string };
  if (!response.ok || data.error || !data.attackId) {
    throw new Error(data.error || "Impossible de lancer l'attaque");
  }
  return { message: data.message ?? "", attackId: data.attackId };
}
