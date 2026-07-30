/**
 * Aethera Adaptive Memory Manager
 *
 * After each AI response, non-blockingly updates the student's learning memory:
 * - Tracks which topics they ask about repeatedly (weak topics)
 * - Records subjects they ask confidently about (strong topics)
 * - Updates their preferred language based on usage patterns
 * - Records learning style inferences
 *
 * All writes are fire-and-forget to not delay the chat response.
 */

import { eq } from "drizzle-orm";
import { db, learningMemoryTable } from "@workspace/db";
import type { DetectedLanguage } from "./language.js";
import type { Subject } from "./subject.js";

const DEMO_USER_ID = 1;

/** Maximum number of topics to remember in each list */
const MAX_TOPICS = 20;

/** Number of times a topic must be asked before it's classified as "weak" */
const WEAK_TOPIC_THRESHOLD = 3;

/**
 * Update the student's learning memory after a successful chat exchange.
 * This function is intentionally non-blocking (async, no await in caller).
 */
export async function updateMemoryAfterChat(params: {
  subject: Subject | null;
  topicHint: string;
  language: DetectedLanguage;
  questionType: string;
  difficulty: string;
}): Promise<void> {
  const { subject, topicHint, language, questionType, difficulty } = params;

  try {
    // Ensure memory row exists
    const [existing] = await db
      .select()
      .from(learningMemoryTable)
      .where(eq(learningMemoryTable.userId, DEMO_USER_ID));

    if (!existing) {
      // Create the row if it doesn't exist
      await db.insert(learningMemoryTable).values({
        userId: DEMO_USER_ID,
        weakTopics: [],
        strongTopics: [],
        preferredLanguage: language !== "mixed" ? language : "en",
      });
      return;
    }

    const updates: Partial<typeof existing> = {};

    // --- Update preferred language ---
    if (language !== "en" && language !== "mixed" && language !== existing.preferredLanguage) {
      updates.preferredLanguage = language;
    }

    // --- Update learning style based on question type ---
    if (questionType === "problem" && !existing.learningStyle) {
      updates.learningStyle = "problem-solving";
    } else if (questionType === "definition" && !existing.learningStyle) {
      updates.learningStyle = "conceptual";
    } else if (questionType === "explanation" && !existing.learningStyle) {
      updates.learningStyle = "visual";
    }

    // --- Update topic tracking ---
    if (subject && topicHint) {
      const topic = `${subject}: ${topicHint.slice(0, 40)}`;
      const currentWeak = existing.weakTopics ?? [];
      const currentStrong = existing.strongTopics ?? [];

      // Count how many times this topic has appeared in weak list
      const topicOccurrences = currentWeak.filter(t => t.startsWith(`${subject}:`)).length;

      if (topicOccurrences >= WEAK_TOPIC_THRESHOLD) {
        // Consistent re-asking = weak topic (already tracked, just ensure it's there)
        if (!currentWeak.includes(topic)) {
          updates.weakTopics = [...currentWeak, topic].slice(-MAX_TOPICS);
        }
      } else if (topicOccurrences === 0) {
        // First encounter — add to weak for now (will be promoted to strong after quiz success)
        updates.weakTopics = [...currentWeak, topic].slice(-MAX_TOPICS);
      }

      // Mark as strong topic if it's a "definition" or "explanation" question
      // (implies review/consolidation rather than confusion)
      if (["definition", "explanation"].includes(questionType) && difficulty === "easy") {
        if (!currentStrong.includes(subject)) {
          updates.strongTopics = [...currentStrong, subject].slice(-MAX_TOPICS);
        }
      }
    }

    // Only write if there's something to update
    if (Object.keys(updates).length > 0) {
      await db
        .update(learningMemoryTable)
        .set(updates)
        .where(eq(learningMemoryTable.userId, DEMO_USER_ID));
    }
  } catch (err) {
    // Memory updates should never crash the main response
    console.error("[Aethera Memory] Failed to update memory:", err);
  }
}

/**
 * Promote a topic from weak to strong (called after quiz success).
 * Called from quiz submission route.
 */
export async function promoteTopicToStrong(topic: string): Promise<void> {
  try {
    const [memory] = await db
      .select()
      .from(learningMemoryTable)
      .where(eq(learningMemoryTable.userId, DEMO_USER_ID));

    if (!memory) return;

    const weak = (memory.weakTopics ?? []).filter(t => !t.includes(topic));
    const strong = [...(memory.strongTopics ?? [])];

    if (!strong.includes(topic)) {
      strong.push(topic);
    }

    await db
      .update(learningMemoryTable)
      .set({
        weakTopics: weak.slice(-MAX_TOPICS),
        strongTopics: strong.slice(-MAX_TOPICS),
      })
      .where(eq(learningMemoryTable.userId, DEMO_USER_ID));
  } catch (err) {
    console.error("[Aethera Memory] Failed to promote topic:", err);
  }
}

/**
 * Load memory for the demo user (or return empty defaults).
 */
export async function loadMemory(): Promise<{
  weakTopics: string[];
  strongTopics: string[];
  preferredLanguage: string;
  learningStyle: string | null;
}> {
  try {
    const [memory] = await db
      .select()
      .from(learningMemoryTable)
      .where(eq(learningMemoryTable.userId, DEMO_USER_ID));

    if (memory) {
      return {
        weakTopics: memory.weakTopics ?? [],
        strongTopics: memory.strongTopics ?? [],
        preferredLanguage: memory.preferredLanguage ?? "en",
        learningStyle: memory.learningStyle ?? null,
      };
    }
  } catch (err) {
    console.error("[Aethera Memory] Failed to load memory:", err);
  }

  return { weakTopics: [], strongTopics: [], preferredLanguage: "en", learningStyle: null };
}
