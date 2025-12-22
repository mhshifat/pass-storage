-- CreateTable
CREATE TABLE "IpWhitelist" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "companyId" TEXT,
    "ipAddress" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "IpWhitelist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeographicRestriction" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "companyId" TEXT,
    "countryCode" TEXT NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'BLOCK',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "GeographicRestriction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IpWhitelist_userId_idx" ON "IpWhitelist"("userId");

-- CreateIndex
CREATE INDEX "IpWhitelist_companyId_idx" ON "IpWhitelist"("companyId");

-- CreateIndex
CREATE INDEX "IpWhitelist_ipAddress_idx" ON "IpWhitelist"("ipAddress");

-- CreateIndex
CREATE INDEX "IpWhitelist_isActive_idx" ON "IpWhitelist"("isActive");

-- CreateIndex
CREATE INDEX "GeographicRestriction_userId_idx" ON "GeographicRestriction"("userId");

-- CreateIndex
CREATE INDEX "GeographicRestriction_companyId_idx" ON "GeographicRestriction"("companyId");

-- CreateIndex
CREATE INDEX "GeographicRestriction_countryCode_idx" ON "GeographicRestriction"("countryCode");

-- CreateIndex
CREATE INDEX "GeographicRestriction_isActive_idx" ON "GeographicRestriction"("isActive");

-- AddForeignKey
ALTER TABLE "IpWhitelist" ADD CONSTRAINT "IpWhitelist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IpWhitelist" ADD CONSTRAINT "IpWhitelist_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IpWhitelist" ADD CONSTRAINT "IpWhitelist_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeographicRestriction" ADD CONSTRAINT "GeographicRestriction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeographicRestriction" ADD CONSTRAINT "GeographicRestriction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeographicRestriction" ADD CONSTRAINT "GeographicRestriction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
