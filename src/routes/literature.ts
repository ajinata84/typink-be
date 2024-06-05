import express from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import multer from "multer";
import jwtMiddleware, { customRequest } from "../middleware/jwtMiddleware";

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer();

const createLiteratureSchema = z.object({
  title: z.string().min(1),
  synopsis: z.string().min(1),
  imageUrl: z.string().url(),
  genreId: z.coerce.number().int().positive(),
  language: z.string().min(1),
  copyright: z.coerce.number().int().positive(),
});

const createLiteratureCommentSchema = z.object({
  content: z.string().min(1),
  literatureId: z.coerce.number().int().positive(),
});

const searchLiteratureSchema = z.object({
  query: z.string().min(1),
  page: z.string().optional(),
  pageSize: z.string().optional(),
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
      res.status(500).json({ error: "Failed to create literature" });
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
          },
        },
      },
    });

    res.json(literature);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch literature" });
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
          },
        },
      },
    });

    res.json(literature);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch literature by author" });
  }
});

// Get literature by ID with comments and chapters
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const literature = await prisma.literature.findUnique({
      where: { literatureId: Number(id) },
      include: {
        genre: true,
        users: {
          select: {
            username: true,
            userId: true,
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

    res.json(literature);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch literature" });
  }
});

// Search literature
router.get("/search", async (req, res) => {
  const result = searchLiteratureSchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }

  const { query, page, pageSize } = result.data;
  const take = pageSize ? parseInt(pageSize) : 10;
  const skip = page ? (parseInt(page) - 1) * take : 0;

  try {
    const literature = await prisma.literature.findMany({
      where: {
        OR: [{ title: { contains: query } }, { synopsis: { contains: query } }],
      },
      skip,
      take,
      include: {
        genre: true,
        users: true,
      },
    });

    res.json(literature);
  } catch (error) {
    res.status(500).json({ error: "Failed to search literature" });
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

// Get all comments for a specific literature
router.get("/:literatureId/comments", async (req, res) => {
  const { literatureId } = req.params;

  try {
    const comments = await prisma.literatureComments.findMany({
      where: { literatureId: Number(literatureId) },
      include: {
        users: {
          select: {
            username: true,
          },
        },
      },
    });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

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
        users: true,
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
          users: true,
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
          },
        },
        chapters: true,
      },
    });

    res.json(latestUpdates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch latest updates" });
  }
});

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
      return res.status(403).json({ error: "You are not authorized to delete this literature" });
    }

    // Delete the literature
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
