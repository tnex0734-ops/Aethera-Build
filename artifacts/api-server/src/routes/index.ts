import { Router, type IRouter } from "express";
import healthRouter from "./health";
import sessionsRouter from "./sessions";
import chatRouter from "./chat";
import uploadsRouter from "./uploads";
import memoryRouter from "./memory";
import quizzesRouter from "./quizzes";
import profileRouter from "./profile";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(sessionsRouter);
router.use(chatRouter);
router.use(uploadsRouter);
router.use(memoryRouter);
router.use(quizzesRouter);
router.use(profileRouter);
router.use(dashboardRouter);

export default router;
