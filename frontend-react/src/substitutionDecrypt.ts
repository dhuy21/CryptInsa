import type { AttackStep } from "./api/attack";

export const DECRYPT_ALPHABET = "abcdefghijklmnopqrstuvwxyz ,.".split("");

export type ComparedChar = {
  char: string;
  isCorrect: boolean;
  isMissing: boolean;
  isExtra: boolean;
};

export function attackIsFinal(steps: AttackStep[]): boolean {
  return steps.length > 0 && steps[steps.length - 1].mot_chiffre === "final";
}

export function decryptText(text: string, mapping: Record<string, string | null | undefined>): string {
  return text.split("").map((char) => {
    const lowerChar = char.toLowerCase();
    const mapped = mapping[lowerChar];
    if (mapped) {
      return char === char.toUpperCase() ? mapped.toUpperCase() : mapped;
    }
    return char;
  }).join("");
}

export function compareTexts(decryptedText: string, originalPlainText: string): ComparedChar[] {
  const decrypted = decryptedText.toLowerCase();
  const original = originalPlainText.toLowerCase();
  const maxLength = Math.max(decrypted.length, original.length);
  const compared: ComparedChar[] = [];
  for (let index = 0; index < maxLength; index += 1) {
    const decryptedChar = decrypted[index] || "";
    const originalChar = original[index] || "";
    compared.push({
      char: decryptedText[index] || "",
      isCorrect: decryptedChar === originalChar,
      isMissing: index >= decrypted.length,
      isExtra: index >= original.length,
    });
  }
  return compared;
}

export function displayedText(chars: ComparedChar[]): string {
  return chars.map((item) => (item.isMissing && !item.isCorrect ? "_" : item.char)).join("");
}

export function readStoredPlain(): string {
  let plain = "";
  const raw = localStorage.getItem("attackData");
  if (raw) {
    try {
      const data = JSON.parse(raw) as { plainText?: unknown };
      if (typeof data.plainText === "string") {
        plain = data.plainText;
      }
    } catch {
      plain = "";
    }
  }
  const stored = localStorage.getItem("plaintext");
  if (stored) {
    plain = stored;
  }
  return plain;
}
