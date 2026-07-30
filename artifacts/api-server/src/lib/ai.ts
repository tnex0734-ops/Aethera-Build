/**
 * Aethera AI Client — Google Gemini Integration
 *
 * Provides two model instances:
 * - geminiText: For text-based educational responses (Gemini 1.5 Flash)
 * - geminiVision: For multimodal OCR on notebook/textbook images (Gemini 1.5 Flash Vision)
 *
 * Gracefully falls back if GOOGLE_GENERATIVE_AI_API_KEY is not set,
 * returning a structured placeholder so the server never crashes.
 */

import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";

const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "";

let genAI: GoogleGenerativeAI | null = null;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
} else {
  console.warn(
    "[Aethera AI] GOOGLE_GENERATIVE_AI_API_KEY is not set. " +
    "AI responses will use intelligent fallback mode."
  );
}

/** Text-only model for educational responses */
export function getTextModel(): GenerativeModel | null {
  if (!genAI) return null;
  return genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 2048,
    },
  });
}

/** Vision-capable model for OCR on notebook/textbook images */
export function getVisionModel(): GenerativeModel | null {
  if (!genAI) return null;
  return genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.2,   // Low temperature for accurate OCR extraction
      maxOutputTokens: 1024,
    },
  });
}

/** True if the AI client is initialized and ready */
export const isAIAvailable = (): boolean => genAI !== null;

/**
 * Safe wrapper around model.generateContent.
 * Returns null on any error so callers can fall back gracefully.
 */
export async function safeGenerate(
  model: GenerativeModel,
  prompt: string | (string | { inlineData: { mimeType: string; data: string } })[]
): Promise<string | null> {
  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (err) {
    console.error("[Aethera AI] Generation error:", err);
    return null;
  }
}
