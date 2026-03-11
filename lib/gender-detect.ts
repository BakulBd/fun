/**
 * Gender detection for Bangladeshi/South Asian names.
 * Uses name databases + suffix heuristics for high accuracy.
 */

export type Gender = "male" | "female";

/**
 * Common female names (English script) — comprehensive BD + South Asian list.
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
  "nafisa", "nahar", "nahida", "najma", "nargis", "nasrin", "naznin",
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
  "tama", "tamanna", "taniya", "tahmina", "tanzila", "tarana", "tithi",
  "tonni", "trishna", "tuhina", "ummay", "urmi", "wahida", "yesmin", "yoshna",
  "zannat", "zara", "zerina", "zinia", "zobayda", "zubaida",
  // Nicknames
  "asha", "bristi", "bristy", "bijli", "chumki", "dolly", "lipi", "lopa",
  "mita", "mithu", "moon", "nilu", "papiya", "renu", "rinku", "ritu",
  "riva", "rokeya", "shefali", "shikha", "shompa", "sonia", "sumi", "swapna",
  "tina", "tuli", "tumpa", "turna", "tisha", "afrin", "sinthia",
  // Common South Asian female names
  "anjali", "deepa", "kavita", "lalita", "madhu", "maya", "meena", "neelam",
  "padma", "pushpa", "radha", "rekha", "sita", "sunita", "usha", "uma",
  // Additional BD/South Asian female names for better coverage
  "mehnaz", "sumaiya", "jannat", "jannati", "musarrat", "nilufa", "perveen",
  "rokeya", "rawshan", "tabassum", "rowshan", "zeenat", "feroza", "humayra",
  "tahera", "yasmin", "shayla", "lubaba", "ireen", "kona", "tonima", "shrabonti",
  "papri", "nowshin", "oishi", "upoma", "turba", "antara", "arshi", "disha",
  "faiza", "humaira", "irin", "jinia", "khadija", "lamya", "mahima", "naima",
  "nusaiba", "raisa", "sabrina", "safiya", "tahsin", "umme", "zainab", "zerin",
  "arifa", "ferdousi", "israt", "jahan", "khurshida", "laizu", "marufa",
  "nargish", "nupur", "orpita", "preeti", "rukhsana", "shiuli", "tabassum",
  "uzma", "warda", "zahida", "anu", "bina", "dola", "gita", "hira",
  "iva", "koli", "lima", "moyna", "nila", "opu", "runa", "shilpa",
  "uma", "vina", "mithila", "snigdha", "sharmee", "shoily", "sharmin",
  "sharmi", "deepti", "soniya", "rimjhim", "rupsha", "simmi", "priti",
  "nandita", "madhuri", "khushi",
]);

/**
 * Common male names (English script) — comprehensive list.
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
  "emad", "ishan", "joy", "kuddus", "murad", "nadim", "nahid",
  "osman", "rafin", "rayhan", "sadiq", "samiul", "tamim", "yamin", "zafar",
  // Additional male names for better coverage
  "shakib", "morshed", "wasim", "momin", "zahir", "shihab", "towfiq", "labib",
  "safwan", "ishtiaq", "junaid", "kamran", "mahmud", "sadman", "wasif", "zarif",
  "ramzan", "shoaib", "taufiq", "yasin", "zubair", "anas", "bilal", "danish",
  "farhan", "galib", "hamim", "irfan", "jubair", "khalid", "latif", "mahin",
  "nafiz", "owais", "pranto", "qasim", "rahat", "samin", "tariq", "ummid",
  "wasi", "yusuf", "zayed", "amit", "bappy", "chanchal", "dip", "emon",
  "feroz", "gazi", "hassain", "imdad", "jabed", "kashif", "likhon", "mim",
  "noyon", "omor", "palash", "ratul", "sojib", "tushar", "ujjal", "vivek",
  "nahidul", "habibur", "mizanur", "obaidur", "aminul", "mominul", "hasanul",
  "shamsul", "saifur", "atikur", "monirul", "fazlul", "mostafiz", "mahmudul",
  "mushfiqur", "mustafiz", "mashrafi", "tamim", "taskin", "miraz", "shoriful",
]);

/**
 * Bangla script female name patterns.
 */
