import express from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import multer from "multer";
import { jwtMiddleware, customRequest } from "../middleware/jwtMiddleware";

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer();

const addCollectionSchema = z.object({
  literatureId: z.coerce.number().int(),
});

router.post(
  "/add",
  jwtMiddleware,
  upload.none(),
  async (req: customRequest, res) => {
    const result = addCollectionSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }

    const { literatureId } = result.data;
    const userId = req.userId!; // Extract userId from JWT token

    try {
      const collection = await prisma.collections.create({
        data: {
          userId,
          literatureId,
        },
      });

      res.json(collection);
    } catch (error) {
      res.status(500).json({ error: "Failed to add to collection" });
    }
  }
);

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const collections = await prisma.collections.findMany({
      where: { userId: id },
      include: {
        literature: true,
      },
    });

    res.json(collections);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch collections" });
  }
});

// Delete collection for the authenticated user
router.delete(
  "/:collectionId",
  jwtMiddleware,
  async (req: customRequest, res) => {
    const { collectionId } = req.params;
    const userId = req.userId; // Extract userId from JWT token

    try {
      // Check if the collection belongs to the authenticated user
      const collection = await prisma.collections.findUnique({
        where: { collectionId },
      });

      if (!collection) {
        return res.status(404).json({ error: "Collection not found" });
      }

      if (collection.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Delete the collection
      await prisma.collections.delete({
        where: { collectionId },
      });

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete collection" });
    }
  }
);

export default router;
