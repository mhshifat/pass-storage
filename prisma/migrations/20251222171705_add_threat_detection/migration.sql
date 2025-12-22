-- CreateEnum
CREATE TYPE "ThreatType" AS ENUM ('BRUTE_FORCE', 'RATE_LIMIT_EXCEEDED', 'UNUSUAL_ACCESS_PATTERN', 'SUSPICIOUS_LOCATION', 'MULTIPLE_FAILED_LOGINS', 'ANOMALY_DETECTED');

-- CreateEnum
CREATE TYPE "ThreatSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "RateLimitType" AS ENUM ('IP', 'USER');

-- CreateTable
CREATE TABLE "ThreatEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "companyId" TEXT,
    "threatType" "ThreatType" NOT NULL,
    "severity" "ThreatSeverity" NOT NULL DEFAULT 'MEDIUM',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "details" JSONB,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ThreatEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimit" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "identifierType" "RateLimitType" NOT NULL,
    "action" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "windowEnd" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ThreatEvent_userId_idx" ON "ThreatEvent"("userId");

-- CreateIndex
CREATE INDEX "ThreatEvent_companyId_idx" ON "ThreatEvent"("companyId");

-- CreateIndex
CREATE INDEX "ThreatEvent_threatType_idx" ON "ThreatEvent"("threatType");

-- CreateIndex
CREATE INDEX "ThreatEvent_severity_idx" ON "ThreatEvent"("severity");

-- CreateIndex
CREATE INDEX "ThreatEvent_isResolved_idx" ON "ThreatEvent"("isResolved");

-- CreateIndex
CREATE INDEX "ThreatEvent_createdAt_idx" ON "ThreatEvent"("createdAt");

-- CreateIndex
CREATE INDEX "ThreatEvent_ipAddress_idx" ON "ThreatEvent"("ipAddress");

-- CreateIndex
CREATE INDEX "RateLimit_identifier_identifierType_action_idx" ON "RateLimit"("identifier", "identifierType", "action");

-- CreateIndex
CREATE INDEX "RateLimit_windowEnd_idx" ON "RateLimit"("windowEnd");

-- CreateIndex
CREATE INDEX "RateLimit_companyId_idx" ON "RateLimit"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimit_identifier_identifierType_action_windowStart_key" ON "RateLimit"("identifier", "identifierType", "action", "windowStart");

-- AddForeignKey
ALTER TABLE "ThreatEvent" ADD CONSTRAINT "ThreatEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreatEvent" ADD CONSTRAINT "ThreatEvent_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RateLimit" ADD CONSTRAINT "RateLimit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
