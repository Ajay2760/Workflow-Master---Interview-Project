import { Router } from "express";
import {
  db, requestsTable, usersTable, approvalStepsTable,
  commentsTable, auditLogTable, notificationsTable, workflowTemplatesTable
} from "@workspace/db";
import { eq, and, ilike, SQL, desc, count } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import {
  CreateRequestBody, UpdateRequestBody,
  ApproveRequestBody, RejectRequestBody
} from "@workspace/api-zod";

const router = Router();

function formatUser(user: typeof usersTable.$inferSelect | null | undefined) {
  if (!user) return null;
  const { passwordHash: _, updatedAt: _u, ...rest } = user;
  return { ...rest, avatarUrl: rest.avatarUrl ?? null, createdAt: rest.createdAt.toISOString() };
}

async function getUserById(id: number | null | undefined) {
  if (!id) return null;
  const [u] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  return u ? formatUser(u) : null;
}

function formatRequest(r: typeof requestsTable.$inferSelect, submittedBy: ReturnType<typeof formatUser>, assignedTo: ReturnType<typeof formatUser> = null) {
  return {
    ...r,
    description: r.description ?? null,
    assignedToId: r.assignedToId ?? null,
    workflowTemplateId: r.workflowTemplateId ?? null,
    currentStepOrder: r.currentStepOrder ?? null,
    totalSteps: r.totalSteps ?? null,
    dueDate: r.dueDate ? r.dueDate.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    submittedBy,
    assignedTo,
  };
}

async function logAudit(requestId: number | null, action: string, performedById: number, details?: string) {
  await db.insert(auditLogTable).values({ requestId, action, performedById, details: details ?? null });
}

async function createNotification(userId: number, message: string, type: string, requestId: number | null) {
  await db.insert(notificationsTable).values({ userId, message, type, requestId, isRead: false });
}

router.get("/requests", requireAuth, async (req, res) => {
  const user = (req as any).user as typeof usersTable.$inferSelect;
  const { status, type, priority, submittedBy, assignedTo, search, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, parseInt(limit) || 20);
  const offset = (pageNum - 1) * limitNum;

  const conditions: SQL[] = [];
  // Employees only see their own requests
  if (user.role === "employee") {
    conditions.push(eq(requestsTable.submittedById, user.id));
  } else if (submittedBy) {
    conditions.push(eq(requestsTable.submittedById, parseInt(submittedBy)));
  }
  if (status) conditions.push(eq(requestsTable.status, status));
  if (type) conditions.push(eq(requestsTable.type, type));
  if (priority) conditions.push(eq(requestsTable.priority, priority));
  if (assignedTo) conditions.push(eq(requestsTable.assignedToId, parseInt(assignedTo)));
  if (search) conditions.push(ilike(requestsTable.title, `%${search}%`));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult, rows] = await Promise.all([
    db.select({ count: count() }).from(requestsTable).where(whereClause),
    db.select().from(requestsTable).where(whereClause).orderBy(desc(requestsTable.createdAt)).limit(limitNum).offset(offset),
  ]);

  // Fetch all relevant users
  const allUsers = await db.select().from(usersTable);
  const userMap = new Map(allUsers.map(u => [u.id, u]));

  const data = rows.map(r => formatRequest(r, formatUser(userMap.get(r.submittedById) ?? null), formatUser(r.assignedToId ? userMap.get(r.assignedToId) : null)));

  res.json({ data, total: Number(totalResult[0]?.count ?? 0), page: pageNum, limit: limitNum });
});

router.post("/requests", requireAuth, async (req, res) => {
  const user = (req as any).user as typeof usersTable.$inferSelect;
  const parsed = CreateRequestBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const { title, description, type, priority, workflowTemplateId, dueDate } = parsed.data;

  // Determine total steps from workflow template
  let totalSteps = 1;
  if (workflowTemplateId) {
    const [template] = await db.select().from(workflowTemplatesTable).where(eq(workflowTemplatesTable.id, workflowTemplateId));
    if (template) {
      const steps = (template.steps as any[]) || [];
      totalSteps = steps.length || 1;
    }
  }

  const [request] = await db.insert(requestsTable).values({
    title,
    description: description ?? null,
    type,
    priority,
    status: "pending",
    submittedById: user.id,
    workflowTemplateId: workflowTemplateId ?? null,
    currentStepOrder: 1,
    totalSteps,
    dueDate: dueDate ? new Date(dueDate) : null,
  }).returning();

  // Create approval steps from workflow template
  if (workflowTemplateId) {
    const [template] = await db.select().from(workflowTemplatesTable).where(eq(workflowTemplatesTable.id, workflowTemplateId));
    if (template) {
      const steps = (template.steps as any[]) || [];
      if (steps.length > 0) {
        await db.insert(approvalStepsTable).values(
          steps.map((s: any) => ({
            requestId: request.id,
            stepOrder: s.stepOrder,
            approverRole: s.approverRole,
            status: "pending",
          }))
        );
      }
    }
  } else {
    // Default: manager approves
    await db.insert(approvalStepsTable).values({
      requestId: request.id,
      stepOrder: 1,
      approverRole: "manager",
      status: "pending",
    });
  }

  // Notify managers
  const managers = await db.select().from(usersTable).where(eq(usersTable.role, "manager"));
  for (const m of managers) {
    await createNotification(m.id, `New request "${title}" requires your approval`, "approval_needed", request.id);
  }

  await logAudit(request.id, "request_created", user.id, `Request "${title}" created`);

  res.status(201).json(formatRequest(request, formatUser(user)));
});

