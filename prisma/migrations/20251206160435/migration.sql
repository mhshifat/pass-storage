/*
  Warnings:

  - The values [Excel] on the enum `ConnectionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ConnectionType_new" AS ENUM ('EXCEL');
ALTER TABLE "connections" ALTER COLUMN "type" TYPE "ConnectionType_new" USING ("type"::text::"ConnectionType_new");
ALTER TYPE "ConnectionType" RENAME TO "ConnectionType_old";
ALTER TYPE "ConnectionType_new" RENAME TO "ConnectionType";
DROP TYPE "public"."ConnectionType_old";
COMMIT;
