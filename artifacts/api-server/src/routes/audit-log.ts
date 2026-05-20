import { Router } from "express";
import { db, auditLogTable, usersTable } from "@workspace/db";
import { eq, and, SQL, desc, count } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

function formatUser(user: typeof usersTable.$inferSelect) {
  const { passwordHash: _, ...rest } = user;
  return { ...rest, avatarUrl: rest.avatarUrl ?? null, createdAt: rest.createdAt.toISOString(), updatedAt: rest.updatedAt.toISOString() };
}

router.get("/audit-log", requireAuth, async (req, res) => {
  const { requestId, userId, action, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, parseInt(limit) || 20);
  const offset = (pageNum - 1) * limitNum;

  const conditions: SQL[] = [];
  if (requestId) conditions.push(eq(auditLogTable.requestId, parseInt(requestId)));
  if (userId) conditions.push(eq(auditLogTable.performedById, parseInt(userId)));
  if (action) conditions.push(eq(auditLogTable.action, action));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult, rows] = await Promise.all([
    db.select({ count: count() }).from(auditLogTable).where(whereClause),
    db.select().from(auditLogTable).where(whereClause).orderBy(desc(auditLogTable.createdAt)).limit(limitNum).offset(offset),
  ]);

  const allUsers = await db.select().from(usersTable);
  const userMap = new Map(allUsers.map(u => [u.id, u]));

  const data = rows.map(a => ({
    ...a,
    requestId: a.requestId ?? null,
    details: a.details ?? null,
    createdAt: a.createdAt.toISOString(),
    performedBy: formatUser(userMap.get(a.performedById)!),
  }));

  res.json({ data, total: Number(totalResult[0]?.count ?? 0), page: pageNum, limit: limitNum });
});

export default router;