const BANGLA_FEMALE_NAMES = [
  "নুসরাত", "তাসনিম", "জান্নাতুল", "সাদিয়া", "ফারজানা", "নাদিয়া",
  "লামিয়া", "আনিকা", "রিয়া", "প্রিয়া", "মুন্নি", "শাপলা", "সোনালি",
  "রত্না", "ফাতেমা", "হাসিনা", "রাহিমা", "খাদিজা", "তাসলিমা", "রেহানা",
  "আয়েশা", "আমিনা", "বুশরা", "ফারিয়া", "মারিয়া", "সুমি", "তানিয়া",
  "রুমা", "মিতু", "পপি", "মৌসুমী", "শামীমা", "সালমা", "নাসিমা",
  "জান্নাত", "সুমাইয়া", "নাইমা", "রাইসা", "তাহমিনা", "মাহিমা",
  "সাবরিনা", "নুসাইবা", "ফাইজা", "জাইনাব", "সাফিয়া", "হুমায়রা",
  "তাহেরা", "ইয়াসমিন", "শায়লা", "লুবাবা", "শিউলি", "নুপুর",
  "শ্রাবন্তী", "অন্তরা", "দিশা", "মিথিলা",
];

const BANGLA_MALE_NAMES = [
  "রহিম", "করিম", "সুমন", "রাকিব", "আরিফ", "ফাহিম", "সাকিব", "নাঈম",
  "তানভীর", "মেহেদী", "শোহেল", "রনি", "মাসুদ", "বাকুল", "রুবেল",
  "ইমরান", "ফারুক", "হাসান", "নাবিল", "শামীম",
  "সাব্বির", "আরাফাত", "রাসেল", "শাকিব", "ফারহান", "জুনাইদ",
  "মাহমুদ", "রায়হান", "ইরফান", "ইউসুফ", "বিলাল", "আমিত",
];

/**
 * Suffix-based heuristics for English-transliterated BD names.
 * These patterns indicate likely female names.
 */
const FEMALE_SUFFIXES = [
  "ina", "ima", "ita", "ita", "uma", "ala", "ela", "ila", "ula",
  "ana", "ena", "ona", "una", "ema", "ama", "umi", "ani",
  "ati", "oti", "uti", "abi", "ubi", "uri", "sri",
  "mina", "nina", "bina", "dina", "rina", "tina", "lina", "sina",
  "hida", "mida", "nida", "rida", "sida",
  "kha", "sha", "tha",
  "eya", "iya", "uya", "aya",
  "een", "reen", "hin",
];

/**
 * Suffix patterns that strongly indicate male names.
 */
const MALE_SUFFIXES = [
  "ul", "ur", "uddin", "ullah", "uzzaman", "alam",
  "udding", "uzzama", "uzaman",
  "dul", "bul", "ful", "gul", "sul", "mul", "nul",
  "hed", "had", "hid", "shad", "shed",
  "ik", "aq", "eq", "ook", "eek",
  "im", "om",
  "ab", "ib", "eb", "ob", "ub",
  "az", "iz", "uz", "oz",
  "an", "on",
  "er", "ar", "ir",
];

/**
 * Detect gender from a name using multiple signals.
 * Priority:
 * 1. Known female name database match
 * 2. Known male name database match
 * 3. Bangla script name exact match
 * 4. English suffix heuristics
 * 5. Bangla suffix heuristics
 * 6. Default to "male"
 */
export function detectGender(name: string): Gender {
  const trimmed = name.trim();

  // Check Bangla script names
  if (/[\u0980-\u09FF]/.test(trimmed)) {
    if (BANGLA_FEMALE_NAMES.some((fn) => trimmed.includes(fn))) return "female";
    if (BANGLA_MALE_NAMES.some((mn) => trimmed.includes(mn))) return "male";

    // Bangla suffix heuristics
    if (/[াি]$/.test(trimmed)) return "female"; // ends in া or ি
    if (/[ীমানো]$/.test(trimmed)) return "female"; // ends in ী, মা, না, etc.

    return "male";
  }

  // English script: check name parts against databases
  const parts = trimmed.toLowerCase().split(/\s+/);
  const firstName = parts[0];

  // Database exact match — highest priority
  if (FEMALE_NAMES.has(firstName)) return "female";
  if (MALE_NAMES.has(firstName)) return "male";

  // Check all parts (handles "Jannatul Ferdous", etc.)
  if (parts.some((p) => FEMALE_NAMES.has(p))) return "female";
  if (parts.some((p) => MALE_NAMES.has(p))) return "male";

  // Suffix heuristics on first name
  const lower = firstName.toLowerCase();

  // Check male suffixes first (more definitive in BD context — "uddin", "ullah")
  if (MALE_SUFFIXES.some((s) => lower.endsWith(s) && lower.length > s.length + 1)) {
    return "male";
  }

  // Female suffix check
  if (FEMALE_SUFFIXES.some((s) => lower.endsWith(s) && lower.length > s.length + 1)) {
    return "female";
  }

  // Common female name ending: -a (very common in South Asian female names)
  // But only if name is 4+ characters (to avoid false positives like "rana")
  if (lower.length >= 5 && lower.endsWith("a") && !lower.endsWith("da") && !lower.endsWith("ja")) {
    return "female";
  }

  return "male";
}
