-- CreateTable
CREATE TABLE "TemporaryPasswordShare" (
    "id" TEXT NOT NULL,
    "passwordId" TEXT NOT NULL,
    "shareToken" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "maxAccesses" INTEGER,
    "isOneTime" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "accessedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemporaryPasswordShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TemporaryPasswordShare_shareToken_key" ON "TemporaryPasswordShare"("shareToken");

-- CreateIndex
CREATE INDEX "TemporaryPasswordShare_passwordId_idx" ON "TemporaryPasswordShare"("passwordId");

-- CreateIndex
CREATE INDEX "TemporaryPasswordShare_createdBy_idx" ON "TemporaryPasswordShare"("createdBy");

-- CreateIndex
CREATE INDEX "TemporaryPasswordShare_shareToken_idx" ON "TemporaryPasswordShare"("shareToken");

-- CreateIndex
CREATE INDEX "TemporaryPasswordShare_expiresAt_idx" ON "TemporaryPasswordShare"("expiresAt");

-- AddForeignKey
ALTER TABLE "TemporaryPasswordShare" ADD CONSTRAINT "TemporaryPasswordShare_passwordId_fkey" FOREIGN KEY ("passwordId") REFERENCES "Password"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemporaryPasswordShare" ADD CONSTRAINT "TemporaryPasswordShare_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
