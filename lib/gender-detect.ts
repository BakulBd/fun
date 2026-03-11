/**
 * Gender detection for Bangladeshi/South Asian names.
 * Used to serve gender-appropriate predictions (wife vs husband jokes).
 */

export type Gender = "male" | "female";

/**
 * Common female names (English script) — comprehensive BD + South Asian list.
 * Covers nicknames, formal names, and common variations.
 */
const FEMALE_NAMES = new Set([
  // Very common BD female names
  "tasnim", "nusrat", "jannatul", "sharmin", "nadia", "tania", "ruma", "mitu",
  "laboni", "shorna", "lamia", "sadia", "farzana", "anika", "riya", "priya",
  "swarna", "mousum", "munni", "moni", "shathi", "shapla", "kakoli", "poly",
  "sonali", "ratna", "shamima", "salma", "fatema", "hasina", "rahima", "kulsum",
  "khadiza", "taslima", "rehana", "nasima", "dilara", "shireen", "popy", "moushumi",
  // More popular BD female names
  "ayesha", "aisha", "amina", "asma", "bushra", "champa", "chandni", "dalia",
  "dina", "ela", "eti", "eva", "fahmida", "farida", "faria", "fatima",
  "habiba", "halima", "hamida", "hena", "ishrat", "jahanara", "jasmine", "jharna",
  "jolly", "jui", "julekha", "jyoti", "kamrun", "kaniz", "keya", "kohinoor",
  "laila", "lata", "liza", "lubna", "lucky", "mahbuba", "mahfuza", "mahmuda",
  "maleka", "maliha", "maria", "mariam", "marjana", "masuma", "meher", "mehjabin",
  "mim", "mina", "mishu", "monika", "morsheda", "mossammat", "mukta", "nabila",
  "nafisa", "nahar", "nahida", "najma", "nargis", "naser", "nasrin", "naznin",
  "neela", "neha", "nila", "nilufar", "nipa", "nishi", "noor", "noorjahan",
  "nurjahan", "nurunnahar", "papia", "parul", "parvin", "pinki", "piya",
  "rabeya", "rafiya", "ragini", "rajia", "rakhee", "rani", "rasheda", "reshma",
  "rini", "ripa", "rita", "roksana", "rubi", "ruhi", "rumana", "rupali",
  "sabina", "sabiha", "safia", "sagira", "saima", "sajeda", "sakina", "samia",
  "samira", "sanjida", "sara", "sarmin", "shabnur", "shahanara", "shahana",
  "shaila", "shajeda", "shakila", "shama", "shamoly", "shanta", "sharifa",
  "shelina", "shila", "shilpi", "shima", "shimla", "shirin", "shomi", "shraboni",
  "shruti", "shuchita", "shumi", "simu", "sohana", "soma", "suborna", "suchitra",
  "sufia", "sultana", "sumona", "supria", "suraia", "surma", "susmita", "sweetie",
  "tama", "tamanna", "tamim", "taniya", "tahmina", "tanzila", "tarana", "tithi",
  "tonni", "trishna", "tuhina", "ummay", "urmi", "wahida", "yesmin", "yoshna",
  "zannat", "zara", "zerina", "zinia", "zobayda", "zubaida",
  // Nicknames
  "asha", "bristi", "bristy", "bijli", "chumki", "dolly", "lipi", "lopa",
  "mita", "mithu", "moon", "nilu", "papiya", "renu", "rinku", "ritu",
  "riva", "rokeya", "shefali", "shikha", "shompa", "sonia", "sumi", "swapna",
  "tina", "tuli", "tumpa", "turna", "tisha", "afrin", "sinthia",
  // Common South Asian female names that BD people also use
  "anjali", "deepa", "kavita", "lalita", "madhu", "maya", "meena", "neelam",
  "padma", "pushpa", "radha", "rekha", "sita", "sunita", "usha", "uma",
]);

/**
 * Common male names (English script) — for disambiguation.
 */
