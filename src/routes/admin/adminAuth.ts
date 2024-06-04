import express from "express";
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { z } from "zod";
import multer from "multer";

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer();

const generateToken = (adminId: number) => {
  const secret = process.env.JWT_SECRET!;
  return jwt.sign({ adminId }, secret, { expiresIn: "7h" });
};

// Zod schemas
const adminRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(1),
});

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Register Route
router.post("/register", upload.none(), async (req, res) => {
  const result = adminRegisterSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }

  const { email, password, username } = result.data;

  try {
    const hashedPassword = await argon2.hash(password);
    const admin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        username,
      },
    });

    const token = generateToken(admin.adminId);

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// Login Route
router.post("/login", upload.none(), async (req, res) => {
  const result = adminLoginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }

  const { email, password } = result.data;

  try {
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const validPassword = await argon2.verify(admin.password, password);

    if (!validPassword) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = generateToken(admin.adminId);

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Admin authentication failed" });
  }
});

export default router;