router.get("/requests/:requestId", requireAuth, async (req, res) => {
  const requestId = parseInt(req.params.requestId as string);
  if (isNaN(requestId)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [request] = await db.select().from(requestsTable).where(eq(requestsTable.id, requestId));
  if (!request) { res.status(404).json({ error: "Request not found" }); return; }

  const [submittedByUser, assignedToUser, steps, comments, auditLogs] = await Promise.all([
    db.select().from(usersTable).where(eq(usersTable.id, request.submittedById)).then(r => r[0]),
    request.assignedToId ? db.select().from(usersTable).where(eq(usersTable.id, request.assignedToId)).then(r => r[0]) : Promise.resolve(null),
    db.select().from(approvalStepsTable).where(eq(approvalStepsTable.requestId, requestId)).orderBy(approvalStepsTable.stepOrder),
    db.select().from(commentsTable).where(eq(commentsTable.requestId, requestId)).orderBy(commentsTable.createdAt),
    db.select().from(auditLogTable).where(eq(auditLogTable.requestId, requestId)).orderBy(desc(auditLogTable.createdAt)),
  ]);

  // Fetch approver users for steps
  const allUsers = await db.select().from(usersTable);
  const userMap = new Map(allUsers.map(u => [u.id, u]));

  const formattedSteps = steps.map(s => ({
    ...s,
    comment: s.comment ?? null,
    approverId: s.approverId ?? null,
    decidedAt: s.decidedAt ? s.decidedAt.toISOString() : null,
    createdAt: s.createdAt.toISOString(),
    approver: s.approverId ? formatUser(userMap.get(s.approverId) ?? null) : null,
  }));

  const formattedComments = comments.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    user: formatUser(userMap.get(c.userId) ?? null)!,
  }));

  const formattedAuditLogs = auditLogs.map(a => ({
    ...a,
    requestId: a.requestId ?? null,
    details: a.details ?? null,
    createdAt: a.createdAt.toISOString(),
    performedBy: formatUser(userMap.get(a.performedById) ?? null)!,
  }));

  res.json({
    ...formatRequest(request, formatUser(submittedByUser ?? null), formatUser(assignedToUser ?? null)),
    approvalSteps: formattedSteps,
    comments: formattedComments,
    auditLog: formattedAuditLogs,
  });
});

router.patch("/requests/:requestId", requireAuth, async (req, res) => {
  const user = (req as any).user as typeof usersTable.$inferSelect;
  const requestId = parseInt(req.params.requestId as string);
  if (isNaN(requestId)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const parsed = UpdateRequestBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const data: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.title !== undefined) data.title = parsed.data.title;
  if (parsed.data.description !== undefined) data.description = parsed.data.description;
  if (parsed.data.type !== undefined) data.type = parsed.data.type;
  if (parsed.data.priority !== undefined) data.priority = parsed.data.priority;
  if (parsed.data.status !== undefined) data.status = parsed.data.status;
  if (parsed.data.assignedToId !== undefined) data.assignedToId = parsed.data.assignedToId;
  if (parsed.data.dueDate !== undefined) data.dueDate = parsed.data.dueDate ? new Date(parsed.data.dueDate) : null;

  const [updated] = await db.update(requestsTable).set(data).where(eq(requestsTable.id, requestId)).returning();
  if (!updated) { res.status(404).json({ error: "Request not found" }); return; }

  await logAudit(requestId, "request_updated", user.id, `Request updated`);

  const submittedBy = await getUserById(updated.submittedById);
  const assignedTo = await getUserById(updated.assignedToId);
  res.json(formatRequest(updated, submittedBy, assignedTo));
});

