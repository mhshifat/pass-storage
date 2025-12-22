-- CreateTable
CREATE TABLE "PasswordTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "service" TEXT,
    "icon" TEXT,
    "category" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT,
    "companyId" TEXT,
    "defaultFields" JSONB NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PasswordTemplate_ownerId_idx" ON "PasswordTemplate"("ownerId");

-- CreateIndex
CREATE INDEX "PasswordTemplate_companyId_idx" ON "PasswordTemplate"("companyId");

-- CreateIndex
CREATE INDEX "PasswordTemplate_isSystem_idx" ON "PasswordTemplate"("isSystem");

-- CreateIndex
CREATE INDEX "PasswordTemplate_isPublic_idx" ON "PasswordTemplate"("isPublic");

-- CreateIndex
CREATE INDEX "PasswordTemplate_category_idx" ON "PasswordTemplate"("category");

-- CreateIndex
CREATE INDEX "PasswordTemplate_service_idx" ON "PasswordTemplate"("service");

-- AddForeignKey
ALTER TABLE "PasswordTemplate" ADD CONSTRAINT "PasswordTemplate_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordTemplate" ADD CONSTRAINT "PasswordTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
