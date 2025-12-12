/*
  Warnings:

  - You are about to drop the column `created_at` on the `table_group_merge_relations` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `table_group_merge_relations` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `table_group_merge_relations` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `table_group_merge_relations` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "table_group_merge_relations_id_key";

-- AlterTable
ALTER TABLE "table_group_merge_relations" DROP COLUMN "created_at",
DROP COLUMN "id",
DROP COLUMN "name",
DROP COLUMN "updated_at";
