/*
  Warnings:

  - Made the column `projectId` on table `project_table_groups` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "project_table_groups" ALTER COLUMN "projectId" SET NOT NULL;

-- CreateTable
CREATE TABLE "project_table_merge_groups" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "table_group_merge_relations" (
    "tableGroupId" INTEGER NOT NULL,
    "tableMergeGroupId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "project_table_merge_groups_id_key" ON "project_table_merge_groups"("id");

-- CreateIndex
CREATE INDEX "project_table_merge_groups_name_idx" ON "project_table_merge_groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "project_table_merge_groups_projectId_name_key" ON "project_table_merge_groups"("projectId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "table_group_merge_relations_tableGroupId_tableMergeGroupId_key" ON "table_group_merge_relations"("tableGroupId", "tableMergeGroupId");

-- AddForeignKey
ALTER TABLE "project_table_merge_groups" ADD CONSTRAINT "project_table_merge_groups_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "table_group_merge_relations" ADD CONSTRAINT "table_group_merge_relations_tableGroupId_fkey" FOREIGN KEY ("tableGroupId") REFERENCES "project_table_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "table_group_merge_relations" ADD CONSTRAINT "table_group_merge_relations_tableMergeGroupId_fkey" FOREIGN KEY ("tableMergeGroupId") REFERENCES "project_table_merge_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
