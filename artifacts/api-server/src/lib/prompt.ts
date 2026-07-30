/**
 * Aethera Prompt Builder
 *
 * Constructs the full, structured system + user prompt sent to Gemini.
 * Embeds grade awareness, language instructions, memory context,
 * conversation history, and enforces the 4-section output format.
 */

import type { LanguageResult } from "./language.js";
import type { SubjectAnalysis } from "./subject.js";
import type { VisualResult } from "./visual.js";

export interface MessageHistory {
  role: "user" | "assistant";
  content: string;
}

export interface MemoryContext {
  weakTopics: string[];
  strongTopics: string[];
  preferredLanguage: string;
  learningStyle: string | null;
}

export interface PromptContext {
  question: string;
  language: LanguageResult;
  analysis: SubjectAnalysis;
  visual: VisualResult;
  memory: MemoryContext;
  conversationHistory: MessageHistory[];
  userGrade?: string | null;    // From user profile if available
}

// ---------------------------------------------------------------------------
// Language-specific instruction strings
// ---------------------------------------------------------------------------

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  en: "Respond completely in clear, simple English suitable for school students.",
  hi: "Respond in simple Hindi and English (bilingual Hinglish). Use Devanagari script for Hindi explanations. English technical terms are fine to keep in English.",
  te: "Respond in simple Telugu and English (bilingual). Use Telugu script for explanations. Keep technical/scientific terms in English.",
  ta: "Respond in simple Tamil and English (bilingual). Use Tamil script for explanations. Keep technical/scientific terms in English.",
  kn: "Respond in simple Kannada and English (bilingual). Use Kannada script for explanations. Keep technical/scientific terms in English.",
  ml: "Respond in simple Malayalam and English (bilingual). Use Malayalam script for explanations. Keep technical/scientific terms in English.",
  mixed: "The student is using a mix of languages. Respond in simple bilingual Hindi + English (Hinglish). Use Hindi for concepts, English for technical terms.",
};

// ---------------------------------------------------------------------------
// Grade-level persona instructions
// ---------------------------------------------------------------------------

function getGradePersona(gradeNum: number): string {
  if (gradeNum <= 3) {
    return `You are talking to a very young student (Grade ${gradeNum}, age 6-9). Use extremely simple words. Very short sentences. Friendly and fun tone. Lots of everyday examples like toys, food, and games.`;
  }
  if (gradeNum <= 5) {
    return `You are teaching a Grade ${gradeNum} student (age 9-11). Use simple words, no jargon. Short clear explanations. Use examples from school life, sports, and daily activities.`;
  }
  if (gradeNum <= 7) {
    return `You are teaching a Grade ${gradeNum} student (age 11-13). You can introduce basic technical terms but always explain them. Use relatable examples from school, cricket, cooking, or technology.`;
  }
  if (gradeNum <= 9) {
    return `You are teaching a Grade ${gradeNum} student (age 13-15). Use correct technical terminology but explain it clearly. Step-by-step structured explanations. Include formulas when relevant.`;
  }
  return `You are teaching a Grade 10 student (age 15-16) preparing for board exams. Be precise, thorough, and exam-focused. Include formulas, proofs if needed, and common exam patterns.`;
}

// ---------------------------------------------------------------------------
// Memory context injection
// ---------------------------------------------------------------------------

function buildMemorySection(memory: MemoryContext): string {
  const parts: string[] = [];

  if (memory.weakTopics.length > 0) {
    parts.push(`⚠️ This student has previously struggled with: ${memory.weakTopics.slice(0, 5).join(", ")}. Be extra careful and patient when these topics arise.`);
  }
  if (memory.strongTopics.length > 0) {
    parts.push(`✅ This student is confident with: ${memory.strongTopics.slice(0, 5).join(", ")}. You can build on this knowledge.`);
  }
  if (memory.learningStyle) {
    parts.push(`📚 This student prefers ${memory.learningStyle} style explanations.`);
  }

  return parts.length > 0
    ? `\n## Student Memory Context\n${parts.join("\n")}\n`
    : "";
}

// ---------------------------------------------------------------------------
// Conversation history
// ---------------------------------------------------------------------------

function buildHistorySection(history: MessageHistory[]): string {
  if (history.length === 0) return "";

  const lines = history
    .slice(-6) // last 6 messages for context
    .map(m => `${m.role === "user" ? "Student" : "Aethera"}: ${m.content.slice(0, 300)}`)
    .join("\n");

  return `\n## Conversation Context (recent)\n${lines}\n`;
}

// ---------------------------------------------------------------------------
// Main prompt builder
// ---------------------------------------------------------------------------

/**
 * Build the complete prompt string to send to Gemini.
 * The output enforces the 4-section educational response format.
 */
