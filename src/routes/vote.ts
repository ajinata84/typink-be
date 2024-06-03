import express, { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import multer from "multer";
import jwtMiddleware, { customRequest } from "../middleware/jwtMiddleware";

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer();

const voteSchema = z.object({
  voteType: z.enum(["upvote", "downvote"]),
});

const voteTypes = {
  upvote: 1,
  downvote: -1,
};

type voteTargets =
  | "chapters"
  | "literature"
  | "chapterComments"
  | "literatureComments"
  | "forum"
  | "forumComments";

type targetIds =
  | "chapterId"
  | "literatureId"
  | "chapterCommentId"
  | "literatureCommentId"
  | "forumId"
  | "forumCommentId";

const handleVote = async (
  req: customRequest,
  res: Response,
  voteTarget: voteTargets,
  targetId: targetIds
) => {
  const result = voteSchema.safeParse(req.body);
  const { [targetId]: id } = req.body;

  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }

  const { voteType } = result.data;
  const userId = req.userId!;
  const voteValue = voteTypes[voteType];

  try {
    const existingVote = await prisma.vote.findFirst({
      where: { userId, [targetId]: Number(id) },
    });

    if (existingVote) {
      const difference = voteValue - existingVote.voteType;
      const updatedVote = await prisma.vote.update({
        where: { voteId: existingVote.voteId },
        data: { voteType: voteValue },
      });

      if (voteTarget === "chapters") {
        await prisma.chapters.update({
          where: { chapterId: Number(id) },
          data: { voteCount: { increment: difference } },
        });
      } else if (voteTarget === "literature") {
        await prisma.literature.update({
          where: { literatureId: Number(id) },
          data: { voteCount: { increment: difference } },
        });
      } else if (voteTarget === "chapterComments") {
        await prisma.chapterComments.update({
          where: { chapterCommentId: Number(id) },
          data: { voteCount: { increment: difference } },
        });
      } else if (voteTarget === "literatureComments") {
        await prisma.literatureComments.update({
          where: { literatureCommentId: Number(id) },
          data: { voteCount: { increment: difference } },
        });
      } else if (voteTarget === "forum") {
        await prisma.forum.update({
          where: { forumId: Number(id) },
          data: { voteCount: { increment: difference } },
        });
      } else if (voteTarget === "forumComments") {
        await prisma.forumComments.update({
          where: { forumCommentId: Number(id) },
          data: { voteCount: { increment: difference } },
        });
      }

      return res.json(updatedVote);
    } else {
      const newVote = await prisma.vote.create({
        data: {
          userId,
          [targetId]: Number(id),
          voteType: voteValue,
        },
      });

      if (voteTarget === "chapters") {
        await prisma.chapters.update({
          where: { chapterId: Number(id) },
          data: { voteCount: { increment: voteValue } },
        });
      } else if (voteTarget === "literature") {
        await prisma.literature.update({
          where: { literatureId: Number(id) },
          data: { voteCount: { increment: voteValue } },
        });
      } else if (voteTarget === "chapterComments") {
        await prisma.chapterComments.update({
          where: { chapterCommentId: Number(id) },
          data: { voteCount: { increment: voteValue } },
        });
      } else if (voteTarget === "literatureComments") {
        await prisma.literatureComments.update({
          where: { literatureCommentId: Number(id) },
          data: { voteCount: { increment: voteValue } },
        });
      } else if (voteTarget === "forum") {
        await prisma.forum.update({
          where: { forumId: Number(id) },
          data: { voteCount: { increment: voteValue } },
        });
      } else if (voteTarget === "forumComments") {
        await prisma.forumComments.update({
          where: { forumCommentId: Number(id) },
          data: { voteCount: { increment: voteValue } },
        });
      }

      return res.json(newVote);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to process vote" });
  }
};

router.post(
  "/vote/chapter",
  jwtMiddleware,
  upload.none(),
  async (req: customRequest, res) => {
    await handleVote(req, res, "chapters", "chapterId");
  }
);

router.post(
  "/vote/literature",
  jwtMiddleware,
  upload.none(),
  async (req: customRequest, res) => {
    await handleVote(req, res, "literature", "literatureId");
  }
);

router.post(
  "/vote/chapter-comment",
  jwtMiddleware,
  upload.none(),
  async (req: customRequest, res) => {
    await handleVote(req, res, "chapterComments", "chapterCommentId");
  }
);

router.post(
  "/vote/literature-comment",
  jwtMiddleware,
  upload.none(),
  async (req: customRequest, res) => {
    await handleVote(req, res, "literatureComments", "literatureCommentId");
  }
);

router.post(
  "/vote/forum",
  jwtMiddleware,
  upload.none(),
  async (req: customRequest, res) => {
    await handleVote(req, res, "forum", "forumId");
  }
);

router.post(
  "/vote/forum-comment",
  jwtMiddleware,
  upload.none(),
  async (req: customRequest, res) => {
    await handleVote(req, res, "forumComments", "forumCommentId");
  }
);

export default router;
