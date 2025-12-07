-- CreateEnum
CREATE TYPE "ProjectDatasource" AS ENUM ('EXCEL');

-- AlterTable
ALTER TABLE "connections" ALTER COLUMN "description" DROP NOT NULL;

-- CreateTable
CREATE TABLE "projects" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "datasource" "ProjectDatasource" NOT NULL,
    "metadata" JSONB,
    "connectionId" INTEGER
);

-- CreateIndex
CREATE UNIQUE INDEX "projects_id_key" ON "projects"("id");

-- CreateIndex
CREATE INDEX "projects_name_idx" ON "projects"("name");

-- CreateIndex
CREATE INDEX "projects_datasource_idx" ON "projects"("datasource");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "connections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
