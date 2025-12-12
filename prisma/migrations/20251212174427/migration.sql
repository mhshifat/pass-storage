/*
  Warnings:

  - You are about to drop the column `groupByColumn` on the `project_table_groups` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "project_table_groups" DROP COLUMN "groupByColumn";

-- AlterTable
ALTER TABLE "project_table_merge_groups" ADD COLUMN     "groupByColumn" TEXT;
