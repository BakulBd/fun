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
 * Easter-egg predictions for the creator.
 * Keyed by lowercase name → { en, bn }
 */
const SPECIAL_PREDICTIONS: Record<string, { en: string; bn: string }> = {
  bakul: {
    en: "{name} after marriage will be the luckiest person alive because the best partner in the world chose them",
    bn: "{name} বিয়ের পর পৃথিবীর সবচেয়ে ভাগ্যবান মানুষ হবে কারণ সেরা সঙ্গী তাকে বেছে নেবে",
  },
};

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
  const prettyName = displayName(name);

  // Check for special easter-egg names first
  const special = SPECIAL_PREDICTIONS[name.toLowerCase().trim()];
  if (special) {
    const template = language === "bn" ? special.bn : special.en;
    const prediction = template.replace(/\{name\}/g, prettyName);
    return { prediction, language, gender, name: prettyName };
  }

  // Pick the right prediction set based on language + gender
  let predictions: string[];
  if (language === "bn") {
    predictions = gender === "female" ? predictionsBnFemale : predictionsBn;
  } else {
    predictions = gender === "female" ? predictionsEnFemale : predictionsEn;
  }

  const index = getIndexFromName(name, predictions.length);
  const template = predictions[index];
  const prediction = template.replace(/\{name\}/g, prettyName);

  return { prediction, language, gender, name: prettyName };
}
