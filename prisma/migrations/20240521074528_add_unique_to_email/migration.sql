-- CreateTable
CREATE TABLE `chapterComments` (
    `chapterCommentId` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `chapterId` INTEGER UNSIGNED NOT NULL,
    `userId` INTEGER UNSIGNED NOT NULL,
    `content` TEXT NOT NULL,

    INDEX `chapterIndex`(`chapterId`),
    INDEX `userIndex`(`userId`),
    PRIMARY KEY (`chapterCommentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chapters` (
    `chapterId` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `literatureId` INTEGER UNSIGNED NOT NULL,
    `chapterTItle` VARCHAR(255) NOT NULL,
    `chapterNumber` INTEGER NOT NULL,
    `imageUrl` TEXT NOT NULL,

    INDEX `literatureIndex`(`literatureId`),
    PRIMARY KEY (`chapterId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `donation` (
    `donationId` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `senderId` INTEGER UNSIGNED NOT NULL,
    `receiverId` INTEGER UNSIGNED NOT NULL,
    `amount` INTEGER NOT NULL,

    INDEX `receiverIndex`(`receiverId`),
    INDEX `senderIndex`(`senderId`),
    PRIMARY KEY (`donationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `forum` (
    `forumId` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `userId` INTEGER UNSIGNED NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    `votes` INTEGER NOT NULL DEFAULT 0,
    `genreId` INTEGER UNSIGNED NOT NULL,

    INDEX `genreIndex`(`genreId`),
    INDEX `userIndex`(`userId`),
    PRIMARY KEY (`forumId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `forumComments` (
    `forumCommentId` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `forumId` INTEGER UNSIGNED NOT NULL,
    `userId` INTEGER UNSIGNED NOT NULL,
    `content` TEXT NOT NULL,

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
    `authorId` INTEGER UNSIGNED NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `synopsis` TEXT NOT NULL,
    `imageUrl` TEXT NOT NULL,
    `genreId` INTEGER UNSIGNED NOT NULL,

    INDEX `authorIndex`(`authorId`),
    INDEX `genreIndex`(`genreId`),
    PRIMARY KEY (`literatureId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `literatureComments` (
    `literatureCommentId` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `userId` INTEGER UNSIGNED NOT NULL,
    `literatureId` INTEGER UNSIGNED NOT NULL,
    `content` TEXT NOT NULL,

    INDEX `literatureIndex`(`literatureId`),
    INDEX `userIndex`(`userId`),
    PRIMARY KEY (`literatureCommentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `userId` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `username` VARCHAR(20) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
