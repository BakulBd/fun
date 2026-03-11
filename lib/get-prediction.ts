import { predictionsEn } from "./predictions-en";
import { predictionsBn } from "./predictions-bn";
import { getIndexFromName } from "./hash";
import { detectLanguage, type Language } from "./language-detect";
import { displayName } from "./sanitize";

export interface PredictionResult {
  prediction: string;
  language: Language;
  name: string;
}

/**
 * Get a deterministic prediction for a given name.
 * Uses the raw name for hashing (consistency) but the display name in the output text.
 */
export function getPrediction(
  name: string,
  langParam?: string | null
): PredictionResult {
  const language = detectLanguage(name, langParam);
  const predictions = language === "bn" ? predictionsBn : predictionsEn;
  const index = getIndexFromName(name, predictions.length);
  const template = predictions[index];
  const prettyName = displayName(name);
  const prediction = template.replace(/\{name\}/g, prettyName);

  return { prediction, language, name: prettyName };
}
