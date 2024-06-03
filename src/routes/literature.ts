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
        users: true,
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
        users: true,
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
        users: true,
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

export default router;
