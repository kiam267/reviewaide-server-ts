-- AlterTable
ALTER TABLE `user` MODIFY `name` VARCHAR(191) NULL DEFAULT '',
    MODIFY `password` VARCHAR(191) NOT NULL DEFAULT '';
