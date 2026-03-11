/**
 * Smart language detection based on multiple signals.
 */

export type Language = "en" | "bn";

// Bangla Unicode range: \u0980-\u09FF
const BANGLA_REGEX = /[\u0980-\u09FF]/;

/**
 * Common Bangladeshi / Bangla-origin names written in English.
 * If the name is one of these, the person is likely Bangladeshi → serve Bangla.
 */
const BANGLA_NAMES_EN = new Set([
  "rahim", "karim", "sumon", "rakib", "arif", "fahim", "sakib", "naim",
  "tanvir", "mehedi", "sohel", "rony", "bijoy", "polash", "masud", "jamal",
  "kabir", "hasan", "nabil", "rifat", "shamim", "shahid", "mamun", "babul",
  "bakul", "rubel", "ripon", "milon", "mithun", "manik", "shahin", "liton",
  "shanto", "robin", "shuvo", "sajib", "ashik", "touhid", "imran", "faruk",
  "omar", "habib", "tarik", "monir", "selim", "zahid", "emon", "rashed",
  "shafiq", "nasir", "firoz", "farhad", "belal", "alamin", "alamgir", "jahid",
  "rajon", "tuhin", "jewel", "babu", "dulal", "helal", "jony", "mokbul",
  "sobuj", "limon", "pappu", "jibon", "shimul", "bulbul", "billal", "koushik",
  "himel", "hasib", "tanim", "parvez", "rezaul", "nurul", "badrul", "ashraf",
  "mahfuz", "rasel", "jisan", "shopon", "tanjim", "sabbir", "fahad", "tasnim",
  "nusrat", "jannatul", "sharmin", "nadia", "tania", "ruma", "mitu", "laboni",
  "shorna", "lamia", "sadia", "farzana", "anika", "riya", "priya", "swarna",
  "mousum", "munni", "moni", "shathi", "shapla", "kakoli", "poly", "sonali",
  "ratna", "shamima", "salma", "fatema", "hasina", "rahima", "kulsum", "khadiza",
  "taslima", "rehana", "nasima", "dilara", "shireen", "popy", "moushumi",
]);

/**
 * Detect language from multiple signals — smart auto-detection.
 * Priority:
 * 1. Explicit lang query parameter (?lang=bn or ?lang=en)
 * 2. Bangla Unicode characters in the name
 * 3. Known Bangladeshi names written in English script
 * 4. Geo-detected language from cookie (set by middleware via IP/country)
 * 5. Default to English
 */
export function detectLanguage(
  name: string,
  langParam?: string | null,
  geoLang?: string | null
): Language {
  // 1. Explicit query parameter
  if (langParam === "bn") return "bn";
  if (langParam === "en") return "en";

  // 2. Check if name contains Bangla characters
  if (BANGLA_REGEX.test(name)) return "bn";

  // 3. Check if the name (in English) is a common Bangla/Bangladeshi name
  const normalized = name.trim().toLowerCase().split(/\s+/);
  if (normalized.some((part) => BANGLA_NAMES_EN.has(part))) return "bn";

  // 4. Geo-detected language (from middleware cookie based on IP country)
  if (geoLang === "bn") return "bn";
  if (geoLang === "en") return "en";

  // 5. Default to English
  return "en";
}

/**
 * Detect language for the homepage (no name input yet).
 * Uses geo cookie only.
 */
export function detectHomepageLanguage(geoLang?: string | null): Language {
  if (geoLang === "bn") return "bn";
  if (geoLang === "en") return "en";
  return "en";
}
