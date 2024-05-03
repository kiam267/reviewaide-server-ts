/*
  Warnings:

  - You are about to drop the column `name` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `name`,
    ADD COLUMN `companyLogo` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `companyName` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `facebookLink` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `fullName` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `googleLink` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `isValid` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `phone` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `uniqueId` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `userEmailText` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `userSmsText` VARCHAR(191) NOT NULL DEFAULT '',
    ALTER COLUMN `password` DROP DEFAULT;
