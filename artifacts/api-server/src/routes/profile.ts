import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  GetProfileResponse,
  UpdateProfileBody,
  UpdateProfileResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const DEMO_USER_ID = 1;

async function ensureProfileExists() {
  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, DEMO_USER_ID));

  if (!existing) {
    const [created] = await db
      .insert(usersTable)
      .values({
        name: "Demo Student",
        email: "student@aethera.app",
        grade: "Grade 10",
        preferredLanguage: "en",
      })
      .returning();
    return created;
  }
  return existing;
}

router.get("/profile", async (_req, res): Promise<void> => {
  const profile = await ensureProfileExists();
  res.json(GetProfileResponse.parse(profile));
});

router.patch("/profile", async (req, res): Promise<void> => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await ensureProfileExists();

  const [profile] = await db
    .update(usersTable)
    .set(parsed.data)
    .where(eq(usersTable.id, DEMO_USER_ID))
    .returning();

  res.json(UpdateProfileResponse.parse(profile));
});

export default router;
