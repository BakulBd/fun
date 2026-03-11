import { predictionsEn } from "./predictions-en";
import { predictionsBn } from "./predictions-bn";
import { predictionsEnFemale } from "./predictions-en-female";
import { predictionsBnFemale } from "./predictions-bn-female";
import { getIndexFromName } from "./hash";
import { detectLanguage, type Language } from "./language-detect";
import { detectGender, type Gender } from "./gender-detect";
import { displayName } from "./sanitize";

export interface PredictionResult {
  prediction: string;
  language: Language;
  gender: Gender;
  name: string;
}

/**
 * Get a deterministic prediction for a given name.
 * Uses the raw name for hashing (consistency) but the display name in the output text.
 * Selects gender-appropriate predictions (wife jokes for males, husband jokes for females).
 */
export function getPrediction(
  name: string,
  langParam?: string | null,
  geoLang?: string | null
): PredictionResult {
  const language = detectLanguage(name, langParam, geoLang);
  const gender = detectGender(name);

  // Pick the right prediction set based on language + gender
  let predictions: string[];
  if (language === "bn") {
    predictions = gender === "female" ? predictionsBnFemale : predictionsBn;
  } else {
    predictions = gender === "female" ? predictionsEnFemale : predictionsEn;
  }

  const index = getIndexFromName(name, predictions.length);
  const template = predictions[index];
  const prettyName = displayName(name);
  const prediction = template.replace(/\{name\}/g, prettyName);

  return { prediction, language, gender, name: prettyName };
}
