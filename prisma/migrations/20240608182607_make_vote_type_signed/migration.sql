/*
  Warnings:

  - You are about to alter the column `voteType` on the `Vote` table. The data in that column could be lost. The data in that column will be cast from `UnsignedInt` to `Int`.

*/
-- AlterTable
ALTER TABLE `Vote` MODIFY `voteType` INTEGER NOT NULL;
