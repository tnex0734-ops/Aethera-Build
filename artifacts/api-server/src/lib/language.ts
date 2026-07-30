/**
 * Aethera Language Detection Service
 *
 * Detects the student's input language locally — no API cost.
 * Supports: English, Hindi (Devanagari + romanized Hinglish),
 * Telugu, Tamil, Kannada, Malayalam, and mixed inputs.
 *
 * PRD Requirement: Automatically detect language without requiring
 * the student to manually select it.
 */

export type DetectedLanguage = "en" | "hi" | "te" | "ta" | "kn" | "ml" | "mixed";

export interface LanguageResult {
  language: DetectedLanguage;
  confidence: number;        // 0.0 – 1.0
  shouldRespondIn: DetectedLanguage;
  langLabel: string;         // Human-readable label for prompt building
}

// Unicode script range checks
const DEVANAGARI_RE = /[\u0900-\u097F]/;
const TELUGU_RE     = /[\u0C00-\u0C7F]/;
const TAMIL_RE      = /[\u0B80-\u0BFF]/;
const KANNADA_RE    = /[\u0C80-\u0CFF]/;
const MALAYALAM_RE  = /[\u0D00-\u0D7F]/;

// Romanized Hinglish / common Indian student expressions
const HINGLISH_WORDS = [
  "kya", "hai", "hain", "karo", "bolo", "samjhao", "batao", "matlab",
  "iska", "isko", "kaise", "kyun", "kyunki", "aur", "lekin", "toh",
  "mujhe", "mera", "meri", "yeh", "ye", "woh", "agar", "nahi",
  "theek", "accha", "sahi", "galat", "pehle", "phir", "abhi",
  "padho", "likhna", "seekhna", "doubt", "samjha", "solve karo",
];

// Romanized Telugu expressions
const TELUGU_ROMANIZED = [
  "enti", "idi", "ela", "cheppandi", "cheppu", "cheyyi", "artham",
  "naaku", "meeru", "okka", "ikkada", "akkada", "evaru", "emiti",
  "kavali", "telusaa", "telusa", "andam", "ayindi",
];

// Romanized Tamil expressions
const TAMIL_ROMANIZED = [
  "enna", "sollu", "theriyuma", "theriyuma", "epdi", "yenna",
  "ithu", "athu", "yaaru", "enga", "enna panrathu", "sollunga",
  "puriyala", "explain pannu", "vilakku",
];

// Romanized Kannada expressions
const KANNADA_ROMANIZED = [
  "enu", "hellu", "gottilla", "gottilla", "hege", "yenu",
  "illi", "alli", "yaaru", "ella", "bekaa", "gottu",
];

// Romanized Malayalam expressions
const MALAYALAM_ROMANIZED = [
  "enthaa", "parayoo", "ariyamo", "eviде", "eppo", "ente",
  "ningal", "njan", "avide", "ividе", "cheyyanam", "parayam",
];

function countMatches(text: string, words: string[]): number {
  const lower = text.toLowerCase();
  return words.filter(w => lower.includes(w)).length;
}

/**
 * Detect language from student input text.
 * Uses script detection first (high confidence), then
 * romanized word matching as a fallback.
 */
export function detectLanguage(text: string): LanguageResult {
  if (!text || text.trim().length < 2) {
    return { language: "en", confidence: 0.5, shouldRespondIn: "en", langLabel: "English" };
  }

  // --- Script-based detection (very high confidence) ---
  if (DEVANAGARI_RE.test(text)) {
    return { language: "hi", confidence: 0.97, shouldRespondIn: "hi", langLabel: "Hindi" };
  }
  if (TELUGU_RE.test(text)) {
    return { language: "te", confidence: 0.97, shouldRespondIn: "te", langLabel: "Telugu" };
  }
  if (TAMIL_RE.test(text)) {
    return { language: "ta", confidence: 0.97, shouldRespondIn: "ta", langLabel: "Tamil" };
  }
  if (KANNADA_RE.test(text)) {
    return { language: "kn", confidence: 0.97, shouldRespondIn: "kn", langLabel: "Kannada" };
  }
  if (MALAYALAM_RE.test(text)) {
    return { language: "ml", confidence: 0.97, shouldRespondIn: "ml", langLabel: "Malayalam" };
  }

  // --- Romanized word-matching (medium confidence) ---
  const hiScore = countMatches(text, HINGLISH_WORDS);
  const teScore = countMatches(text, TELUGU_ROMANIZED);
  const taScore = countMatches(text, TAMIL_ROMANIZED);
  const knScore = countMatches(text, KANNADA_ROMANIZED);
  const mlScore = countMatches(text, MALAYALAM_ROMANIZED);

  const maxScore = Math.max(hiScore, teScore, taScore, knScore, mlScore);

  if (maxScore === 0) {
    // Pure English
    return { language: "en", confidence: 0.9, shouldRespondIn: "en", langLabel: "English" };
  }

  // Mixed if multiple languages detected
  const totalScore = hiScore + teScore + taScore + knScore + mlScore;
  const dominantCount = [hiScore, teScore, taScore, knScore, mlScore].filter(s => s > 0).length;

  if (dominantCount > 1 && maxScore < 3) {
    return { language: "mixed", confidence: 0.7, shouldRespondIn: "hi", langLabel: "Bilingual (Hindi + English)" };
  }

  if (hiScore === maxScore && hiScore >= 1) {
    const conf = Math.min(0.5 + hiScore * 0.1, 0.92);
    // Hinglish = mixed English + Hindi romanized
    const isHinglish = /[a-zA-Z]/.test(text) && hiScore > 0;
    return {
      language: isHinglish ? "mixed" : "hi",
      confidence: conf,
      shouldRespondIn: "hi",
      langLabel: "Hindi / Hinglish",
    };
  }
  if (teScore === maxScore) {
    return { language: "te", confidence: Math.min(0.5 + teScore * 0.1, 0.9), shouldRespondIn: "te", langLabel: "Telugu" };
  }
  if (taScore === maxScore) {
    return { language: "ta", confidence: Math.min(0.5 + taScore * 0.1, 0.9), shouldRespondIn: "ta", langLabel: "Tamil" };
  }
  if (knScore === maxScore) {
    return { language: "kn", confidence: Math.min(0.5 + knScore * 0.1, 0.9), shouldRespondIn: "kn", langLabel: "Kannada" };
  }
  if (mlScore === maxScore) {
    return { language: "ml", confidence: Math.min(0.5 + mlScore * 0.1, 0.9), shouldRespondIn: "ml", langLabel: "Malayalam" };
  }

  return { language: "en", confidence: 0.75, shouldRespondIn: "en", langLabel: "English" };
}

/**
 * Override detected language with user's stored preference.
 * The memory's preferred language wins if the current detection
 * confidence is below threshold.
 */
export function resolveLanguage(
  detected: LanguageResult,
  memoryPreferredLanguage: string
): LanguageResult {
  if (detected.confidence >= 0.85) return detected;

  // Trust the stored preference for low-confidence detections
  const lang = memoryPreferredLanguage as DetectedLanguage;
  const langLabels: Record<string, string> = {
    en: "English", hi: "Hindi", te: "Telugu",
    ta: "Tamil", kn: "Kannada", ml: "Malayalam", mixed: "Bilingual",
  };

  return {
    language: lang,
    confidence: 0.8,
    shouldRespondIn: lang,
    langLabel: langLabels[lang] ?? "English",
  };
}
