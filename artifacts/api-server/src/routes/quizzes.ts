import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, quizzesTable } from "@workspace/db";
import {
  ListQuizzesResponse,
  CreateQuizBody,
  CreateQuizResponse,
  SubmitQuizParams,
  SubmitQuizBody,
  SubmitQuizResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const DEMO_USER_ID = 1;

function generateQuestions(topic: string, difficulty: string, count: number) {
  const questions = [];
  const baseQuestions: Record<string, Array<{ question: string; options: string[]; correctAnswer: string; explanation: string }>> = {
    Mathematics: [
      {
        question: "What is the value of x in the equation 2x + 6 = 14?",
        options: ["2", "4", "6", "8"],
        correctAnswer: "4",
        explanation: "Subtract 6 from both sides: 2x = 8, then divide by 2: x = 4"
      },
      {
        question: "What is the area of a circle with radius 5 cm? (Use π ≈ 3.14)",
        options: ["31.4 cm²", "78.5 cm²", "15.7 cm²", "157 cm²"],
        correctAnswer: "78.5 cm²",
        explanation: "Area = πr² = 3.14 × 5² = 3.14 × 25 = 78.5 cm²"
      },
      {
        question: "Simplify: 3x + 2y - x + 5y",
        options: ["2x + 7y", "4x + 3y", "2x + 3y", "4x + 7y"],
        correctAnswer: "2x + 7y",
        explanation: "Combine like terms: (3x - x) + (2y + 5y) = 2x + 7y"
      },
    ],
    Physics: [
      {
        question: "What is the SI unit of force?",
        options: ["Joule", "Newton", "Pascal", "Watt"],
        correctAnswer: "Newton",
        explanation: "Force is measured in Newtons (N), named after Sir Isaac Newton"
      },
      {
        question: "If velocity = 60 m/s and time = 3 s, what is the distance covered?",
        options: ["20 m", "180 m", "63 m", "57 m"],
        correctAnswer: "180 m",
        explanation: "Distance = velocity × time = 60 × 3 = 180 m"
      },
    ],
    Chemistry: [
      {
        question: "What is the chemical symbol for water?",
        options: ["HO", "H2O", "H2O2", "OH"],
        correctAnswer: "H2O",
        explanation: "Water consists of 2 hydrogen atoms and 1 oxygen atom: H2O"
      },
      {
        question: "What is the atomic number of Carbon?",
        options: ["4", "6", "8", "12"],
        correctAnswer: "6",
        explanation: "Carbon has 6 protons, giving it atomic number 6"
      },
    ],
  };

  const topicQuestions = baseQuestions[topic] || baseQuestions["Mathematics"];
  for (let i = 0; i < Math.min(count, topicQuestions.length); i++) {
    questions.push({ id: i + 1, ...topicQuestions[i] });
  }

  // Fill remaining with generic questions
  while (questions.length < count) {
    const idx: number = questions.length + 1;
    questions.push({
      id: idx,
      question: `${topic} question ${idx}: What is the fundamental principle described in concept ${idx}?`,
      options: ["Option A - First principle", "Option B - Second principle", "Option C - Third principle", "Option D - Fourth principle"],
      correctAnswer: "Option A - First principle",
      explanation: `The first principle is the foundational concept in ${topic} that explains this phenomenon.`
    });
  }

  return questions;
}

router.get("/quizzes", async (_req, res): Promise<void> => {
  const quizzes = await db
    .select()
    .from(quizzesTable)
    .where(eq(quizzesTable.userId, DEMO_USER_ID))
    .orderBy(desc(quizzesTable.createdAt));
  res.json(ListQuizzesResponse.parse(quizzes));
});

router.post("/quizzes", async (req, res): Promise<void> => {
  const parsed = CreateQuizBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const questionCount = parsed.data.questionCount ?? 3;
  const questions = generateQuestions(parsed.data.topic, parsed.data.difficulty, questionCount);

  const [quiz] = await db
    .insert(quizzesTable)
    .values({
      userId: DEMO_USER_ID,
      topic: parsed.data.topic,
      difficulty: parsed.data.difficulty,
      questions,
      completed: false,
    })
    .returning();

  res.status(201).json(CreateQuizResponse.parse(quiz));
});

router.post("/quizzes/:id/submit", async (req, res): Promise<void> => {
  const params = SubmitQuizParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = SubmitQuizBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [quiz] = await db
    .select()
    .from(quizzesTable)
    .where(eq(quizzesTable.id, params.data.id));

  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }

  const questions = quiz.questions as Array<{ id: number; correctAnswer: string }>;
  const answers = parsed.data.answers;
  let correct = 0;

  for (const answer of answers) {
    const question = questions.find((q) => q.id === answer.questionId);
    if (question && question.correctAnswer === answer.answer) {
      correct++;
    }
  }

  const total = questions.length;
  const percentage = total > 0 ? (correct / total) * 100 : 0;

  let feedback = "";
  if (percentage >= 90) feedback = "Outstanding! You have mastered this topic!";
  else if (percentage >= 70) feedback = "Great work! You have a solid understanding. Review the questions you missed.";
  else if (percentage >= 50) feedback = "Good effort! Focus on the concepts behind the questions you missed.";
  else feedback = "Keep practicing! Review the topic and try again — every attempt builds knowledge.";

  await db
    .update(quizzesTable)
    .set({ score: correct, completed: true })
    .where(eq(quizzesTable.id, params.data.id));

  res.json(
    SubmitQuizResponse.parse({
      quizId: params.data.id,
      score: correct,
      total,
      percentage,
      feedback,
    })
  );
});

export default router;
