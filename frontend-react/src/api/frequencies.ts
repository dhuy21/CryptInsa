import { apiUrl } from "./client";
import type { FrequencyTable } from "../substitutionAnalyse";

export async function frenchFrequencies(): Promise<FrequencyTable> {
  const response = await fetch(`${apiUrl()}/french-frequencies`);
  if (!response.ok) {
    throw new Error("Impossible de lire les fréquences françaises");
  }
  return response.json() as Promise<FrequencyTable>;
}