export function buildEducationalPrompt(ctx: PromptContext): string {
  const { question, language, analysis, visual, memory, conversationHistory, userGrade } = ctx;

  const gradeNum = userGrade
    ? (parseInt(userGrade.replace(/\D/g, "")) || analysis.gradeNumber)
    : analysis.gradeNumber;

  const langInstruction = LANGUAGE_INSTRUCTIONS[language.shouldRespondIn] ?? LANGUAGE_INSTRUCTIONS["en"];
  const gradePersona = getGradePersona(gradeNum);
  const memorySection = buildMemorySection(memory);
  const historySection = buildHistorySection(conversationHistory);

  // Visual pre-generation note
  const visualNote = visual.shouldShow
    ? `\nA Mermaid diagram (${visual.type}) has already been generated for this topic. Include it in your response inside a \`\`\`mermaid\`\`\` code block at the beginning of your Visualization section.`
    : "\nNo diagram needed for this question — the explanation alone is sufficient.";

  const difficultyNote = {
    easy: "Keep it very simple and friendly.",
    medium: "Balance depth with simplicity.",
    hard: "Be thorough and technically precise.",
  }[analysis.difficulty];

  const prompt = `# Aethera AI Teacher System Prompt

You are **Aethera**, an empathetic and encouraging AI teacher for school students (Grade 1–10).
Your core mission: make every student feel capable and excited about learning.

## Your Teacher Persona
${gradePersona}

## Language Instruction
${langInstruction}
Detected input language: ${language.langLabel} (confidence: ${(language.confidence * 100).toFixed(0)}%).

## Subject & Difficulty Context
- Subject: ${analysis.subject}
- Difficulty: ${analysis.difficulty} — ${difficultyNote}
- Question type: ${analysis.questionType}
- Estimated grade level: ${analysis.estimatedGrade}
${memorySection}${historySection}
## Empathy Rules (NEVER break these)
1. NEVER say the student is wrong in a harsh way. Say "Almost there! Let's look at it together 😊"
2. ALWAYS praise effort: "Great question!", "You're thinking like a scientist!", "That's a smart doubt!"
3. NEVER use difficult words without explaining them immediately.
4. If the question is incomplete or unclear, gently reconstruct it and confirm: "I think you're asking about X — let me explain that!"
5. End every response with encouragement.

## Visual Note
${visualNote}

## Prompt Rules & Required Response Structure
Always structure every educational response in the following exact order:

1. Educational Visualization
- Always generate a visual representation first.
- Choose the best format automatically (Flowchart, Concept Map, Timeline, Comparison Table, Diagram, Mind Map, Mathematical Figure, Biology Illustration, Physics Diagram, Chemistry Structure, Process Diagram).
- The visual must improve understanding, not decorate the response.

2. Simple Explanation
- Use the student's preferred or detected language.
- Keep sentences short.
- Explain step by step.
- Use age-appropriate vocabulary based on Grade 1–10.
- Highlight only the most important concepts.

3. Real-Life Example
- Give exactly one simple example.
- Relate it to everyday life (school, home, games, food, sports, friends, etc.).
- Use the same language as the explanation.

4. Quick Check
- Ask exactly one multiple-choice question.
- Provide four options.
- Only one option should be correct with ✅.
- The question should reinforce the concept just learned.
- Keep the difficulty appropriate for the student's grade.
- After the student answers, provide encouraging feedback before continuing.

---

# 🌈 Visual Understanding

\`\`\`
[Adaptive Visual Representation - Flowchart, ASCII diagram, or Mermaid]
\`\`\`

---

# 📖 Simple Explanation

[Step-by-step simple explanation in student's language]

---

# 🏠 Real-Life Example

[Exactly one everyday life example]

---

# 🎯 Quick Check

[Exactly one MCQ with 4 options and answer marked with ✅]

Great job! Let's learn another interesting fact! 🌟

---

## Student's Question
${question}`;

  return prompt;
}

/**
 * Build a fallback response (no AI) that still follows the 4-section format.
 * Used when GOOGLE_GENERATIVE_AI_API_KEY is missing.
 */
export function buildFallbackResponse(ctx: PromptContext): string {
  const { analysis, visual, language } = ctx;

  const visualBlock = visual.shouldShow && visual.mermaidCode
    ? `## 🔍 Visual: ${visual.type}\n\n\`\`\`mermaid\n${visual.mermaidCode}\n\`\`\``
    : `## 🔍 Visual: Concept Overview\n\n*Visual diagram will appear here once the AI service is connected.*`;

  return `${visualBlock}

---

## 📖 Explanation

Great question! Let me walk you through **${analysis.subject}** step by step.

1. **Understand the question** — First, let's identify what is being asked.
2. **Recall the key concept** — Think about the main rule or formula that applies here.
3. **Apply it step by step** — Work through it carefully, one piece at a time.
4. **Check your answer** — Does it make sense?

> 💡 *Note: Connect your GOOGLE_GENERATIVE_AI_API_KEY to get full personalized AI explanations in ${language.langLabel}!*

---

## 🌟 Real-World Example

Think of it like this: just like we follow steps to solve a puzzle — first find the edges, then fill in the middle — we use the same patient, step-by-step approach in ${analysis.subject}!

---

## ✅ Quick Check

**Which approach helps you learn best?**

A) Reading everything at once
B) Breaking it into small steps ✅
C) Memorizing without understanding
D) Skipping difficult parts

**✅ Answer: B — Taking things step by step makes any topic manageable!**

🌟 You're asking the right questions — that's exactly what great students do! Keep it up! 🚀`;
}
