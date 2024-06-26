import express from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import multer from "multer";
import { jwtMiddleware, customRequest } from "../middleware/jwtMiddleware";

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer();

const donationSchema = z.object({
  receiverId: z.string().uuid(),
  amount: z.coerce.number().positive(),
  message: z.string(),
});

router.post(
  "/donate",
  jwtMiddleware,
  upload.none(),
  async (req: customRequest, res) => {
    const result = donationSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }

    const { receiverId, amount, message } = result.data;
    const senderId = req.userId!; // Extract userId from JWT token

    try {
      // Check if sender and receiver exist
      const sender = await prisma.users.findUnique({
        where: { userId: senderId },
      });
      const receiver = await prisma.users.findUnique({
        where: { userId: receiverId },
      });

      if (!sender || !receiver) {
        return res.status(404).json({ error: "Sender or receiver not found" });
      }

      // Create the donation record
      const donation = await prisma.donation.create({
        data: {
          senderId,
          receiverId,
          amount,
        },
      });

      // Log transaction for sender (outgoing donation)
      await prisma.transactions.create({
        data: {
          userId: senderId,
          value: -amount,
          transactionType: "Outgoing donation",
          message: message,
        },
      });

      // Log transaction for receiver (incoming donation)
      await prisma.transactions.create({
        data: {
          userId: receiverId,
          value: amount,
          transactionType: "Incoming donation",
          message: message,
        },
      });

      res.json(donation);
    } catch (error) {
      res.status(500).json({ error: "Donation failed" });
    }
  }
);

router.get(
  "/donators/receiving/:receiverId",
  jwtMiddleware,
  async (req: customRequest, res) => {
    const receiverId = req.params.receiverId;

    try {
      const donators = await prisma.donation.findMany({
        where: { receiverId },

        include: {
          users_donation_receiverIdTousers: {
            select: {
              username: true,
            },
          },
          users_donation_senderIdTousers: {
            select: {
              username: true,
            },
          },
        },
      });

      res.json(donators);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch donators" });
    }
  }
);

router.get(
  "/donators/sender/:senderId",
  jwtMiddleware,
  async (req: customRequest, res) => {
    const senderId = req.params.senderId;

    try {
      const donators = await prisma.donation.findMany({
        where: { senderId },

        include: {
          users_donation_receiverIdTousers: {
            select: {
              username: true,
            },
          },
          users_donation_senderIdTousers: {
            select: {
              username: true,
            },
          },
        },
      });

      res.json(donators);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch donators" });
    }
  }
);

router.get(
  "/transactions/:userId",
  jwtMiddleware,
  async (req: customRequest, res) => {
    const userId = req.params.userId;

    try {
      const transactions = await prisma.transactions.findMany({
        where: { userId },
        orderBy: { created_at: "desc" },
      });

      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  }
);

export default router;
