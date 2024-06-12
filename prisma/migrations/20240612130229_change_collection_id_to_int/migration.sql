/*
  Warnings:

  - The primary key for the `collections` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `collectionId` on the `collections` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `UnsignedInt`.

*/
-- AlterTable
ALTER TABLE `collections` DROP PRIMARY KEY,
    MODIFY `collectionId` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`collectionId`);
