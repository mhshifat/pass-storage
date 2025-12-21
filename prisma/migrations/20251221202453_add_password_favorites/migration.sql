-- AlterTable
ALTER TABLE "Password" ADD COLUMN     "isFavorite" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Password_isFavorite_idx" ON "Password"("isFavorite");
