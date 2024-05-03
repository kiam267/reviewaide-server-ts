/*
  Warnings:

  - You are about to alter the column `userStatus` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    MODIFY `userStatus` ENUM('pending', 'active', 'deactived') NOT NULL DEFAULT 'pending';
