/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `table_group_merge_relations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `table_group_merge_relations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `table_group_merge_relations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "table_group_merge_relations" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "table_group_merge_relations_id_key" ON "table_group_merge_relations"("id");
