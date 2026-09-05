import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { usersTable } from "@workspace/db";

const router = Router();

router.get("/notifications", requireAuth, async (req, res) => {
  const user = (req as any).user as typeof usersTable.$inferSelect;
  const { unreadOnly } = req.query as Record<string, string>;

  const conditions = [eq(notificationsTable.userId, user.id)];
  if (unreadOnly === "true") conditions.push(eq(notificationsTable.isRead, false));

  const notifications = await db.select().from(notificationsTable)
    .where(and(...conditions))
    .orderBy(notificationsTable.createdAt);

  res.json(notifications.map(n => ({
    ...n,
    requestId: n.requestId ?? null,
    createdAt: n.createdAt.toISOString(),
  })));
});

router.patch("/notifications/:notificationId/read", requireAuth, async (req, res) => {
  const user = (req as any).user as typeof usersTable.$inferSelect;
  const id = parseInt(req.params.notificationId as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [notification] = await db.update(notificationsTable)
    .set({ isRead: true })
    .where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, user.id)))
    .returning();

  if (!notification) { res.status(404).json({ error: "Notification not found" }); return; }

  res.json({ ...notification, requestId: notification.requestId ?? null, createdAt: notification.createdAt.toISOString() });
});

router.post("/notifications/mark-all-read", requireAuth, async (req, res) => {
  const user = (req as any).user as typeof usersTable.$inferSelect;
  await db.update(notificationsTable)
    .set({ isRead: true })
    .where(eq(notificationsTable.userId, user.id));
  res.json({ success: true });
});

export default router;
