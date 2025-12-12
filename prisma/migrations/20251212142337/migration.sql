-- CreateTable
CREATE TABLE "project_table_groups" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "columns" TEXT[],
    "projectId" INTEGER
);

-- CreateIndex
CREATE UNIQUE INDEX "project_table_groups_id_key" ON "project_table_groups"("id");

-- CreateIndex
CREATE INDEX "project_table_groups_name_idx" ON "project_table_groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "project_table_groups_projectId_name_key" ON "project_table_groups"("projectId", "name");

-- AddForeignKey
ALTER TABLE "project_table_groups" ADD CONSTRAINT "project_table_groups_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
