-- CreateTable
CREATE TABLE "PasswordPolicy" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "minLength" INTEGER NOT NULL DEFAULT 12,
    "requireUppercase" BOOLEAN NOT NULL DEFAULT true,
    "requireLowercase" BOOLEAN NOT NULL DEFAULT true,
    "requireNumbers" BOOLEAN NOT NULL DEFAULT true,
    "requireSpecial" BOOLEAN NOT NULL DEFAULT true,
    "expirationDays" INTEGER,
    "preventReuseCount" INTEGER NOT NULL DEFAULT 0,
    "requireChangeOnFirstLogin" BOOLEAN NOT NULL DEFAULT false,
    "requireChangeAfterDays" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordPolicy_companyId_key" ON "PasswordPolicy"("companyId");

-- CreateIndex
CREATE INDEX "PasswordPolicy_companyId_idx" ON "PasswordPolicy"("companyId");

-- AddForeignKey
ALTER TABLE "PasswordPolicy" ADD CONSTRAINT "PasswordPolicy_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
