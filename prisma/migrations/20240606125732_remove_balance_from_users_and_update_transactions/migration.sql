-- CreateTable
CREATE TABLE `Vote` (
    `voteId` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` CHAR(36) NOT NULL,
    `voteType` INTEGER UNSIGNED NOT NULL,
    `chapterId` INTEGER UNSIGNED NULL,
    `literatureId` INTEGER UNSIGNED NULL,
    `chapterCommentId` INTEGER UNSIGNED NULL,
    `literatureCommentId` INTEGER UNSIGNED NULL,
    `forumId` INTEGER UNSIGNED NULL,
    `forumCommentId` INTEGER UNSIGNED NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `userIndex`(`userId`),
    INDEX `chapterIndex`(`chapterId`),
    INDEX `literatureIndex`(`literatureId`),
    INDEX `chapterCommentIndex`(`chapterCommentId`),
    INDEX `literatureCommentIndex`(`literatureCommentId`),
    INDEX `forumIndex`(`forumId`),
    INDEX `forumCommentIndex`(`forumCommentId`),
    PRIMARY KEY (`voteId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chapterComments` (
    `chapterCommentId` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `chapterId` INTEGER UNSIGNED NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `content` TEXT NOT NULL,
    `voteCount` INTEGER NOT NULL DEFAULT 0,

    INDEX `chapterIndex`(`chapterId`),
    INDEX `userIndex`(`userId`),
    PRIMARY KEY (`chapterCommentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chapters` (
    `chapterId` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `literatureId` INTEGER UNSIGNED NOT NULL,
    `chapterTitle` VARCHAR(255) NOT NULL,
    `chapterNumber` INTEGER NOT NULL,
    `imageUrl` TEXT NOT NULL,
    `content` TEXT NOT NULL,
    `voteCount` INTEGER NOT NULL DEFAULT 0,

    INDEX `literatureIndex`(`literatureId`),
    PRIMARY KEY (`chapterId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `donation` (
    `donationId` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `senderId` CHAR(36) NOT NULL,
    `receiverId` CHAR(36) NOT NULL,
    `amount` INTEGER NOT NULL,

    INDEX `receiverIndex`(`receiverId`),
    INDEX `senderIndex`(`senderId`),
    PRIMARY KEY (`donationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `forum` (
    `forumId` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `userId` CHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    `genreId` INTEGER UNSIGNED NOT NULL,
    `forumType` VARCHAR(50) NOT NULL,
    `voteCount` INTEGER NOT NULL DEFAULT 0,

    INDEX `genreIndex`(`genreId`),
    INDEX `userIndex`(`userId`),
    PRIMARY KEY (`forumId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `forumComments` (
    `forumCommentId` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `forumId` INTEGER UNSIGNED NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `content` TEXT NOT NULL,
    `voteCount` INTEGER NOT NULL DEFAULT 0,

    INDEX `forumIndex`(`forumId`),
    INDEX `userIndex`(`userId`),
    PRIMARY KEY (`forumCommentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `genre` (
    `genreId` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `genreTitle` VARCHAR(255) NULL,

    PRIMARY KEY (`genreId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `literature` (
    `literatureId` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `authorId` CHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `synopsis` TEXT NOT NULL,
    `imageUrl` TEXT NOT NULL,
    `genreId` INTEGER UNSIGNED NOT NULL,
    `language` VARCHAR(255) NOT NULL,
    `copyright` INTEGER NOT NULL,
    `voteCount` INTEGER NOT NULL DEFAULT 0,

    INDEX `authorIndex`(`authorId`),
    INDEX `genreIndex`(`genreId`),
    PRIMARY KEY (`literatureId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `literatureComments` (
    `literatureCommentId` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `userId` CHAR(36) NOT NULL,
    `literatureId` INTEGER UNSIGNED NOT NULL,
    `content` TEXT NOT NULL,
    `voteCount` INTEGER NOT NULL DEFAULT 0,

    INDEX `literatureIndex`(`literatureId`),
    INDEX `userIndex`(`userId`),
    PRIMARY KEY (`literatureCommentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `collections` (
    `collectionId` VARCHAR(191) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `userId` CHAR(36) NOT NULL,
    `literatureId` INTEGER UNSIGNED NOT NULL,

    INDEX `userIndex`(`userId`),
    INDEX `literatureIndex`(`literatureId`),
    PRIMARY KEY (`collectionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `transactionId` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` CHAR(36) NOT NULL,
    `value` DOUBLE NOT NULL,
    `transactionType` VARCHAR(50) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `userIndex`(`userId`),
    PRIMARY KEY (`transactionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin` (
    `adminId` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `admin_email_key`(`email`),
    PRIMARY KEY (`adminId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `userId` VARCHAR(191) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `username` VARCHAR(20) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `bio` TEXT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Vote` ADD CONSTRAINT `Vote_chapterCommentId_fkey` FOREIGN KEY (`chapterCommentId`) REFERENCES `chapterComments`(`chapterCommentId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vote` ADD CONSTRAINT `Vote_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `chapters`(`chapterId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vote` ADD CONSTRAINT `Vote_forumCommentId_fkey` FOREIGN KEY (`forumCommentId`) REFERENCES `forumComments`(`forumCommentId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vote` ADD CONSTRAINT `Vote_forumId_fkey` FOREIGN KEY (`forumId`) REFERENCES `forum`(`forumId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vote` ADD CONSTRAINT `Vote_literatureCommentId_fkey` FOREIGN KEY (`literatureCommentId`) REFERENCES `literatureComments`(`literatureCommentId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vote` ADD CONSTRAINT `Vote_literatureId_fkey` FOREIGN KEY (`literatureId`) REFERENCES `literature`(`literatureId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vote` ADD CONSTRAINT `Vote_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chapterComments` ADD CONSTRAINT `chapterCommenterRelation` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `chapterComments` ADD CONSTRAINT `chapterParentRelation` FOREIGN KEY (`chapterId`) REFERENCES `chapters`(`chapterId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `chapters` ADD CONSTRAINT `literatureParentRelation` FOREIGN KEY (`literatureId`) REFERENCES `literature`(`literatureId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `donation` ADD CONSTRAINT `receiverRelation` FOREIGN KEY (`receiverId`) REFERENCES `users`(`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `donation` ADD CONSTRAINT `senderRelation` FOREIGN KEY (`senderId`) REFERENCES `users`(`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `forum` ADD CONSTRAINT `forumGenreRelation` FOREIGN KEY (`genreId`) REFERENCES `genre`(`genreId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `forum` ADD CONSTRAINT `originalPosterRelation` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `forumComments` ADD CONSTRAINT `commenterRelation` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `forumComments` ADD CONSTRAINT `forumParentRelation` FOREIGN KEY (`forumId`) REFERENCES `forum`(`forumId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `literature` ADD CONSTRAINT `authorRelation` FOREIGN KEY (`authorId`) REFERENCES `users`(`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `literature` ADD CONSTRAINT `genreRelation` FOREIGN KEY (`genreId`) REFERENCES `genre`(`genreId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `literatureComments` ADD CONSTRAINT `literatureRelation` FOREIGN KEY (`literatureId`) REFERENCES `literature`(`literatureId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `literatureComments` ADD CONSTRAINT `userRelation` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `collections` ADD CONSTRAINT `collections_literatureId_fkey` FOREIGN KEY (`literatureId`) REFERENCES `literature`(`literatureId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `collections` ADD CONSTRAINT `collections_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;
