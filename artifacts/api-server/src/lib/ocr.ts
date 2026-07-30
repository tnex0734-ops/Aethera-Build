/**
 * Aethera OCR Intelligence Pipeline
 *
 * Processes uploaded notebook photos, textbook pages, homework images, and PDFs.
 * Uses Gemini 1.5 Flash Vision for real OCR with academic understanding.
 *
 * PRD Pipeline:
 * Image → OCR → Language Detection → Question Reconstruction
 *       → Subject Detection → Difficulty Detection → AI
 */

import { getVisionModel, safeGenerate } from "./ai.js";
import { detectLanguage } from "./language.js";
import { analyzeInput } from "./subject.js";

export interface OCRResult {
  rawText: string;                   // Raw extracted text from image
  reconstructedQuestion: string;    // Cleaned, reconstructed question
  detectedSubject: string | null;
  detectedLanguage: string;
  confidence: number;                // 0.0 – 1.0
  topicHints: string[];             // Detected chapter/topic hints
  questionType: string;
}

/** System prompt for academic OCR with Google Gemini Vision */
const OCR_SYSTEM_PROMPT = `You are an expert academic OCR system for school students (Grade 1–10).
You receive an image of a student's notebook page, homework, textbook, exam paper, or question screenshot.

Your job:
1. Extract ALL text from the image accurately — including handwriting, printed text, equations, and labels.
2. Fix obvious spelling mistakes while preserving the original intent.
3. Reconstruct incomplete or fragmented questions into complete, clear questions.
4. Identify what subject, chapter, or topic this appears to be from.
5. Identify the language(s) used (English, Hindi, Telugu, Tamil, etc.)

Output ONLY a JSON object with these fields:
{
  "rawText": "exact text extracted from image",
  "reconstructedQuestion": "cleaned, complete question ready for AI tutoring",
  "subject": "Mathematics|Physics|Chemistry|Biology|History|Geography|English|Computer Science|Science|Unknown",
  "language": "en|hi|te|ta|kn|ml|mixed",
  "topicHints": ["array of detected topic or chapter names"],
  "confidence": 0.85
}

Rules:
- If the image is unclear, still provide your best extraction with lower confidence.
- If text is in Hindi/Telugu/Tamil/etc., include both the original script and a romanized version in rawText.
- ONLY output valid JSON, no markdown, no explanation text.`;

/**
 * Process an uploaded image file through the OCR pipeline.
 *
 * @param imageBase64 - Base64-encoded image data
 * @param mimeType - MIME type of the image (e.g. "image/jpeg")
 */
export async function processImageOCR(
  imageBase64: string,
  mimeType: string = "image/jpeg"
): Promise<OCRResult> {
  const visionModel = getVisionModel();

  if (!visionModel) {
    // Graceful fallback when AI is unavailable
    return buildFallbackOCR();
  }

  const imagePart = {
    inlineData: {
      mimeType,
      data: imageBase64,
    },
  };

  const rawOutput = await safeGenerate(visionModel, [OCR_SYSTEM_PROMPT, imagePart]);

  if (!rawOutput) {
    return buildFallbackOCR();
  }

  // Parse Gemini's JSON response
  try {
    // Strip any accidental markdown fences
    const cleaned = rawOutput
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/gi, "")
      .trim();

    const parsed = JSON.parse(cleaned) as {
      rawText?: string;
      reconstructedQuestion?: string;
      subject?: string;
      language?: string;
      topicHints?: string[];
      confidence?: number;
    };

    const rawText = parsed.rawText ?? rawOutput;
    const reconstructedQuestion = parsed.reconstructedQuestion ?? rawText;

    return {
      rawText,
      reconstructedQuestion,
      detectedSubject: parsed.subject && parsed.subject !== "Unknown" ? parsed.subject : null,
      detectedLanguage: parsed.language ?? "en",
      confidence: parsed.confidence ?? 0.75,
      topicHints: parsed.topicHints ?? [],
      questionType: analyzeInput(reconstructedQuestion).questionType,
    };
  } catch {
    // JSON parse failed — treat the raw text as the question
    const langResult = detectLanguage(rawOutput);
    const subjectAnalysis = analyzeInput(rawOutput);

    return {
      rawText: rawOutput,
      reconstructedQuestion: rawOutput,
      detectedSubject: subjectAnalysis.subject !== "General" ? subjectAnalysis.subject : null,
      detectedLanguage: langResult.language,
      confidence: 0.6,
      topicHints: [subjectAnalysis.topicHint],
      questionType: subjectAnalysis.questionType,
    };
  }
}

/**
 * Process a text-based OCR context (when image bytes aren't available
 * but a description/filename has been sent, e.g. storageUrl filename).
 * Reconstructs a plausible question from filename + any context clues.
 */
export function processTextOCR(storageUrl: string, existingText?: string): OCRResult {
  // Extract topic hints from filename
  const filename = storageUrl.split("/").pop() ?? storageUrl;
  const nameWithoutExt = filename.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");

  const baseText = existingText || nameWithoutExt;
  const langResult = detectLanguage(baseText);
  const analysis = analyzeInput(baseText);

  const reconstructed = existingText
    ? existingText
    : `Please help me understand: ${nameWithoutExt}`;

  return {
    rawText: baseText,
    reconstructedQuestion: reconstructed,
    detectedSubject: analysis.subject !== "General" ? analysis.subject : null,
    detectedLanguage: langResult.language,
    confidence: existingText ? 0.8 : 0.5,
    topicHints: [analysis.topicHint, analysis.subject].filter(Boolean),
    questionType: analysis.questionType,
  };
}

function buildFallbackOCR(): OCRResult {
  return {
    rawText: "Image content could not be processed. Please type your question.",
    reconstructedQuestion: "Please type your question in the message box.",
    detectedSubject: null,
    detectedLanguage: "en",
    confidence: 0.0,
    topicHints: [],
    questionType: "general",
  };
}
