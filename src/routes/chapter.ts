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

const createChapterSchema = z.object({
  literatureId: z.coerce.number().int().positive(),
  chapterTitle: z.string().min(1),
  chapterNumber: z.coerce.number().int().positive(),
  imageUrl: z.string().url().optional(),
  content: z.string().min(1),
});

const editChapterSchema = z.object({
  chapterId: z.coerce.number().int().positive(),
  chapterTitle: z.string().min(1).optional(),
  chapterNumber: z.coerce.number().int().positive().optional(),
  imageUrl: z.string().url().optional(),
  content: z.string().min(1).optional(),
});

const commentSchema = z.object({
  chapterId: z.coerce.number().int().positive(),
  content: z.string().min(1),
});

// Create a chapter for user's own literature
router.post(
  "/create",
  jwtMiddleware,
  upload.none(),
  async (req: customRequest, res) => {
    const result = createChapterSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }

    const { literatureId, chapterTitle, chapterNumber, imageUrl, content } =
      result.data;
    const userId = req.userId!;

    try {
      const literature = await prisma.literature.findUnique({
        where: { literatureId },
      });

      if (!literature || literature.authorId !== userId) {
        return res
          .status(403)
          .json({ error: "Not authorized to add chapters to this literature" });
      }

      const chapter = await prisma.chapters.create({
        data: {
          literatureId,
          chapterTitle,
          chapterNumber,
          imageUrl: imageUrl || "",
          content,
        },
      });

      res.json(chapter);
    } catch (error) {
      res.status(500).json({ error: "Failed to create chapter" });
    }
  }
);

// Edit a chapter
router.put(
  "/edit",
  jwtMiddleware,
  upload.none(),
  async (req: customRequest, res) => {
    const result = editChapterSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }

    const { chapterId, chapterTitle, chapterNumber, imageUrl, content } =
      result.data;
    const userId = req.userId!;

    try {
      const chapter = await prisma.chapters.findUnique({
        where: { chapterId },
        include: {
          literature: true,
        },
      });

      if (!chapter || chapter.literature.authorId !== userId) {
        return res
          .status(403)
          .json({ error: "Not authorized to edit this chapter" });
      }

      const updatedChapter = await prisma.chapters.update({
        where: { chapterId },
        data: {
          chapterTitle,
          chapterNumber,
          imageUrl,
          content,
        },
      });

      res.json(updatedChapter);
    } catch (error) {
      res.status(500).json({ error: "Failed to edit chapter" });
    }
  }
);

router.get("/all", async (req, res) => {
  try {
    const chapters = await prisma.chapters.findMany({
      include: {
        literature: {
          select: {
            users: {
              select: {
                username: true,
                userId: true,
              },
            },
          },
        },
      },
    });

    res.json(chapters);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chapters" });
  }
});

router.get("/all-comments", async (req, res) => {
  try {
    const chapterComments = await prisma.chapterComments.findMany({
      include: {
        users: {
          select: {
            username: true,
            userId: true,
          },
        },
      },
    });

    res.json(chapterComments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chapter comments" });
  }
});

// Get a chapter by ID with vote status
router.get(
  "/id/:id",
  optionalJwtMiddleware,
  async (req: customRequest, res) => {
    const { id } = req.params;
    const userId = req.userId;

    try {
      const chapter = await prisma.chapters.findUnique({
        where: { chapterId: Number(id) },
      });

      if (!chapter) {
        return res.status(404).json({ error: "Chapter not found" });
      }

      let vote = "";
      if (userId) {
        const userVote = await prisma.vote.findFirst({
          where: {
            chapterId: Number(id),
            userId,
          },
        });
        if (userVote) {
          vote = userVote.voteType === 1 ? "upvote" : "downvote";
        }
      }

      res.json({ ...chapter, vote });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chapter" });
    }
  }
);
// Comment on a chapter
router.post(
  "/comment",
  jwtMiddleware,
  upload.none(),
  async (req: customRequest, res) => {
    const result = commentSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }

    const { chapterId, content } = result.data;
    const userId = req.userId!;

    try {
      const comment = await prisma.chapterComments.create({
        data: {
          chapterId,
          content,
          userId,
        },
      });

      res.json(comment);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }
);

// Get comments for a chapter with vote status
router.get(
  "/comments/:id",
  optionalJwtMiddleware,
  async (req: customRequest, res) => {
    const { id } = req.params;
    const userId = req.userId;

    try {
      const comments = await prisma.chapterComments.findMany({
        where: { chapterId: Number(id) },
        include: {
          users: {
            select: {
              username: true,
            },
          },
        },
      });

      if (userId) {
        const commentVotes = await prisma.vote.findMany({
          where: {
            chapterCommentId: {
              in: comments.map((comment) => comment.chapterCommentId),
            },
            userId,
          },
          select: {
            chapterCommentId: true,
            voteType: true,
          },
        });

        const votedCommentIds = commentVotes.reduce(
          (acc: Record<number, number>, vote) => {
            if (vote.chapterCommentId !== null) {
              acc[vote.chapterCommentId] = vote.voteType;
            }
            return acc;
          },
          {}
        );

        const commentsWithVote = comments.map((comment) => ({
          ...comment,
          vote:
            votedCommentIds[comment.chapterCommentId] === 1
              ? "upvote"
              : votedCommentIds[comment.chapterCommentId] === -1
              ? "downvote"
              : "",
        }));

        return res.json(commentsWithVote);
      } else {
        return res.json(
          comments.map((c) => ({
            ...c,
            vote: "",
          }))
        );
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  }
);

export default router;
