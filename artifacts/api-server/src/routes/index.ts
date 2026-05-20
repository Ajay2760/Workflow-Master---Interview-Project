import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import requestsRouter from "./requests";
import workflowTemplatesRouter from "./workflow-templates";
import commentsRouter from "./comments";
import notificationsRouter from "./notifications";
import auditLogRouter from "./audit-log";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(requestsRouter);
router.use(workflowTemplatesRouter);
router.use(commentsRouter);
router.use(notificationsRouter);
router.use(auditLogRouter);
router.use(dashboardRouter);

export default router;
