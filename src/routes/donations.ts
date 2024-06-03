import express from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import multer from "multer";
import jwtMiddleware, { customRequest } from "../middleware/jwtMiddleware";

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer();

const donationSchema = z.object({
  receiverId: z.string().uuid(),
  amount: z.number().positive(),
});

router.post("/donate", jwtMiddleware, upload.none(), async (req: customRequest, res) => {
  const result = donationSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }

  const { receiverId, amount } = result.data;
  const senderId = req.userId!; // Extract userId from JWT token

  try {
    const donation = await prisma.donation.create({
      data: {
        senderId,
        receiverId,
        amount,
      },
    });

    await prisma.users.update({
      where: { userId: receiverId },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    res.json(donation);
  } catch (error) {
    res.status(500).json({ error: "Donation failed" });
  }
});

export default router;