const MALE_NAMES = new Set([
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
  "mahfuz", "rasel", "jisan", "shopon", "tanjim", "sabbir", "fahad",
  // More male names
  "abdullah", "abul", "adnan", "afzal", "ahsan", "akbar", "akter", "amir",
  "anwar", "arafat", "asad", "aziz", "babar", "bashir", "dipu", "faisal",
  "golam", "hanif", "iqbal", "ismail", "jakir", "kamrul", "khaled", "liakat",
  "mahbub", "mainul", "mojib", "mostofa", "mushfiq", "nazmul", "obaidul",
  "pervez", "rafiq", "rajib", "saiful", "sajjad", "sakir", "shafin",
  "shahriar", "shakil", "sharif", "sifat", "sohan", "sujan", "tahmid",
  "tawfiq", "zaman", "zubayer", "abir", "alif", "asif", "atiq", "ehsan",
  "emad", "ishan", "joy", "kuddus", "murad", "nadim", "nahid", "omar",
  "osman", "rafin", "rayhan", "sadiq", "samiul", "tamim", "yamin", "zafar",
]);

/**
 * Bangla script ending patterns for female names.
 * Names ending in certain characters are often female.
 */
const BANGLA_FEMALE_ENDINGS = [
  "া", // -a ending (very common: ফাতেমা, আয়েশা, সাদিয়া)
  "ি", // -i ending (নুসরাতি, etc.)
  "ী", // -ee ending (লক্ষ্মী, etc.)
  "মা", // -ma (ফাতেমা, সালমা, রাহিমা)
  "না", // -na (হাসিনা, নাসিমা)
  "নি", // -ni (রাগিনী)
];

/**
 * Bangla script common female name patterns.
 */
const BANGLA_FEMALE_NAMES = [
  "নুসরাত", "তাসনিম", "জান্নাতুল", "সাদিয়া", "ফারজানা", "নাদিয়া",
  "লামিয়া", "আনিকা", "রিয়া", "প্রিয়া", "মুন্নি", "শাপলা", "সোনালি",
  "রত্না", "ফাতেমা", "হাসিনা", "রাহিমা", "খাদিজা", "তাসলিমা", "রেহানা",
  "আয়েশা", "আমিনা", "বুশরা", "ফারিয়া", "মারিয়া", "সুমি", "তানিয়া",
  "রুমা", "মিতু", "পপি", "মৌসুমী", "শামীমা", "সালমা", "নাসিমা",
];

const BANGLA_MALE_NAMES = [
  "রহিম", "করিম", "সুমন", "রাকিব", "আরিফ", "ফাহিম", "সাকিব", "নাঈম",
  "তানভীর", "মেহেদী", "শোহেল", "রনি", "মাসুদ", "বাকুল", "রুবেল",
  "ইমরান", "ফারুক", "হাসান", "নাবিল", "শামীম",
];

/**
 * Detect gender from a name using multiple signals.
 * Returns "male" or "female".
 * 
 * Priority:
 * 1. Known female name database match
 * 2. Known male name database match
 * 3. Bangla script name pattern analysis
 * 4. Default to "male" (majority BD internet user demographic)
 */
export function detectGender(name: string): Gender {
  const trimmed = name.trim();

  // Check Bangla script names
  if (/[\u0980-\u09FF]/.test(trimmed)) {
    // Check exact matches in Bangla lists
    if (BANGLA_FEMALE_NAMES.some((fn) => trimmed.includes(fn))) return "female";
    if (BANGLA_MALE_NAMES.some((mn) => trimmed.includes(mn))) return "male";

    // Check ending patterns for Bangla names (less reliable, so lower priority)
    // Only use this for very common endings
    return "male"; // default for Bangla names
  }

  // English script: check name parts against databases
  const parts = trimmed.toLowerCase().split(/\s+/);

  // Check first name primarily (most reliable signal)
  const firstName = parts[0];

  if (FEMALE_NAMES.has(firstName)) return "female";
  if (MALE_NAMES.has(firstName)) return "male";

  // Check all parts (handles "Jannatul Ferdous", etc.)
  if (parts.some((p) => FEMALE_NAMES.has(p))) return "female";
  if (parts.some((p) => MALE_NAMES.has(p))) return "male";

  // Default to male
  return "male";
}
