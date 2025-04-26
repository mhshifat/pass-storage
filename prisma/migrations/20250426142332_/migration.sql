/*
  Warnings:

  - Added the required column `encrypted_vault_key` to the `teams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salt` to the `teams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vault_key_iv` to the `teams` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "encrypted_vault_key" TEXT NOT NULL,
ADD COLUMN     "salt" TEXT NOT NULL,
ADD COLUMN     "vault_key_iv" TEXT NOT NULL;
