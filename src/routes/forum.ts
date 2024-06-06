import express from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import multer from "multer";
import jwtMiddleware, { customRequest } from "../middleware/jwtMiddleware";

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer();

const createForumSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  genreId: z.coerce.number().int().positive(),
  forumType: z.string().min(1),
});

const commentSchema = z.object({
  forumId: z.coerce.number().int().positive(),
  content: z.string().min(1),
});

const forumQuerySchema = z.object({
  page: z.string().optional(),
  pageSize: z.string().optional(),
});

// Create a forum post
router.post(
  "/create",
  jwtMiddleware,
  upload.none(),
  async (req: customRequest, res) => {
    const result = createForumSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }

    const { title, content, genreId, forumType } = result.data;
    const userId = req.userId!;

    try {
      const forum = await prisma.forum.create({
        data: {
          title,
          content,
          genreId,
          forumType,
          userId,
        },
      });

      res.json(forum);
    } catch (error) {
      res.status(500).json({ error: "Failed to create forum post" });
    }
  }
);

// Post a comment on a forum
router.post(
  "/comment",
  jwtMiddleware,
  upload.none(),
  async (req: customRequest, res) => {
    const result = commentSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }

    const { forumId, content } = result.data;
    const userId = req.userId!;

    try {
      const comment = await prisma.forumComments.create({
        data: {
          forumId,
          content,
          userId,
        },
      });

      res.json(comment);
    } catch (error) {
      res.status(500).json({ error: "Failed to post comment" });
    }
  }
);

router.get("/all", async (req, res) => {
  const result = forumQuerySchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }

  const { page, pageSize } = result.data;
  const take = pageSize ? parseInt(pageSize) : 10;
  const skip = page ? (parseInt(page) - 1) * take : 0;

  try {
    const forums = await prisma.forum.findMany({
      skip,
      take,
      include: {
        users: true, // Include user details
        forumComments: true, // Include comments
      },
    });

    res.json(forums);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch forum posts" });
  }
});

// Get a specific forum post by ID
router.get("/id/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const forum = await prisma.forum.findUnique({
      where: { forumId: Number(id) },
      include: {
        users: true, // Include user details
        forumComments: true, // Include comments
      },
    });

    if (!forum) {
      return res.status(404).json({ error: "Forum post not found" });
    }

    res.json(forum);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch forum post" });
  }
});

// Fetch forums with the newest comments
router.get("/recent-activity", async (req, res) => {
  try {
    // Step 1: Get the latest comments
    const recentComments = await prisma.forumComments.findMany({
      take: 10,
      orderBy: {
        created_at: "desc",
      },
      select: {
        forumId: true,
      },
    });

    // Extract unique forum IDs
    const forumIds = Array.from(
      new Set(recentComments.map((comment) => comment.forumId))
    );

    // Step 2: Get the forums associated with those comments
    const forums = await prisma.forum.findMany({
      where: {
        forumId: { in: forumIds },
      },
      include: {
        users: true,
        forumComments: {
          orderBy: {
            created_at: "desc",
          },
        },
      },
    });

    res.json(forums);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch forums with recent activity" });
  }
});

// Fetch forums of type "announcement"
router.get("/announcements", async (req, res) => {
  try {
    const announcements = await prisma.forum.findMany({
      where: {
        forumType: "announcement",
      },
      include: {
        users: true,
        forumComments: true,
      },
    });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch announcement forums" });
  }
});

export default router;
