-- CreateTable
CREATE TABLE "AuditLogArchive" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "archiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "logCount" INTEGER NOT NULL,
    "filePath" TEXT,
    "fileSize" INTEGER,
    "archivedBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLogArchive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLogSearch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT,
    "name" TEXT,
    "searchQuery" TEXT NOT NULL,
    "filters" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLogSearch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLogArchive_companyId_idx" ON "AuditLogArchive"("companyId");

-- CreateIndex
CREATE INDEX "AuditLogArchive_archiveDate_idx" ON "AuditLogArchive"("archiveDate");

-- CreateIndex
CREATE INDEX "AuditLogArchive_status_idx" ON "AuditLogArchive"("status");

-- CreateIndex
CREATE INDEX "AuditLogSearch_userId_idx" ON "AuditLogSearch"("userId");

-- CreateIndex
CREATE INDEX "AuditLogSearch_companyId_idx" ON "AuditLogSearch"("companyId");

-- CreateIndex
CREATE INDEX "AuditLogSearch_lastUsedAt_idx" ON "AuditLogSearch"("lastUsedAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_status_idx" ON "AuditLog"("status");

-- CreateIndex
CREATE INDEX "AuditLog_resource_idx" ON "AuditLog"("resource");

-- AddForeignKey
ALTER TABLE "AuditLogArchive" ADD CONSTRAINT "AuditLogArchive_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLogArchive" ADD CONSTRAINT "AuditLogArchive_archivedBy_fkey" FOREIGN KEY ("archivedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLogSearch" ADD CONSTRAINT "AuditLogSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLogSearch" ADD CONSTRAINT "AuditLogSearch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
