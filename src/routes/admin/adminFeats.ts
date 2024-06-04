import express from "express";
import { PrismaClient } from "@prisma/client";
import adminMiddleware, {
  CustomAdminRequest,
} from "../../middleware/adminMiddleware";
import { z } from "zod";
import multer from "multer";

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer();

const deleteSchema = z.object({
  id: z.coerce.number().positive(),
});

const forumSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  genreId: z.number().positive(),
  forumType: z.string().min(1),
});

// Delete Forum
router.delete(
  "/forum",
  adminMiddleware,
  upload.none(),
  async (req: CustomAdminRequest, res) => {
    const result = deleteSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }

    const { id } = result.data;

    try {
      await prisma.forum.delete({
        where: { forumId: id },
      });
      res.json({ message: "Forum deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete forum" });
    }
  }
);

// Delete Comment
router.delete(
  "/forum-comment",
  adminMiddleware,
  upload.none(),
  async (req: CustomAdminRequest, res) => {
    const result = deleteSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }

    const { id } = result.data;

    try {
      await prisma.forumComments.delete({
        where: { forumCommentId: id },
      });
      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete comment" });
    }
  }
);

router.delete(
  "/chapter-comment",
  adminMiddleware,
  upload.none(),
  async (req: CustomAdminRequest, res) => {
    const result = deleteSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }

    const { id } = result.data;

    try {
      await prisma.chapterComments.delete({
        where: { chapterCommentId: id },
      });
      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete comment" });
    }
  }
);

router.delete(
  "/literature-comment",
  adminMiddleware,
  upload.none(),
  async (req: CustomAdminRequest, res) => {
    const result = deleteSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }

    const { id } = result.data;

    try {
      await prisma.literatureComments.delete({
        where: { literatureCommentId: id },
      });
      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete comment" });
    }
  }
);

// Delete Literature
router.delete(
  "/literature",
  adminMiddleware,
  upload.none(),
  async (req: CustomAdminRequest, res) => {
    const result = deleteSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }

    const { id } = result.data;

    try {
      await prisma.literature.delete({
        where: { literatureId: id },
      });
      res.json({ message: "Literature deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete literature" });
    }
  }
);

router.delete(
  "/chapter",
  adminMiddleware,
  upload.none(),
  async (req: CustomAdminRequest, res) => {
    const result = deleteSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }

    const { id } = result.data;

    try {
      await prisma.chapters.delete({
        where: { chapterId: id },
      });
      res.json({ message: "Chapter deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete Chapter" });
    }
  }
);

// Create Forum (Announcement)
router.post(
  "/forum",
  adminMiddleware,
  upload.none(),
  async (req: CustomAdminRequest, res) => {
    const result = forumSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }

    const { title, content, genreId, forumType } = result.data;

    try {
      const forum = await prisma.forum.create({
        data: {
          title,
          content,
          userId: req.adminId!.toString(),
          forumType: "Announcement",
          genreId: 0,
        },
      });
      res.json(forum);
    } catch (error) {
      res.status(500).json({ error: "Failed to create forum" });
    }
  }
);

// Update Forum (Announcement)
router.put(
  "/forum",
  adminMiddleware,
  upload.none(),
  async (req: CustomAdminRequest, res) => {
    const updateForumSchema = forumSchema.extend({
      forumId: z.number().positive(),
    });

    const result = updateForumSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }

    const { forumId, title, content, genreId, forumType } = result.data;

    try {
      const forum = await prisma.forum.update({
        where: { forumId },
        data: { title, content, forumType: "Announcement", genreId: 0 },
      });
      res.json(forum);
    } catch (error) {
      res.status(500).json({ error: "Failed to update forum" });
    }
  }
);

// Get total number of users who have created literature
router.get("/total-author", adminMiddleware, async (_req, res) => {
  try {
    const totalUsers = await prisma.literature.groupBy({
      by: ["authorId"],
      _count: true,
    });

    res.json({ totalUsers: totalUsers.length });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to fetch total users who have created literature",
      });
  }
});

// View Most Donated Authors
router.get(
  "/authors/most-donated",
  adminMiddleware,
  upload.none(),
  async (_req, res) => {
    try {
      const authors = await prisma.donation.groupBy({
        by: ["receiverId"],
        _sum: { amount: true },
        orderBy: {
          _sum: { amount: "desc" },
        },
        take: 10,
      });

      const authorDetails = await Promise.all(
        authors.map(async (author) => {
          const user = await prisma.users.findUnique({
            where: { userId: author.receiverId },
          });
          return { ...user, totalDonations: author._sum.amount };
        })
      );

      res.json(authorDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch most donated authors" });
    }
  }
);

export default router;
