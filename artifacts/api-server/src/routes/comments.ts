import { Router } from "express";
import { db, commentsTable, usersTable, notificationsTable, requestsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { CreateCommentBody } from "@workspace/api-zod";

const router = Router();

function formatUser(user: typeof usersTable.$inferSelect) {
  const { passwordHash: _, ...rest } = user;
  return { ...rest, avatarUrl: rest.avatarUrl ?? null, createdAt: rest.createdAt.toISOString(), updatedAt: rest.updatedAt.toISOString() };
}

router.get("/requests/:requestId/comments", requireAuth, async (req, res) => {
  const requestId = parseInt(req.params.requestId);
  if (isNaN(requestId)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const comments = await db.select().from(commentsTable).where(eq(commentsTable.requestId, requestId)).orderBy(commentsTable.createdAt);
  const allUsers = await db.select().from(usersTable);
  const userMap = new Map(allUsers.map(u => [u.id, u]));

  res.json(comments.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    user: formatUser(userMap.get(c.userId)!),
  })));
});

router.post("/requests/:requestId/comments", requireAuth, async (req, res) => {
  const user = (req as any).user as typeof usersTable.$inferSelect;
  const requestId = parseInt(req.params.requestId);
  if (isNaN(requestId)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const parsed = CreateCommentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [comment] = await db.insert(commentsTable).values({
    requestId,
    userId: user.id,
    text: parsed.data.text,
  }).returning();

  // Notify request submitter (if not the commenter)
  const [request] = await db.select().from(requestsTable).where(eq(requestsTable.id, requestId));
  if (request && request.submittedById !== user.id) {
    await db.insert(notificationsTable).values({
      userId: request.submittedById,
      message: `${user.name} commented on your request "${request.title}"`,
      type: "comment_added",
      requestId,
      isRead: false,
    });
  }

  res.status(201).json({
    ...comment,
    createdAt: comment.createdAt.toISOString(),
    user: formatUser(user),
  });
});

router.delete("/requests/:requestId/comments/:commentId", requireAuth, async (req, res) => {
  const user = (req as any).user as typeof usersTable.$inferSelect;
  const commentId = parseInt(req.params.commentId);
  if (isNaN(commentId)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [comment] = await db.select().from(commentsTable).where(eq(commentsTable.id, commentId));
  if (!comment) { res.status(404).json({ error: "Comment not found" }); return; }
  if (comment.userId !== user.id && !["admin", "super_admin"].includes(user.role)) {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  await db.delete(commentsTable).where(eq(commentsTable.id, commentId));
  res.status(204).send();
});

export default router;
