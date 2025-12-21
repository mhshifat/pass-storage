-- CreateTable
CREATE TABLE "PasswordBreach" (
    "id" TEXT NOT NULL,
    "passwordId" TEXT NOT NULL,
    "isBreached" BOOLEAN NOT NULL,
    "breachCount" INTEGER NOT NULL DEFAULT 0,
    "hashPrefix" TEXT NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedBy" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,

    CONSTRAINT "PasswordBreach_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PasswordBreach_passwordId_idx" ON "PasswordBreach"("passwordId");

-- CreateIndex
CREATE INDEX "PasswordBreach_checkedBy_idx" ON "PasswordBreach"("checkedBy");

-- CreateIndex
CREATE INDEX "PasswordBreach_checkedAt_idx" ON "PasswordBreach"("checkedAt");

-- CreateIndex
CREATE INDEX "PasswordBreach_isBreached_idx" ON "PasswordBreach"("isBreached");

-- CreateIndex
CREATE INDEX "PasswordBreach_resolved_idx" ON "PasswordBreach"("resolved");

-- AddForeignKey
ALTER TABLE "PasswordBreach" ADD CONSTRAINT "PasswordBreach_passwordId_fkey" FOREIGN KEY ("passwordId") REFERENCES "Password"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordBreach" ADD CONSTRAINT "PasswordBreach_checkedBy_fkey" FOREIGN KEY ("checkedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordBreach" ADD CONSTRAINT "PasswordBreach_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
