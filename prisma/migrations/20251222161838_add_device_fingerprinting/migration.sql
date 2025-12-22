-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "deviceFingerprint" TEXT,
ADD COLUMN     "requireMfa" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Session_userId_deviceFingerprint_idx" ON "Session"("userId", "deviceFingerprint");
