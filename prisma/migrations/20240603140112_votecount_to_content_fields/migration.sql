/*
  Warnings:

  - You are about to drop the column `votes` on the `forum` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `chapterComments` ADD COLUMN `voteCount` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `chapters` ADD COLUMN `voteCount` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `forum` DROP COLUMN `votes`,
    ADD COLUMN `voteCount` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `forumComments` ADD COLUMN `voteCount` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `literature` ADD COLUMN `voteCount` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `literatureComments` ADD COLUMN `voteCount` INTEGER NOT NULL DEFAULT 0;
