import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, sessionsTable, messagesTable, learningMemoryTable } from "@workspace/db";
import {
  SendChatBody,
  SendChatResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const DEMO_USER_ID = 1;

const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology", "History", "English", "Computer Science", "Geography"];

function detectSubject(content: string): string | null {
  const lower = content.toLowerCase();
  if (/\b(math|algebra|equation|calculus|geometry|trigonometry|integral|derivative|vector|matrix)\b/.test(lower)) return "Mathematics";
  if (/\b(physics|force|velocity|acceleration|newton|gravity|energy|momentum|wave|optic|electric|magnetic)\b/.test(lower)) return "Physics";
  if (/\b(chemistry|atom|molecule|reaction|element|compound|acid|base|bond|periodic|organic|chemical)\b/.test(lower)) return "Chemistry";
  if (/\b(biology|cell|dna|gene|protein|evolution|organism|photosynthesis|mitosis|ecosystem|species)\b/.test(lower)) return "Biology";
  if (/\b(history|war|empire|revolution|civilization|century|ancient|medieval|colonial|independence)\b/.test(lower)) return "History";
  if (/\b(english|grammar|essay|poem|novel|literature|vocabulary|sentence|paragraph|author|write)\b/.test(lower)) return "English";
  if (/\b(computer|algorithm|program|code|software|data structure|loop|function|class|variable|python|java)\b/.test(lower)) return "Computer Science";
  if (/\b(geography|continent|country|capital|climate|river|mountain|ocean|population|map|latitude)\b/.test(lower)) return "Geography";
  return null;
}

function generateEducationalResponse(question: string, subject: string | null): string {
  const subjectLabel = subject || "this topic";

  const responses = [
    `Great question! Let me walk you through ${subjectLabel} step by step.\n\n**Understanding the concept:**\nThis is a fundamental topic that builds the foundation for more advanced study. The key idea here is to break down the problem into smaller, manageable parts.\n\n**Step-by-step explanation:**\n1. First, identify what is being asked\n2. Recall the relevant principles or formulas\n3. Apply them systematically\n4. Check your answer makes sense\n\n**Example:**\nLet's work through a concrete example to make this clearer. Suppose we start with the basics and build up our understanding gradually.\n\n**Practice question:**\nTry this: Apply the same approach to a similar problem and see if you can solve it independently.\n\n**Summary:**\nThe key takeaway from ${subjectLabel} is that consistent practice and understanding the "why" behind each step leads to mastery.`,
    
    `Excellent question about ${subjectLabel}! Here's a thorough explanation:\n\n**Core Concept:**\nAt its heart, this question touches on one of the most important ideas in ${subjectLabel}. Understanding this will unlock many related concepts.\n\n**Detailed Explanation:**\nLet me break this down systematically:\n- Start with the foundational principle\n- See how it applies in context\n- Understand the exceptions and edge cases\n\n**Visual Diagram (conceptual):**\n[Concept A] → [Process] → [Result B]\n\nThis flow shows how the pieces connect.\n\n**Real-world Connection:**\nThis concept appears in everyday life when you encounter situations where ${subjectLabel} principles are at work.\n\n**Quiz yourself:**\nCan you explain this concept in your own words? That's the best test of understanding!`,
    
    `That's a thoughtful question! Let me explain ${subjectLabel} clearly.\n\n**Why this matters:**\nThis is a key concept that you'll encounter many times in your studies. Getting a solid grasp now will pay dividends later.\n\n**The explanation:**\nHere's how to think about it: imagine you're approaching this problem for the first time. The first thing to notice is the relationship between the given information and what you need to find.\n\n**Key formula/principle:**\n> The fundamental principle states that all related quantities are connected through a consistent relationship.\n\n**Worked example:**\nGiven the information in your question, here's how we'd approach a solution:\n1. Identify knowns and unknowns\n2. Choose the right approach\n3. Execute step by step\n4. Verify the result\n\n**Remember:**\nUnderstanding beats memorization every time. If you understand the "why," the "how" becomes intuitive.`,
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

router.post("/chat", async (req, res): Promise<void> => {
  const parsed = SendChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { content, sessionId } = parsed.data;

  // Detect subject from the message
  const detectedSubject = detectSubject(content);

  // Save user message
  const [userMessage] = await db
    .insert(messagesTable)
    .values({
      sessionId,
      role: "user",
      content,
      subject: detectedSubject,
      hasVisual: false,
    })
    .returning();

  // Generate AI response
  const aiContent = generateEducationalResponse(content, detectedSubject);

  // Save assistant message
  const [assistantMessage] = await db
    .insert(messagesTable)
    .values({
      sessionId,
      role: "assistant",
      content: aiContent,
      subject: detectedSubject,
      hasVisual: false,
    })
    .returning();

  // Update session message count and subject
  await db
    .update(sessionsTable)
    .set({
      messageCount: sql`${sessionsTable.messageCount} + 2`,
      subject: detectedSubject ?? undefined,
    })
    .where(eq(sessionsTable.id, sessionId));

  // Update learning memory if subject detected
  if (detectedSubject) {
    const [memory] = await db
      .select()
      .from(learningMemoryTable)
      .where(eq(learningMemoryTable.userId, DEMO_USER_ID));

    if (memory) {
      const existingTopics = memory.strongTopics || [];
      if (!existingTopics.includes(detectedSubject)) {
        await db
          .update(learningMemoryTable)
          .set({
            strongTopics: [...existingTopics, detectedSubject],
          })
          .where(eq(learningMemoryTable.userId, DEMO_USER_ID));
      }
    }
  }

  res.json(
    SendChatResponse.parse({
      userMessage,
      assistantMessage,
      sessionId,
      detectedSubject,
    })
  );
});

export default router;
