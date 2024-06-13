import express from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import multer from "multer";
import {
  customRequest,
  jwtMiddleware,
  optionalJwtMiddleware,
} from "../middleware/jwtMiddleware";

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer();

const createLiteratureSchema = z.object({
  title: z.string().min(1),
  synopsis: z.string().min(1),
  imageUrl: z.string().url(),
  genreId: z.coerce.number().int().positive(),
  language: z.string().min(1),
  copyright: z.coerce.number().int(),
});
const editLiteratureSchema = z.object({
  literatureId: z.coerce.number().int().positive(),
  title: z.string().min(1),
  synopsis: z.string().min(1),
  imageUrl: z.string().url(),
  genreId: z.coerce.number().int().positive(),
  language: z.string().min(1),
  copyright: z.coerce.number().int(),
});

const createLiteratureCommentSchema = z.object({
  content: z.string().min(1),
  literatureId: z.coerce.number().int().positive(),
});

const searchLiteratureSchema = z.object({
  query: z.string().min(1),
});

// Create literature for a user
router.post(
  "/create",
  jwtMiddleware,
  upload.none(),
  async (req: customRequest, res) => {
    const result = createLiteratureSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }

    const { title, synopsis, imageUrl, genreId, language, copyright } =
      result.data;
    const authorId = req.userId!;

    try {
      const literature = await prisma.literature.create({
        data: {
          title,
          synopsis,
          imageUrl,
          genreId,
          language,
          copyright,
          authorId,
        },
      });

      res.json(literature);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }
);

// Get all literature
router.get("/all", async (req, res) => {
  try {
    const literature = await prisma.literature.findMany({
      include: {
        genre: true,
        users: {
          select: {
            username: true,
            userId: true,
            imageUrl: true,
          },
        },
      },
    });

    res.json(literature);
  } catch (error) {
    res.status(500).json({ error: "Failed to asdfasdf" });
  }
});

// Get all literature by genre
router.get("/genre/:genreId", async (req, res) => {
  const { genreId } = req.params;

  try {
    const literature = await prisma.literature.findMany({
      where: { genreId: Number(genreId) },
      include: {
        genre: true,
        users: {
          select: {
            username: true,
            userId: true,
            imageUrl: true,
          },
        },
      },
    });

    res.json(literature);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch literature by genre" });
  }
});

// Get all literature by author
router.get("/author/:authorId", async (req, res) => {
  const { authorId } = req.params;

  try {
    const literature = await prisma.literature.findMany({
      where: { authorId },
      include: {
        genre: true,
        users: {
          select: {
            username: true,
            userId: true,
            imageUrl: true,
          },
        },
      },
    });

    res.json(literature);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch literature by author" });
  }
});

// Get literature by ID with vote status
router.get(
  "/id/:id",
  optionalJwtMiddleware,
  async (req: customRequest, res) => {
    const { id } = req.params;
    const userId = req.userId;

    try {
      const literature = await prisma.literature.findUnique({
        where: { literatureId: Number(id) },
        include: {
          genre: true,
          chapters: {
            orderBy: {
              chapterNumber: "desc",
            },
          },
          users: {
            select: {
              username: true,
              userId: true,
              imageUrl: true,
            },
          },
        },
      });

      if (!literature) {
        return res.status(404).json({ error: "Literature not found" });
      }

      let vote = "";
      let saved = false;
      let donated = false;
      if (userId) {
        const hasDonated = await prisma.donation.findFirst({
          where: {
            senderId: userId,
            receiverId: literature.authorId,
          },
        });

        const hasAdded = await prisma.collections.findFirst({
          where: {
            userId: userId,
            literatureId: literature.literatureId,
          },
        });

        donated = !!hasDonated;
        saved = !!hasAdded;

        const userVote = await prisma.vote.findFirst({
          where: {
            literatureId: Number(id),
            userId,
          },
        });
        if (userVote) {
          vote = userVote.voteType === 1 ? "upvote" : "downvote";
        }
      }

      res.json({ ...literature, vote, donated: donated, saved });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch literature" });
    }
  }
);

