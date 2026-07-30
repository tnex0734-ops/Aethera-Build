/**
 * Aethera Subject, Grade & Difficulty Detector
 *
 * Extends the basic English-only regex in chat.ts with:
 * - Multilingual keywords (Hindi, Telugu, Tamil romanized terms)
 * - Grade estimation from question complexity
 * - Difficulty inference from question type words
 * - Subject detection from educational context clues
 */

export type Subject =
  | "Mathematics"
  | "Physics"
  | "Chemistry"
  | "Biology"
  | "History"
  | "Geography"
  | "English"
  | "Computer Science"
  | "Science"
  | "General";

export type Difficulty = "easy" | "medium" | "hard";

export interface SubjectAnalysis {
  subject: Subject;
  difficulty: Difficulty;
  estimatedGrade: string;    // e.g. "Grade 3-5", "Grade 8-10"
  gradeNumber: number;       // single number for prompt context, e.g. 5
  questionType: "definition" | "problem" | "explanation" | "comparison" | "derivation" | "general";
  topicHint: string;         // extracted key topic for memory
}

// ---------------------------------------------------------------------------
// Subject keyword maps — multilingual
// ---------------------------------------------------------------------------

const SUBJECT_KEYWORDS: Record<Subject, string[]> = {
  Mathematics: [
    // English
    "math", "algebra", "equation", "calculus", "geometry", "trigonometry",
    "integral", "derivative", "vector", "matrix", "polynomial", "fraction",
    "decimal", "percentage", "ratio", "proportion", "arithmetic", "lcm", "hcf",
    "prime", "factor", "theorem", "proof", "angle", "triangle", "circle",
    "quadratic", "linear", "logarithm", "exponent", "set", "probability",
    "statistics", "mean", "median", "mode", "variance",
    // Hindi romanized
    "ganit", "samasya", "sankhya", "bhag", "guna", "jod", "ghata",
    "trikonmiti", "beejganit", "rekhaganit",
    // Telugu romanized
    "ganithamu", "samasyalu",
    // Tamil romanized
    "kanakkiyal", "iyakkam",
  ],
  Physics: [
    "physics", "force", "velocity", "acceleration", "newton", "gravity",
    "energy", "momentum", "wave", "optic", "electric", "magnetic", "current",
    "voltage", "resistance", "ohm", "capacitor", "inductor", "photon",
    "electron", "proton", "nuclear", "fission", "fusion", "pressure",
    "density", "temperature", "heat", "thermodynamics", "kinetics",
    "refraction", "reflection", "interference", "diffraction",
    // Hindi
    "bal", "urja", "daba", "taap", "bhujakars", "vidyut", "chumbak",
    // Telugu
    "shakti", "vegam", "balam",
  ],
  Chemistry: [
    "chemistry", "atom", "molecule", "reaction", "element", "compound",
    "acid", "base", "bond", "periodic", "organic", "chemical", "oxidation",
    "reduction", "catalyst", "solution", "solvent", "solute", "pH",
    "ionic", "covalent", "metallic", "electron", "valence", "isotope",
    "formula", "mole", "avogadro", "titration", "electrolysis",
    // Hindi
    "rasayan", "tatva", "yaugik", "aml", "khar",
    // Telugu
    "rasayanamu", "tattvamu",
  ],
  Biology: [
    "biology", "cell", "dna", "gene", "protein", "evolution", "organism",
    "photosynthesis", "mitosis", "meiosis", "ecosystem", "species",
    "chromosome", "mutation", "heredity", "respiration", "digestion",
    "circulation", "nervous", "immune", "hormone", "enzyme", "tissue",
    "organ", "classification", "bacteria", "virus", "fungi", "plant",
    "animal", "osmosis", "diffusion",
    // Hindi
    "jeev", "praani", "paudhha", "koshika", "prakaashsanshleshan",
    // Telugu
    "jeevashastram", "moku",
  ],
  History: [
    "history", "war", "empire", "revolution", "civilization", "century",
    "ancient", "medieval", "colonial", "independence", "treaty", "dynasty",
    "freedom", "movement", "nationalism", "partition", "mughal", "british",
    "gandhi", "nehru", "ambedkar", "constitution", "world war", "cold war",
    // Hindi
    "itihas", "yudh", "azaadi", "samrajya", "kranti", "sabhyata",
    // Telugu
    "charitra", "yuddham", "swatantram",
  ],
  Geography: [
    "geography", "continent", "country", "capital", "climate", "river",
    "mountain", "ocean", "population", "map", "latitude", "longitude",
    "hemisphere", "equator", "rainfall", "vegetation", "soil", "mineral",
    "plateau", "plain", "delta", "island", "peninsula", "gulf", "bay",
    // Hindi
    "bhugol", "nadi", "pahad", "mahasagar", "desh", "rajdhani",
    // Telugu
    "bhumisastram", "nadhi", "parvathamu",
  ],
  English: [
    "english", "grammar", "essay", "poem", "novel", "literature",
    "vocabulary", "sentence", "paragraph", "author", "write", "read",
    "comprehension", "passage", "tense", "verb", "noun", "adjective",
    "adverb", "pronoun", "conjunction", "preposition", "punctuation",
    "synonym", "antonym", "simile", "metaphor", "idiom", "phrase",
    // Hindi
    "angreji", "vyakaran", "kavita", "kahani",
  ],
  "Computer Science": [
    "computer", "algorithm", "program", "code", "software", "data structure",
    "loop", "function", "class", "variable", "python", "java", "javascript",
    "html", "css", "database", "sql", "array", "stack", "queue", "tree",
    "graph", "sorting", "searching", "binary", "recursion", "oop",
    "debugging", "compiler", "internet", "network", "cpu", "memory",
    // Hindi
    "sanganak", "karyakram", "praogi",
    // Telugu
    "sanganakapu", "software",
  ],
  Science: [
    "science", "experiment", "hypothesis", "observation", "conclusion",
    "matter", "energy", "natural", "environment", "pollution",
    // Hindi
    "vigyan", "prayog", "prakriti",
    // Telugu
    "vignanamu", "prayogamu",
  ],
  General: [],
};

