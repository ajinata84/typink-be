/*
  Warnings:

  - You are about to alter the column `userId` on the `chapterComments` table. The data in that column could be lost. The data in that column will be cast from `UnsignedInt` to `Char(36)`.
  - You are about to drop the column `chapterTItle` on the `chapters` table. All the data in the column will be lost.
  - You are about to alter the column `senderId` on the `donation` table. The data in that column could be lost. The data in that column will be cast from `UnsignedInt` to `Char(36)`.
  - You are about to alter the column `receiverId` on the `donation` table. The data in that column could be lost. The data in that column will be cast from `UnsignedInt` to `Char(36)`.
  - You are about to alter the column `userId` on the `forum` table. The data in that column could be lost. The data in that column will be cast from `UnsignedInt` to `Char(36)`.
  - You are about to alter the column `userId` on the `forumComments` table. The data in that column could be lost. The data in that column will be cast from `UnsignedInt` to `Char(36)`.
  - You are about to alter the column `authorId` on the `literature` table. The data in that column could be lost. The data in that column will be cast from `UnsignedInt` to `Char(36)`.
  - You are about to alter the column `userId` on the `literatureComments` table. The data in that column could be lost. The data in that column will be cast from `UnsignedInt` to `Char(36)`.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `userId` on the `users` table. The data in that column could be lost. The data in that column will be cast from `UnsignedInt` to `Char(36)`.
  - Added the required column `chapterTitle` to the `chapters` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `chapterComments` DROP FOREIGN KEY `chapterCommenterRelation`;

-- DropForeignKey
ALTER TABLE `donation` DROP FOREIGN KEY `receiverRelation`;

-- DropForeignKey
ALTER TABLE `donation` DROP FOREIGN KEY `senderRelation`;

-- DropForeignKey
ALTER TABLE `forum` DROP FOREIGN KEY `originalPosterRelation`;

-- DropForeignKey
ALTER TABLE `forumComments` DROP FOREIGN KEY `commenterRelation`;

-- DropForeignKey
ALTER TABLE `literature` DROP FOREIGN KEY `authorRelation`;

-- DropForeignKey
ALTER TABLE `literatureComments` DROP FOREIGN KEY `userRelation`;

-- AlterTable
ALTER TABLE `chapterComments` MODIFY `userId` CHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE `chapters` DROP COLUMN `chapterTItle`,
    ADD COLUMN `chapterTitle` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `donation` MODIFY `senderId` CHAR(36) NOT NULL,
    MODIFY `receiverId` CHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE `forum` MODIFY `userId` CHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE `forumComments` MODIFY `userId` CHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE `literature` MODIFY `authorId` CHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE `literatureComments` MODIFY `userId` CHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE `users` DROP PRIMARY KEY,
    MODIFY `userId` CHAR(36) NOT NULL,
    ADD PRIMARY KEY (`userId`);

-- AddForeignKey
ALTER TABLE `chapterComments` ADD CONSTRAINT `chapterCommenterRelation` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `donation` ADD CONSTRAINT `receiverRelation` FOREIGN KEY (`receiverId`) REFERENCES `users`(`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `donation` ADD CONSTRAINT `senderRelation` FOREIGN KEY (`senderId`) REFERENCES `users`(`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `forum` ADD CONSTRAINT `originalPosterRelation` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `forumComments` ADD CONSTRAINT `commenterRelation` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `literature` ADD CONSTRAINT `authorRelation` FOREIGN KEY (`authorId`) REFERENCES `users`(`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `literatureComments` ADD CONSTRAINT `userRelation` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;
