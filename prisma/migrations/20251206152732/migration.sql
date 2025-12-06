-- CreateEnum
CREATE TYPE "ConnectionType" AS ENUM ('Excel');

-- CreateTable
CREATE TABLE "connections" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ConnectionType" NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "connections_id_key" ON "connections"("id");

-- CreateIndex
CREATE INDEX "connections_name_idx" ON "connections"("name");

-- CreateIndex
CREATE INDEX "connections_type_idx" ON "connections"("type");
