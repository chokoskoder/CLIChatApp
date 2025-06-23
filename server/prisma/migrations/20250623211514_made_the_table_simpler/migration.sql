/*
  Warnings:

  - You are about to drop the column `encrypted_private_key` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password_salt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_username_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "encrypted_private_key",
DROP COLUMN "password_salt",
DROP COLUMN "username";