// Fetch literature comments by literature ID
router.get(
  "/comments/:literatureId",
  optionalJwtMiddleware,
  async (req: customRequest, res) => {
    const { literatureId } = req.params;
    const userId = req.userId;

    try {
      const comments = await prisma.literatureComments.findMany({
        where: { literatureId: Number(literatureId) },
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
        const commentVotes = await prisma.vote.findMany({
          where: {
            literatureCommentId: {
              in: comments.map((comment) => comment.literatureCommentId),
            },
            userId,
          },
          select: {
            literatureCommentId: true,
            voteType: true,
          },
        });

        const votedCommentIds = commentVotes.reduce(
          (acc: Record<number, number>, vote) => {
            if (vote.literatureCommentId !== null) {
              acc[vote.literatureCommentId] = vote.voteType;
            }
            return acc;
          },
          {}
        );

        const commentsWithVote = comments.map((comment) => ({
          ...comment,
          vote:
            votedCommentIds[comment.literatureCommentId] === 1
              ? "upvote"
              : votedCommentIds[comment.literatureCommentId] === -1
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

// Search literature
router.get("/search", async (req, res) => {
  const result = searchLiteratureSchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }
  const { query } = result.data;
  try {
    const literature = await prisma.literature.findMany({
      where: {
        OR: [{ title: { contains: query } }, { synopsis: { contains: query } }],
      },

      select: {
        literatureId: true,
        title: true,
        synopsis: true,
        genre: true,
        users: {
          select: {
            username: true,
            userId: true,
            imageUrl: true,
          },
        },
      },
    });

    res.json(literature);
  } catch (error) {
    res.status(500).json({ error: "Failed to search literature" });
  }
});

router.get("/search-comment", async (req, res) => {
  const result = searchLiteratureSchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }
  const { query } = result.data;
  try {
    const literature = await prisma.literatureComments.findMany({
      where: {
        OR: [
          { content: { contains: query } },
          { users: { username: { equals: query } } },
          { literature: { title: { contains: query } } },
        ],
      },
      select: {
        users: {
          select: {
            username: true,
          },
        },
        content: true,
        created_at: true,
        literatureCommentId: true,
        literature: {
          select: {
            title: true,
          },
        },
      },
    });

    res.json(literature);
  } catch (error) {
    res.status(500).json({ error: "Failed to search Chapters" });
  }
});

// Create a literature comment
router.post(
  "/:literatureId/comment",
  jwtMiddleware,
  upload.none(),
  async (req: customRequest, res) => {
    const result = createLiteratureCommentSchema.safeParse({
      ...req.body,
      literatureId: req.params.literatureId,
    });

    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }

    const { content, literatureId } = result.data;
    const userId = req.userId!;

    try {
      const comment = await prisma.literatureComments.create({
        data: {
          content,
          literatureId: Number(literatureId),
          userId,
        },
      });

      res.json(comment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create comment" });
    }
  }
);

// Delete a literature comment
router.delete(
  "/comment/:commentId",
  jwtMiddleware,
  async (req: customRequest, res) => {
    const { commentId } = req.params;
    const userId = req.userId!;

    try {
      const comment = await prisma.literatureComments.findUnique({
        where: { literatureCommentId: Number(commentId) },
      });

      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      if (comment.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      await prisma.literatureComments.delete({
        where: { literatureCommentId: Number(commentId) },
      });

      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete comment" });
    }
  }
);
// Get literature by ID for authenticated user with donation check
router.get(
  "/:id/check-donation",
  jwtMiddleware,
  async (req: customRequest, res) => {
    const { id } = req.params;
    const userId = req.userId!; // Extract userId from JWT token

    try {
      const literature = await prisma.literature.findUnique({
        where: { literatureId: Number(id) },
        include: {
          genre: true,
          users: {
            select: {
              username: true,
              userId: true,
              imageUrl: true,
            },
          },
          chapters: {
            include: {
              chapterComments: true,
            },
          },
          literatureComments: true,
        },
      });

      if (!literature) {
        return res.status(404).json({ error: "Literature not found" });
      }

      // Check if the authenticated user has donated to the author
      const hasDonated = await prisma.donation.findFirst({
        where: {
          senderId: userId,
          receiverId: literature.authorId,
        },
      });

      const response = {
        ...literature,
        hasDonated: !!hasDonated,
      };

      res.json(response);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch literature or check donation status" });
    }
  }
);

// Get today's top picks
router.get("/top-picks", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const topPicks = await prisma.literature.findMany({
      orderBy: {
        voteCount: "desc",
      },
      take: 10,
      include: {
        genre: true,
        users: {
          select: {
            username: true,
            userId: true,
            imageUrl: true,
          },
        },
        _count: {
          select: {
            Vote: true,
          },
        },
      },
      where: {
        chapters: {
          some: {
            created_at: {
              gte: today,
            },
          },
        },
      },
    });

    if (topPicks.length === 0) {
      const fallbackPicks = await prisma.literature.findMany({
        orderBy: {
          voteCount: "desc",
        },
        take: 10,
        include: {
          genre: true,
          users: {
            select: {
              username: true,
              userId: true,
              imageUrl: true,
            },
          },
          _count: {
            select: {
              Vote: true,
            },
          },
        },
      });

      return res.json(fallbackPicks);
    }

    res.json(topPicks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch top picks" });
  }
});

// Get today's latest updates
router.get("/latest-updates", async (req, res) => {
  try {
    // Step 1: Fetch the latest chapters
    const latestChapters = await prisma.chapters.findMany({
      take: 12,
      orderBy: {
        created_at: "desc",
      },
      select: {
        literatureId: true,
      },
    });

    // Extract unique literature IDs
    const literatureIds = Array.from(
      new Set(latestChapters.map((chapter) => chapter.literatureId))
    );

    // Step 2: Fetch the literature records based on those chapters
    const latestUpdates = await prisma.literature.findMany({
      where: {
        literatureId: { in: literatureIds },
      },
      include: {
        genre: true,
        users: {
          select: {
            username: true,
            userId: true,
            imageUrl: true,
          },
        },
        chapters: true,
      },
    });

    const response = literatureIds.map((v) => {
      const currlit = latestUpdates.find((f) => f.literatureId == v);
      return currlit;
    });

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch latest updates" });
  }
});

router.put(
  "/edit",
  jwtMiddleware,
  upload.none(),
  async (req: customRequest, res) => {
    const result = editLiteratureSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }

    const {
      literatureId,
      title,
      synopsis,
      imageUrl,
      copyright,
      genreId,
      language,
    } = result.data;
    const userId = req.userId!;

    try {
      const literature = await prisma.literature.findUnique({
        where: {
          literatureId: literatureId,
        },
      });

      if (!literature || literature.authorId !== userId) {
        return res
          .status(403)
          .json({ error: "Not authorized to edit this literature" });
      }

      const updatedLiterature = await prisma.literature.update({
        where: { literatureId },
        data: {
          title,
          synopsis,
          imageUrl,
          copyright,
          genreId,
          language,
        },
      });

      res.json(updatedLiterature);
    } catch (error) {
      res.status(500).json({ error: "Failed to edit chapter" });
    }
  }
);

// Delete user's own literature
router.delete("/delete/:id", jwtMiddleware, async (req: customRequest, res) => {
  const { id } = req.params;
  const userId = req.userId!; // Extract userId from JWT token

  try {
    // Find the literature to ensure it exists and is owned by the user
    const literature = await prisma.literature.findUnique({
      where: { literatureId: Number(id) },
    });

    if (!literature) {
      return res.status(404).json({ error: "Literature not found" });
    }

    if (literature.authorId !== userId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this literature" });
    }

    await prisma.literatureComments.deleteMany({
      where: {
        literatureId: Number(id),
      },
    });
    await prisma.literature.delete({
      where: { literatureId: Number(id) },
    });

    res.status(200).json({ message: "Literature deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete literature" });
  }
});

export default router;
