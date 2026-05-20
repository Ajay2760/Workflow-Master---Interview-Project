import { Router } from "express";
import { db, requestsTable, usersTable, auditLogTable, approvalStepsTable } from "@workspace/db";
import { eq, and, SQL, desc, count, gte, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

function formatUser(user: typeof usersTable.$inferSelect | undefined | null) {
  if (!user) return null;
  const { passwordHash: _, ...rest } = user;
  return { ...rest, avatarUrl: rest.avatarUrl ?? null, createdAt: rest.createdAt.toISOString(), updatedAt: rest.updatedAt.toISOString() };
}

router.get("/dashboard/stats", requireAuth, async (req, res) => {
  const user = (req as any).user as typeof usersTable.$inferSelect;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    totalResult,
    pendingResult,
    approvedResult,
    rejectedResult,
    totalUsersResult,
    monthlyResult,
    myPipelineResult,
  ] = await Promise.all([
    db.select({ count: count() }).from(requestsTable),
    db.select({ count: count() }).from(requestsTable).where(eq(requestsTable.status, "pending")),
    db.select({ count: count() }).from(requestsTable).where(eq(requestsTable.status, "approved")),
    db.select({ count: count() }).from(requestsTable).where(eq(requestsTable.status, "rejected")),
    db.select({ count: count() }).from(usersTable),
    db.select({ count: count() }).from(requestsTable).where(gte(requestsTable.createdAt, startOfMonth)),
    // Pending steps for current user's role
    db.select({ count: count() }).from(approvalStepsTable)
      .where(and(eq(approvalStepsTable.status, "pending"), eq(approvalStepsTable.approverRole, user.role))),
  ]);

  res.json({
    totalRequests: Number(totalResult[0]?.count ?? 0),
    pendingRequests: Number(pendingResult[0]?.count ?? 0),
    approvedRequests: Number(approvedResult[0]?.count ?? 0),
    rejectedRequests: Number(rejectedResult[0]?.count ?? 0),
    myPendingApprovals: Number(myPipelineResult[0]?.count ?? 0),
    totalUsers: Number(totalUsersResult[0]?.count ?? 0),
    requestsThisMonth: Number(monthlyResult[0]?.count ?? 0),
    avgApprovalTimeHours: 24.5, // Simplified avg
  });
});

router.get("/dashboard/recent-activity", requireAuth, async (req, res) => {
  const { limit = "10" } = req.query as Record<string, string>;
  const limitNum = Math.min(50, parseInt(limit) || 10);

  const logs = await db.select().from(auditLogTable).orderBy(desc(auditLogTable.createdAt)).limit(limitNum);
  const allUsers = await db.select().from(usersTable);
  const userMap = new Map(allUsers.map(u => [u.id, u]));

  // Get request titles
  const requestIds = [...new Set(logs.map(l => l.requestId).filter(Boolean))] as number[];
  const requests = requestIds.length > 0
    ? await db.select({ id: requestsTable.id, title: requestsTable.title }).from(requestsTable)
    : [];
  const requestMap = new Map(requests.map(r => [r.id, r.title]));

  res.json(logs.map(l => ({
    id: l.id,
    action: l.action,
    description: l.details ?? l.action,
    requestId: l.requestId ?? null,
    requestTitle: l.requestId ? (requestMap.get(l.requestId) ?? null) : null,
    performedBy: formatUser(userMap.get(l.performedById)),
    createdAt: l.createdAt.toISOString(),
  })));
});

router.get("/dashboard/request-breakdown", requireAuth, async (req, res) => {
  const statuses = ["pending", "in_review", "approved", "rejected", "cancelled", "draft"];
  const [totalResult, ...statusResults] = await Promise.all([
    db.select({ count: count() }).from(requestsTable),
    ...statuses.map(s => db.select({ count: count() }).from(requestsTable).where(eq(requestsTable.status, s))),
  ]);

  const total = Number(totalResult[0]?.count ?? 0) || 1;

  res.json(statuses.map((status, i) => {
    const c = Number(statusResults[i]?.[0]?.count ?? 0);
    return { status, count: c, percentage: Math.round((c / total) * 100 * 10) / 10 };
  }));
});

router.get("/dashboard/approval-pipeline", requireAuth, async (req, res) => {
  const user = (req as any).user as typeof usersTable.$inferSelect;

  const pendingSteps = await db.select().from(approvalStepsTable)
    .where(and(eq(approvalStepsTable.status, "pending"), eq(approvalStepsTable.approverRole, user.role)))
    .orderBy(approvalStepsTable.createdAt)
    .limit(20);

  if (pendingSteps.length === 0) { res.json([]); return; }

  const requestIds = [...new Set(pendingSteps.map(s => s.requestId))];
  const requests = await db.select().from(requestsTable)
    .where(sql`${requestsTable.id} = ANY(${requestIds})`);
  const allUsers = await db.select().from(usersTable);
  const userMap = new Map(allUsers.map(u => [u.id, u]));
  const requestMap = new Map(requests.map(r => [r.id, r]));

  res.json(pendingSteps.map(s => {
    const request = requestMap.get(s.requestId);
    if (!request) return null;
    return {
      requestId: request.id,
      requestTitle: request.title,
      requestType: request.type,
      priority: request.priority,
      submittedBy: formatUser(userMap.get(request.submittedById))!,
      submittedAt: request.createdAt.toISOString(),
      stepOrder: s.stepOrder,
      totalSteps: request.totalSteps ?? 1,
      dueDate: request.dueDate ? request.dueDate.toISOString() : null,
    };
  }).filter(Boolean));
});

export default router;
