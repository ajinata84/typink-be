import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import multer from 'multer';
import jwtMiddleware, { customRequest } from '../middleware/jwtMiddleware';

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer();

const voteSchema = z.object({
  voteType: z.enum(['upvote', 'downvote']),
});

const voteTypes = {
  upvote: 1,
  downvote: -1,
};

router.post('/vote/chapter', jwtMiddleware, upload.none(), async (req: customRequest, res) => {
  const result = voteSchema.safeParse(req.body);
  const { chapterId } = req.body;

  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }

  const { voteType } = result.data;
  const userId = req.userId!;

  try {
    const existingVote = await prisma.vote.findFirst({
      where: { userId, chapterId: Number(chapterId) },
    });

    if (existingVote) {
      const updatedVote = await prisma.vote.update({
        where: { voteId: existingVote.voteId },
        data: { voteType: voteTypes[voteType] },
      });
      return res.json(updatedVote);
    } else {
      const newVote = await prisma.vote.create({
        data: {
          userId,
          chapterId: Number(chapterId),
          voteType: voteTypes[voteType],
        },
      });
      return res.json(newVote);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to process vote' });
  }
});

router.post('/vote/literature', jwtMiddleware, upload.none(), async (req: customRequest, res) => {
  const result = voteSchema.safeParse(req.body);
  const { literatureId } = req.body;

  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }

  const { voteType } = result.data;
  const userId = req.userId!;

  try {
    const existingVote = await prisma.vote.findFirst({
      where: { userId, literatureId: Number(literatureId) },
    });

    if (existingVote) {
      const updatedVote = await prisma.vote.update({
        where: { voteId: existingVote.voteId },
        data: { voteType: voteTypes[voteType] },
      });
      return res.json(updatedVote);
    } else {
      const newVote = await prisma.vote.create({
        data: {
          userId,
          literatureId: Number(literatureId),
          voteType: voteTypes[voteType],
        },
      });
      return res.json(newVote);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to process vote' });
  }
});

router.post('/vote/chapter-comment', jwtMiddleware, upload.none(), async (req: customRequest, res) => {
  const result = voteSchema.safeParse(req.body);
  const { chapterCommentId } = req.body;

  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }

  const { voteType } = result.data;
  const userId = req.userId!;

  try {
    const existingVote = await prisma.vote.findFirst({
      where: { userId, chapterCommentId: Number(chapterCommentId) },
    });

    if (existingVote) {
      const updatedVote = await prisma.vote.update({
        where: { voteId: existingVote.voteId },
        data: { voteType: voteTypes[voteType] },
      });
      return res.json(updatedVote);
    } else {
      const newVote = await prisma.vote.create({
        data: {
          userId,
          chapterCommentId: Number(chapterCommentId),
          voteType: voteTypes[voteType],
        },
      });
      return res.json(newVote);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to process vote' });
  }
});

router.post('/vote/literature-comment', jwtMiddleware, upload.none(), async (req: customRequest, res) => {
  const result = voteSchema.safeParse(req.body);
  const { literatureCommentId } = req.body;

  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }

  const { voteType } = result.data;
  const userId = req.userId!;

  try {
    const existingVote = await prisma.vote.findFirst({
      where: { userId, literatureCommentId: Number(literatureCommentId) },
    });

    if (existingVote) {
      const updatedVote = await prisma.vote.update({
        where: { voteId: existingVote.voteId },
        data: { voteType: voteTypes[voteType] },
      });
      return res.json(updatedVote);
    } else {
      const newVote = await prisma.vote.create({
        data: {
          userId,
          literatureCommentId: Number(literatureCommentId),
          voteType: voteTypes[voteType],
        },
      });
      return res.json(newVote);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to process vote' });
  }
});

router.post('/vote/forum', jwtMiddleware, upload.none(), async (req: customRequest, res) => {
  const result = voteSchema.safeParse(req.body);
  const { forumId } = req.body;

  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }

  const { voteType } = result.data;
  const userId = req.userId!;

  try {
    const existingVote = await prisma.vote.findFirst({
      where: { userId, forumId: Number(forumId) },
    });

    if (existingVote) {
      const updatedVote = await prisma.vote.update({
        where: { voteId: existingVote.voteId },
        data: { voteType: voteTypes[voteType] },
      });
      return res.json(updatedVote);
    } else {
      const newVote = await prisma.vote.create({
        data: {
          userId,
          forumId: Number(forumId),
          voteType: voteTypes[voteType],
        },
      });
      return res.json(newVote);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to process vote' });
  }
});

router.post('/vote/forum-comment', jwtMiddleware, upload.none(), async (req: customRequest, res) => {
  const result = voteSchema.safeParse(req.body);
  const { forumCommentId } = req.body;

  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }

  const { voteType } = result.data;
  const userId = req.userId!;

  try {
    const existingVote = await prisma.vote.findFirst({
      where: { userId, forumCommentId: Number(forumCommentId) },
    });

    if (existingVote) {
      const updatedVote = await prisma.vote.update({
        where: { voteId: existingVote.voteId },
        data: { voteType: voteTypes[voteType] },
      });
      return res.json(updatedVote);
    } else {
      const newVote = await prisma.vote.create({
        data: {
          userId,
          forumCommentId: Number(forumCommentId),
          voteType: voteTypes[voteType],
        },
      });
      return res.json(newVote);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to process vote' });
  }
});

export default router;
