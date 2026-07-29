import { Router, type IRouter } from "express";
import { eq, count, avg, desc } from "drizzle-orm";
import { db, sessionsTable, messagesTable, quizzesTable } from "@workspace/db";
import {
  GetDashboardSummaryResponse,
  GetRecentActivityResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const DEMO_USER_ID = 1;

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [sessionCount] = await db
    .select({ count: count() })
    .from(sessionsTable)
    .where(eq(sessionsTable.userId, DEMO_USER_ID));

  const [messageCount] = await db
    .select({ count: count() })
    .from(messagesTable)
    .innerJoin(sessionsTable, eq(messagesTable.sessionId, sessionsTable.id))
    .where(eq(sessionsTable.userId, DEMO_USER_ID));

  const [quizStats] = await db
    .select({ count: count(), avg: avg(quizzesTable.score) })
    .from(quizzesTable)
    .where(eq(quizzesTable.userId, DEMO_USER_ID));

  const completedQuizzes = await db
    .select()
    .from(quizzesTable)
    .where(eq(quizzesTable.userId, DEMO_USER_ID));

  const completedCount = completedQuizzes.filter((q) => q.completed).length;
  const scores = completedQuizzes.filter((q) => q.score != null).map((q) => q.score as number);
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

  // Get top subjects from sessions
  const sessions = await db
    .select({ subject: sessionsTable.subject })
    .from(sessionsTable)
    .where(eq(sessionsTable.userId, DEMO_USER_ID))
    .orderBy(desc(sessionsTable.updatedAt));

  const subjectCounts: Record<string, number> = {};
  for (const s of sessions) {
    if (s.subject) {
      subjectCounts[s.subject] = (subjectCounts[s.subject] || 0) + 1;
    }
  }
  const topSubjects = Object.entries(subjectCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([subject]) => subject);

  res.json(
    GetDashboardSummaryResponse.parse({
      totalSessions: sessionCount?.count ?? 0,
      totalMessages: messageCount?.count ?? 0,
      quizzesCompleted: completedCount,
      averageQuizScore: avgScore,
      topSubjects,
      learningStreak: Math.min(7, (sessionCount?.count ?? 0)),
    })
  );
});

router.get("/dashboard/activity", async (_req, res): Promise<void> => {
  const sessions = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.userId, DEMO_USER_ID))
    .orderBy(desc(sessionsTable.createdAt))
    .limit(5);

  const quizzes = await db
    .select()
    .from(quizzesTable)
    .where(eq(quizzesTable.userId, DEMO_USER_ID))
    .orderBy(desc(quizzesTable.createdAt))
    .limit(5);

  const sessionItems = sessions.map((s) => ({
    id: s.id,
    type: "session" as const,
    title: s.title,
    subject: s.subject,
    score: null,
    createdAt: s.createdAt.toISOString(),
  }));

  const quizItems = quizzes.map((q) => ({
    id: q.id,
    type: "quiz" as const,
    title: `${q.topic} Quiz (${q.difficulty})`,
    subject: q.topic,
    score: q.score,
    createdAt: q.createdAt.toISOString(),
  }));

  const allItems = [...sessionItems, ...quizItems]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  res.json(GetRecentActivityResponse.parse(allItems));
});

export default router;