// ---------------------------------------------------------------------------
// Question type detection
// ---------------------------------------------------------------------------

const DEFINITION_WORDS = ["what is", "define", "meaning of", "definition", "what are", "matlab", "artha", "artham", "enti", "enna"];
const EXPLANATION_WORDS = ["explain", "how does", "why does", "describe", "how do", "samjhao", "explain karo", "ela", "epdi", "hellu"];
const PROBLEM_WORDS = ["solve", "calculate", "find", "compute", "evaluate", "solve karo", "nikalo", "kanugonu", "kaanu"];
const COMPARISON_WORDS = ["difference between", "compare", "contrast", "vs", "versus", "better", "antar", "farak"];
const DERIVATION_WORDS = ["derive", "prove", "show that", "deduce", "derivation", "proof", "sabit karo"];

// ---------------------------------------------------------------------------
// Difficulty signals
// ---------------------------------------------------------------------------

const EASY_SIGNALS = [
  "what is", "define", "example", "simple", "basic", "easy",
  "class 1", "class 2", "class 3", "grade 1", "grade 2", "grade 3",
  "addition", "subtraction", "alphabets", "number",
];
const HARD_SIGNALS = [
  "derive", "prove", "advanced", "complex", "theorem", "differential",
  "calculus", "quantum", "nuclear", "organic synthesis", "eigenvalue",
  "class 9", "class 10", "grade 9", "grade 10", "board exam",
];

// ---------------------------------------------------------------------------
// Grade estimation heuristics
// ---------------------------------------------------------------------------

function estimateGrade(content: string, difficulty: Difficulty, subject: Subject): { label: string; num: number } {
  const lower = content.toLowerCase();

  // Explicit grade mentions
  const explicitMatch = lower.match(/class\s*(\d+)|grade\s*(\d+)|std\s*(\d+)/);
  if (explicitMatch) {
    const g = parseInt(explicitMatch[1] ?? explicitMatch[2] ?? explicitMatch[3] ?? "5");
    if (g >= 1 && g <= 10) return { label: `Grade ${g}`, num: g };
  }

  // Grade inference from subject + difficulty
  if (difficulty === "easy") {
    if (subject === "Mathematics" && /addition|subtraction|counting/.test(lower)) return { label: "Grade 1-3", num: 2 };
    if (subject === "Mathematics" && /multiplication|division|table/.test(lower)) return { label: "Grade 3-5", num: 4 };
    return { label: "Grade 1-5", num: 3 };
  }

  if (difficulty === "medium") {
    if (/algebra|equation|percentage|ratio/.test(lower)) return { label: "Grade 6-8", num: 7 };
    if (/photosynthesis|cell|respiration/.test(lower)) return { label: "Grade 6-8", num: 7 };
    return { label: "Grade 5-7", num: 6 };
  }

  // Hard
  if (/calculus|derivative|integral|organic|nuclear|thermodynamics/.test(lower)) return { label: "Grade 10+", num: 10 };
  if (/quadratic|trigonometry|logarithm|probability/.test(lower)) return { label: "Grade 9-10", num: 9 };
  return { label: "Grade 8-10", num: 9 };
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function analyzeInput(content: string): SubjectAnalysis {
  const lower = content.toLowerCase();

  // Detect subject by scoring keywords
  let bestSubject: Subject = "General";
  let bestScore = 0;

  for (const [subject, keywords] of Object.entries(SUBJECT_KEYWORDS) as [Subject, string[]][]) {
    if (subject === "General") continue;
    const score = keywords.filter(kw => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestSubject = subject;
    }
  }

  // Detect question type
  let questionType: SubjectAnalysis["questionType"] = "general";
  if (DEFINITION_WORDS.some(w => lower.includes(w))) questionType = "definition";
  else if (DERIVATION_WORDS.some(w => lower.includes(w))) questionType = "derivation";
  else if (COMPARISON_WORDS.some(w => lower.includes(w))) questionType = "comparison";
  else if (PROBLEM_WORDS.some(w => lower.includes(w))) questionType = "problem";
  else if (EXPLANATION_WORDS.some(w => lower.includes(w))) questionType = "explanation";

  // Detect difficulty
  let difficulty: Difficulty = "medium";
  const easyCount = EASY_SIGNALS.filter(s => lower.includes(s)).length;
  const hardCount = HARD_SIGNALS.filter(s => lower.includes(s)).length;
  if (hardCount > 0 || questionType === "derivation") difficulty = "hard";
  else if (easyCount > 0 && questionType === "definition") difficulty = "easy";

  // Grade estimation
  const { label: estimatedGrade, num: gradeNumber } = estimateGrade(content, difficulty, bestSubject);

  // Extract a topic hint (first meaningful noun phrase, approx)
  const topicHint = extractTopicHint(content, bestSubject);

  return {
    subject: bestSubject,
    difficulty,
    estimatedGrade,
    gradeNumber,
    questionType,
    topicHint,
  };
}

function extractTopicHint(content: string, subject: Subject): string {
  // Remove question words and return a clean topic phrase (max 40 chars)
  const cleaned = content
    .replace(/\b(what is|what are|how does|how do|explain|define|solve|find|calculate|samjhao|bolo|batao|kya hai|iska matlab|cheppu|sollu|hellu)\b/gi, "")
    .trim()
    .slice(0, 60)
    .trim();

  return cleaned || subject;
}
