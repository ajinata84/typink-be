import express from 'express';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import multer from 'multer';

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer();

const generateToken = (userId: string) => {
  const secret = process.env.JWT_SECRET!;
  return jwt.sign({ userId }, secret, { expiresIn: '1h' });
};

// Zod schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Register Route
router.post('/register', upload.none(), async (req, res) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }

  const { email, password, username } = result.data;

  try {
    const hashedPassword = await argon2.hash(password);
    const userId = uuidv4();
    const user = await prisma.users.create({
      data: {
        userId,
        email,
        password: hashedPassword,
        username,
      },
    });

    const token = generateToken(user.userId);

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// Login Route
router.post('/login', upload.none(), async (req, res) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }

  const { email, password } = result.data;

  try {
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const validPassword = await argon2.verify(user.password, password);

    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.userId);

    res.json({ token });
  } catch (error) { 
    res.status(500).json({ error: 'User authentication failed' });
  }
});

export default router;
