/*
  Warnings:

  - You are about to drop the column `team_id` on the `invitations` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "invitations" DROP CONSTRAINT "invitations_team_id_fkey";

-- AlterTable
ALTER TABLE "invitations" DROP COLUMN "team_id";
