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
  amount: z.coerce.number().positive(),
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

    const { receiverId, amount } = result.data;
    const senderId = req.userId!; // Extract userId from JWT token

    try {
      // Retrieve the sender's current balance
      const sender = await prisma.users.findUnique({
        where: { userId: senderId },
      });
      const receiver = await prisma.users.findUnique({
        where: { userId: receiverId },
      });

      if (!sender || !receiver) {
        return res.status(404).json({ error: "Sender or receiver not found" });
      }

      const senderBeforeBalance = sender.balance;
      const receiverBeforeBalance = receiver.balance;

      // Create the donation record
      const donation = await prisma.donation.create({
        data: {
          senderId,
          receiverId,
          amount,
        },
      });

      // Update the receiver's balance
      await prisma.users.update({
        where: { userId: receiverId },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      // Log transaction for sender (outgoing donation)
      await prisma.transactions.create({
        data: {
          userId: senderId,
          beforeBalance: senderBeforeBalance,
          afterBalance: senderBeforeBalance - amount,
          transactionType: "outgoing donation",
        },
      });

      // Log transaction for receiver (incoming donation)
      await prisma.transactions.create({
        data: {
          userId: receiverId,
          beforeBalance: receiverBeforeBalance,
          afterBalance: receiverBeforeBalance + amount,
          transactionType: "incoming donation",
        },
      });

      res.json(donation);
    } catch (error) {
      res.status(500).json({ error: "Donation failed" });
    }
  }
);

router.get(
  "/donators/:receiverId",
  jwtMiddleware,
  async (req: customRequest, res) => {
    const receiverId = req.params.receiverId;

    try {
      const donators = await prisma.donation.findMany({
        where: { receiverId },
        select: {
          senderId: true,
          amount: true,
          created_at: true,
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
