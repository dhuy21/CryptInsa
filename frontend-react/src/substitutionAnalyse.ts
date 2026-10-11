export const ANALYSIS_ALPHABET = "abcdefghijklmnopqrstuvwxyz ,.";

export type FrequencyTable = Record<string, number>;

export type RankedLetter = {
  letter: string;
  frequency: number;
};

export function cleanForAnalysis(text: string): string {
  return text.toLowerCase().replace(/[^a-z ,.]/g, "");
}

export function calculateFrequencies(text: string): FrequencyTable {
  const frequencies: FrequencyTable = {};
  for (const letter of ANALYSIS_ALPHABET) {
    frequencies[letter] = 0;
  }
  for (const char of text) {
    if (Object.prototype.hasOwnProperty.call(frequencies, char)) {
      frequencies[char] += 1;
    }
  }
  if (text.length === 0) {
    return frequencies;
  }
  for (const letter of ANALYSIS_ALPHABET) {
    frequencies[letter] = (frequencies[letter] / text.length) * 100;
  }
  return frequencies;
}

export function rankedLetters(frequencies: FrequencyTable, limit: number, dropZero: boolean): RankedLetter[] {
  return Object.entries(frequencies)
    .filter(([, frequency]) => !dropZero || frequency > 0)
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([letter, frequency]) => ({ letter, frequency }));
}

export function matchConfidence(cipherFrequency: number, frenchFrequency: number): number {
  const difference = Math.abs(cipherFrequency - frenchFrequency);
  const maxFrequency = Math.max(cipherFrequency, frenchFrequency);
  const similarity = Math.max(0, 100 - (difference / maxFrequency) * 100);
  return Math.round(similarity);
}

export function readStoredCipher(): string {
  const direct = localStorage.getItem("cipherText");
  if (direct) {
    return direct;
  }
  const raw = localStorage.getItem("attackData");
  if (!raw) {
    return "";
  }
  try {
    const data = JSON.parse(raw) as { cipherText?: unknown };
    return typeof data.cipherText === "string" ? data.cipherText : "";
  } catch {
    return "";
  }
}
