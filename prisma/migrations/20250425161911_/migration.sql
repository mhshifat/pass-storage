/*
  Warnings:

  - You are about to drop the column `algorithm` on the `tokens` table. All the data in the column will be lost.
  - You are about to drop the column `digits` on the `tokens` table. All the data in the column will be lost.
  - You are about to drop the column `issuer` on the `tokens` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `tokens` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `tokens` table. All the data in the column will be lost.
  - You are about to drop the column `period` on the `tokens` table. All the data in the column will be lost.
  - You are about to drop the column `secret` on the `tokens` table. All the data in the column will be lost.
  - You are about to drop the column `service_url` on the `tokens` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `tokens` table. All the data in the column will be lost.
  - Added the required column `entry` to the `tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `iv` to the `tokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tokens" DROP COLUMN "algorithm",
DROP COLUMN "digits",
DROP COLUMN "issuer",
DROP COLUMN "name",
DROP COLUMN "password",
DROP COLUMN "period",
DROP COLUMN "secret",
DROP COLUMN "service_url",
DROP COLUMN "username",
ADD COLUMN     "entry" TEXT NOT NULL,
ADD COLUMN     "iv" TEXT NOT NULL;
