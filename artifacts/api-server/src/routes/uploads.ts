import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, uploadsTable } from "@workspace/db";
import {
  CreateUploadBody,
  CreateUploadResponse,
  ListUploadsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const DEMO_USER_ID = 1;

router.post("/uploads", async (req, res): Promise<void> => {
  const parsed = CreateUploadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Simulate OCR processing
  const simulatedOcrText = parsed.data.type === "image"
    ? "Extracted text from image: Question 4. Find the value of x if 2x + 5 = 13."
    : "Extracted text from PDF: Chapter 3 - Quadratic Equations. A quadratic equation is of the form ax² + bx + c = 0.";

  const [upload] = await db
    .insert(uploadsTable)
    .values({
      userId: DEMO_USER_ID,
      type: parsed.data.type,
      storageUrl: parsed.data.storageUrl,
      ocrText: simulatedOcrText,
      confidence: 0.92,
    })
    .returning();

  res.status(201).json(CreateUploadResponse.parse(upload));
});

router.get("/uploads", async (_req, res): Promise<void> => {
  const uploads = await db
    .select()
    .from(uploadsTable)
    .where(eq(uploadsTable.userId, DEMO_USER_ID))
    .orderBy(desc(uploadsTable.createdAt));
  res.json(ListUploadsResponse.parse(uploads));
});

export default router;
