import express from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { jwtMiddleware, customRequest } from "../middleware/jwtMiddleware";

const router = express.Router();
const prisma = new PrismaClient();

const updateUserSchema = z.object({
  username: z.string().min(1).optional(),
  bio: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
});

// Get user information by ID
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await prisma.users.findUnique({
      where: { userId },
      select: {
        userId: true,
        created_at: true,
        username: true,
        email: true,
        bio: true,
        Vote: true,
        chapterComments: true,
        collections: true,
        donation_donation_receiverIdTousers: true,
        donation_donation_senderIdTousers: true,
        forum: true,
        forumComments: true,
        literature: true,
        literatureComments: true,
        transactions: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user information" });
  }
});

// Get user information by ID
router.get("/id/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await prisma.users.findUnique({
      where: { userId },
      select: {
        userId: true,
        created_at: true,
        username: true,
        collections: true,
        literature: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// Update user profile
router.put("/update", jwtMiddleware, async (req: customRequest, res) => {
  const result = updateUserSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }

  const { username, bio, email, password } = result.data;
  const userId = req.userId!;

  try {
    const updatedUser = await prisma.users.update({
      where: { userId },
      data: {
        username,
        bio,
        email,
        password,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user profile" });
  }
});

// List all users
router.get("/all", async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      select: {
        userId: true,
        created_at: true,
        username: true,
        email: true,
        bio: true,
      },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

export default router;
