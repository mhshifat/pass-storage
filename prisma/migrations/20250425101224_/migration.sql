/*
  Warnings:

  - You are about to drop the column `email` on the `credentials` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `encrypted_vault_key` to the `credentials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salt` to the `credentials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vault_key_iv` to the `credentials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "credentials_email_key";

-- AlterTable
ALTER TABLE "credentials" DROP COLUMN "email",
ADD COLUMN     "encrypted_vault_key" BYTEA NOT NULL,
ADD COLUMN     "salt" BYTEA NOT NULL,
ADD COLUMN     "vault_key_iv" BYTEA NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
