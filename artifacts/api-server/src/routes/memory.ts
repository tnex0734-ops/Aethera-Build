import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, learningMemoryTable, usersTable } from "@workspace/db";
import {
  GetMemoryResponse,
  UpdateMemoryBody,
  UpdateMemoryResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const DEMO_USER_ID = 1;

async function ensureMemoryExists() {
  const [existing] = await db
    .select()
    .from(learningMemoryTable)
    .where(eq(learningMemoryTable.userId, DEMO_USER_ID));

  if (!existing) {
    const [created] = await db
      .insert(learningMemoryTable)
      .values({
        userId: DEMO_USER_ID,
        weakTopics: [],
        strongTopics: [],
        preferredLanguage: "en",
      })
      .returning();
    return created;
  }
  return existing;
}

router.get("/memory", async (_req, res): Promise<void> => {
  const memory = await ensureMemoryExists();
  res.json(GetMemoryResponse.parse(memory));
});

router.patch("/memory", async (req, res): Promise<void> => {
  const parsed = UpdateMemoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await ensureMemoryExists();

  const [memory] = await db
    .update(learningMemoryTable)
    .set(parsed.data)
    .where(eq(learningMemoryTable.userId, DEMO_USER_ID))
    .returning();

  res.json(UpdateMemoryResponse.parse(memory));
});

export default router;