router.delete("/requests/:requestId", requireAuth, async (req, res) => {
  const user = (req as any).user as typeof usersTable.$inferSelect;
  const requestId = parseInt(req.params.requestId as string);
  if (isNaN(requestId)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await logAudit(requestId, "request_deleted", user.id, `Request deleted`);
  await db.delete(requestsTable).where(eq(requestsTable.id, requestId));
  res.status(204).send();
});

router.post("/requests/:requestId/approve", requireAuth, async (req, res) => {
  const user = (req as any).user as typeof usersTable.$inferSelect;
  const requestId = parseInt(req.params.requestId as string);
  if (isNaN(requestId)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const parsed = ApproveRequestBody.safeParse(req.body);
  const comment = parsed.success ? parsed.data.comment : undefined;

  // Find the current pending step
  const [request] = await db.select().from(requestsTable).where(eq(requestsTable.id, requestId));
  if (!request) { res.status(404).json({ error: "Request not found" }); return; }

  const pendingSteps = await db.select().from(approvalStepsTable)
    .where(and(eq(approvalStepsTable.requestId, requestId), eq(approvalStepsTable.status, "pending")))
    .orderBy(approvalStepsTable.stepOrder);

  if (pendingSteps.length === 0) { res.status(400).json({ error: "No pending approval steps" }); return; }

  const currentStep = pendingSteps[0];
  const [updatedStep] = await db.update(approvalStepsTable)
    .set({ status: "approved", approverId: user.id, comment: comment ?? null, decidedAt: new Date() })
    .where(eq(approvalStepsTable.id, currentStep.id))
    .returning();

  // Check if all steps are approved
  const allSteps = await db.select().from(approvalStepsTable).where(eq(approvalStepsTable.requestId, requestId));
  const allApproved = allSteps.every(s => s.status === "approved");

  const nextStatus = allApproved ? "approved" : "in_review";
  const nextStepOrder = allApproved ? request.currentStepOrder : (request.currentStepOrder ?? 1) + 1;

  await db.update(requestsTable)
    .set({ status: nextStatus, currentStepOrder: nextStepOrder, updatedAt: new Date() })
    .where(eq(requestsTable.id, requestId));

  // Notify submitter
  await createNotification(
    request.submittedById,
    allApproved
      ? `Your request "${request.title}" has been fully approved`
      : `Your request "${request.title}" was approved at step ${currentStep.stepOrder}`,
    "status_changed",
    requestId
  );

  await logAudit(requestId, "request_approved", user.id, `Step ${currentStep.stepOrder} approved${comment ? `: ${comment}` : ""}`);

  res.json({
    ...updatedStep,
    comment: updatedStep.comment ?? null,
    approverId: updatedStep.approverId ?? null,
    decidedAt: updatedStep.decidedAt ? updatedStep.decidedAt.toISOString() : null,
    createdAt: updatedStep.createdAt.toISOString(),
    approver: formatUser(user),
  });
});

router.post("/requests/:requestId/reject", requireAuth, async (req, res) => {
  const user = (req as any).user as typeof usersTable.$inferSelect;
  const requestId = parseInt(req.params.requestId as string);
  if (isNaN(requestId)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const parsed = RejectRequestBody.safeParse(req.body);
  const comment = parsed.success ? parsed.data.comment : undefined;

  const [request] = await db.select().from(requestsTable).where(eq(requestsTable.id, requestId));
  if (!request) { res.status(404).json({ error: "Request not found" }); return; }

  const pendingSteps = await db.select().from(approvalStepsTable)
    .where(and(eq(approvalStepsTable.requestId, requestId), eq(approvalStepsTable.status, "pending")))
    .orderBy(approvalStepsTable.stepOrder);

  if (pendingSteps.length === 0) { res.status(400).json({ error: "No pending approval steps" }); return; }

  const currentStep = pendingSteps[0];
  const [updatedStep] = await db.update(approvalStepsTable)
    .set({ status: "rejected", approverId: user.id, comment: comment ?? null, decidedAt: new Date() })
    .where(eq(approvalStepsTable.id, currentStep.id))
    .returning();

  // Mark all remaining pending steps as skipped
  await db.update(approvalStepsTable)
    .set({ status: "skipped" })
    .where(and(eq(approvalStepsTable.requestId, requestId), eq(approvalStepsTable.status, "pending")));

  await db.update(requestsTable)
    .set({ status: "rejected", updatedAt: new Date() })
    .where(eq(requestsTable.id, requestId));

  await createNotification(
    request.submittedById,
    `Your request "${request.title}" has been rejected${comment ? `: ${comment}` : ""}`,
    "status_changed",
    requestId
  );

  await logAudit(requestId, "request_rejected", user.id, `Step ${currentStep.stepOrder} rejected${comment ? `: ${comment}` : ""}`);

  res.json({
    ...updatedStep,
    comment: updatedStep.comment ?? null,
    approverId: updatedStep.approverId ?? null,
    decidedAt: updatedStep.decidedAt ? updatedStep.decidedAt.toISOString() : null,
    createdAt: updatedStep.createdAt.toISOString(),
    approver: formatUser(user),
  });
});

export default router;
