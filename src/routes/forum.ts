import express from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import multer from "multer";
import {
  jwtMiddleware,
  customRequest,
  optionalJwtMiddleware,
} from "../middleware/jwtMiddleware";

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

const searchForumSchema = z.object({
  query: z.string().min(1),
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
      res.status(500).json({ error: error });
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

  try {
    const forums = await prisma.forum.findMany({
      include: {
        users: {
          select: {
            username: true,
            userId: true,
            imageUrl: true,
          },
        }, // Include user details
        forumComments: true, // Include comments
      },
      orderBy: {
        created_at: "desc",
      },
    });

    res.json(forums);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// Get a specific forum post by ID
router.get(
  "/id/:id",
  optionalJwtMiddleware,
  async (req: customRequest, res) => {
    const { id } = req.params;
    const userId = req.userId; // This will be undefined if there's no token

    try {
      const forum = await prisma.forum.findUnique({
        where: { forumId: Number(id) },
        include: {
          users: {
            select: {
              username: true,
              userId: true,
              imageUrl: true,
            },
          },
          forumComments: true,
        },
      });

      if (!forum) {
        return res.status(404).json({ error: "Forum post not found" });
      }

      let vote = "";
      if (userId) {
        const userVote = await prisma.vote.findFirst({
          where: {
            forumId: Number(id),
            userId,
          },
        });
        if (userVote) {
          vote = userVote.voteType === 1 ? "upvote" : "downvote";
        }
      }

      res.json({ ...forum, vote });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch forum post" });
    }
  }
);

router.get("/search", async (req, res) => {
  const result = searchForumSchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }
  const { query } = result.data;
  try {
    const literature = await prisma.forum.findMany({
      where: {
        OR: [
          { content: { contains: query } },
          { title: { contains: query } },
          { users: { username: { contains: query } } },
        ],
      },
      select: {
        forumId: true,
        title: true,
        users: {
          select: {
            username: true,
          },
        },
        content: true,
      },
    });

    res.json(literature);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.get("/search-comment", async (req, res) => {
  const result = searchForumSchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }
  const { query } = result.data;
  try {
    const literature = await prisma.forumComments.findMany({
      where: {
        OR: [
          { content: { contains: query } },
          { users: { username: { equals: query } } },
          { forum: { title: { contains: query } } },
        ],
      },
      select: {
        forum: {
          select: {
            title: true,
          },
        },
        users: {
          select: {
            username: true,
          },
        },
        content: true,
        created_at: true,
        forumCommentId: true,
      },
    });

    res.json(literature);
  } catch (error) {
    res.status(500).json({ error: "Failed to search Chapters" });
  }
});

// Fetch forum comments for a specific forum ID
router.get(
  "/comments/:forumId",
  optionalJwtMiddleware,
  async (req: customRequest, res) => {
    const { forumId } = req.params;
    const userId = req.userId;

    try {
      const comments = await prisma.forumComments.findMany({
        where: { forumId: Number(forumId) },
        include: {
          users: {
            select: {
              username: true,
              userId: true,
              imageUrl: true,
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      });

      if (userId) {
        // Check if the user has voted on each comment
        const commentVotes = await prisma.vote.findMany({
          where: {
            forumCommentId: {
              in: comments.map((comment) => comment.forumCommentId),
            },
            userId,
          },
          select: {
            forumCommentId: true,
            voteType: true,
          },
        });

        const votedCommentIds = commentVotes.reduce(
          (acc: Record<number, number>, vote) => {
            if (vote.forumCommentId !== null) {
              acc[vote.forumCommentId] = vote.voteType;
            }
            return acc;
          },
          {}
        );

        const commentsWithVote = comments.map((comment) => ({
          ...comment,
          vote:
            votedCommentIds[comment.forumCommentId] === 1
              ? "upvote"
              : votedCommentIds[comment.forumCommentId] === -1
              ? "downvote"
              : "",
        }));

        return res.json(commentsWithVote);
      } else {
        return res.json(comments);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch forum comments" });
    }
  }
);

// Fetch forums with the newest comments
router.get("/recent-activity", async (req, res) => {
  try {
    // Step 1: Get the latest comments
    const recentComments = await prisma.forumComments.findMany({
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
        forumComments: true,
        users: {
          select: {
            username: true,
            userId: true,
            imageUrl: true,
          },
        },
        _count: {
          select: {
            forumComments: true,
          },
        },
      },
    });

    const response = forumIds.map((v) => {
      const currForum = forums.find((f) => f.forumId == v);
      return currForum;
    });

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// Fetch forums of type "announcement"
router.get("/announcements", async (req, res) => {
  try {
    const announcements = await prisma.forum.findMany({
      where: {
        forumType: "Announcement",
        genreId: 0,
      },
      include: {
        users: {
          select: {
            username: true,
            userId: true,
            imageUrl: true,
          },
        },
        forumComments: true,
      },
    });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch announcement forums" });
  }
});

export default router;
