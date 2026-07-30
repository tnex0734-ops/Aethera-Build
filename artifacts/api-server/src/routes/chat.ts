/**
 * Aethera Chat Route — Full AI Orchestration Pipeline
 *
 * Replaces the random template string responses with a proper
 * educational AI pipeline:
 *
 * Student Input
 *   ↓ detectLanguage()           zero-cost, local
 *   ↓ analyzeInput()             zero-cost, local
 *   ↓ loadMemory()               DB read
 *   ↓ loadConversationHistory()  DB read (last 6 messages)
 *   ↓ generateVisualSpec()       local
 *   ↓ buildEducationalPrompt()   structured prompt with all context
 *   ↓ gemini.generateContent()   AI call (or fallback)
 *   ↓ saveMessages()             DB writes
 *   ↓ updateMemoryAsync()        fire-and-forget DB write
 *   ↓ Return structured response
 *
 * All existing API contracts (routes, Zod schemas, response shapes) are preserved.
 */

import { Router, type IRouter } from "express";
import { eq, sql, desc } from "drizzle-orm";
import { db, sessionsTable, messagesTable, usersTable } from "@workspace/db";
import {
  SendChatBody,
  SendChatResponse,
} from "@workspace/api-zod";

// AI service modules
import { getTextModel, safeGenerate, isAIAvailable } from "../lib/ai.js";
import { detectLanguage, resolveLanguage } from "../lib/language.js";
import { analyzeInput } from "../lib/subject.js";
import { generateVisualSpec } from "../lib/visual.js";
import { buildEducationalPrompt, buildFallbackResponse } from "../lib/prompt.js";
import { loadMemory, updateMemoryAfterChat } from "../lib/memory-writer.js";

const router: IRouter = Router();
const DEMO_USER_ID = 1;

// ---------------------------------------------------------------------------
// POST /chat — Main educational AI response handler
// ---------------------------------------------------------------------------

router.post("/chat", async (req, res): Promise<void> => {
  const parsed = SendChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { content, sessionId, uploadId } = parsed.data;

  // ------------------------------------------------------------------
  // STEP 1: Parallel local analysis (zero cost, no API calls)
  // ------------------------------------------------------------------

  // Detect the student's language
  const rawLangDetection = detectLanguage(content);

  // Analyze subject, grade, difficulty, question type
  const subjectAnalysis = analyzeInput(content);

  // ------------------------------------------------------------------
  // STEP 2: Load student memory and user profile from DB
  // ------------------------------------------------------------------

  const [memory, userProfile] = await Promise.all([
    loadMemory(),
    db.select().from(usersTable).where(eq(usersTable.id, DEMO_USER_ID)).then(r => r[0] ?? null),
  ]);

  // Resolve language: use stored preference if current detection is uncertain
  const language = resolveLanguage(rawLangDetection, memory.preferredLanguage);

  // ------------------------------------------------------------------
  // STEP 3: Load recent conversation history (last 6 messages)
  // ------------------------------------------------------------------

  const recentMessages = await db
    .select({ role: messagesTable.role, content: messagesTable.content })
    .from(messagesTable)
    .where(eq(messagesTable.sessionId, sessionId))
    .orderBy(desc(messagesTable.createdAt))
    .limit(6);

  // Reverse to chronological order
  const conversationHistory = recentMessages.reverse() as { role: "user" | "assistant"; content: string }[];

  // ------------------------------------------------------------------
  // STEP 4: Generate educational visual specification
  // ------------------------------------------------------------------

  const visual = generateVisualSpec(subjectAnalysis, content);

  // ------------------------------------------------------------------
  // STEP 5: Build the structured educational prompt
  // ------------------------------------------------------------------

  const prompt = buildEducationalPrompt({
    question: content,
    language,
    analysis: subjectAnalysis,
    visual,
    memory,
    conversationHistory,
    userGrade: userProfile?.grade ?? null,
  });

  // ------------------------------------------------------------------
  // STEP 6: Generate AI response (Gemini or intelligent fallback)
  // ------------------------------------------------------------------

  let aiContent: string;

  if (isAIAvailable()) {
    const model = getTextModel();
    if (model) {
      const generated = await safeGenerate(model, prompt);
      aiContent = generated ?? buildFallbackResponse({
        question: content,
        language,
        analysis: subjectAnalysis,
        visual,
        memory,
        conversationHistory,
        userGrade: userProfile?.grade ?? null,
      });
    } else {
      aiContent = buildFallbackResponse({
        question: content,
        language,
        analysis: subjectAnalysis,
        visual,
        memory,
        conversationHistory,
        userGrade: userProfile?.grade ?? null,
      });
    }
  } else {
    // No API key — use structured educational fallback
    aiContent = buildFallbackResponse({
      question: content,
      language,
      analysis: subjectAnalysis,
      visual,
      memory,
      conversationHistory,
      userGrade: userProfile?.grade ?? null,
    });
  }

  // Inject the pre-generated Mermaid diagram if AI didn't include one
  // (belt-and-suspenders: ensures visual is always in the response)
  if (
    visual.shouldShow &&
    visual.mermaidCode &&
    !aiContent.includes("```mermaid")
  ) {
    const diagramBlock = `## 🔍 Visual: ${visual.type}\n\n\`\`\`mermaid\n${visual.mermaidCode}\n\`\`\`\n\n---\n\n`;
    aiContent = diagramBlock + aiContent;
  }

  // ------------------------------------------------------------------
  // STEP 7: Determine effective subject (AI detected or local)
  // ------------------------------------------------------------------

  const effectiveSubject =
    subjectAnalysis.subject !== "General"
      ? subjectAnalysis.subject
      : null;

  // ------------------------------------------------------------------
  // STEP 8: Persist both messages to DB
  // ------------------------------------------------------------------

  const [userMessage] = await db
    .insert(messagesTable)
    .values({
      sessionId,
      role: "user",
      content,
      subject: effectiveSubject,
      hasVisual: false,
    })
    .returning();

  const [assistantMessage] = await db
    .insert(messagesTable)
    .values({
      sessionId,
      role: "assistant",
      content: aiContent,
      subject: effectiveSubject,
      hasVisual: visual.shouldShow,
    })
    .returning();

  // ------------------------------------------------------------------
  // STEP 9: Update session metadata
  // ------------------------------------------------------------------

  await db
    .update(sessionsTable)
    .set({
      messageCount: sql`${sessionsTable.messageCount} + 2`,
      subject: effectiveSubject ?? undefined,
    })
    .where(eq(sessionsTable.id, sessionId));

  // ------------------------------------------------------------------
  // STEP 10: Non-blocking memory update (fire-and-forget)
  // ------------------------------------------------------------------

  updateMemoryAfterChat({
    subject: subjectAnalysis.subject !== "General" ? subjectAnalysis.subject : null,
    topicHint: subjectAnalysis.topicHint,
    language: language.language,
    questionType: subjectAnalysis.questionType,
    difficulty: subjectAnalysis.difficulty,
  }).catch(err => {
    console.error("[Aethera Chat] Memory update failed (non-fatal):", err);
  });

  // ------------------------------------------------------------------
  // STEP 11: Return response (existing API contract preserved)
  // ------------------------------------------------------------------

  res.json(
    SendChatResponse.parse({
      userMessage,
      assistantMessage,
      sessionId,
      detectedSubject: effectiveSubject,
    })
  );
});

export default router;
