-- AlterTable
ALTER TABLE "Password" ADD COLUMN     "rotationPolicyId" TEXT;

-- CreateTable
CREATE TABLE "PasswordRotationPolicy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "rotationDays" INTEGER NOT NULL,
    "reminderDays" INTEGER NOT NULL,
    "autoRotate" BOOLEAN NOT NULL DEFAULT false,
    "requireApproval" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordRotationPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordRotation" (
    "id" TEXT NOT NULL,
    "passwordId" TEXT NOT NULL,
    "policyId" TEXT,
    "rotationType" TEXT NOT NULL DEFAULT 'MANUAL',
    "oldPassword" TEXT,
    "newPassword" TEXT NOT NULL,
    "rotatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rotatedBy" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "notes" TEXT,

    CONSTRAINT "PasswordRotation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PasswordRotationPolicy_ownerId_idx" ON "PasswordRotationPolicy"("ownerId");

-- CreateIndex
CREATE INDEX "PasswordRotationPolicy_isActive_idx" ON "PasswordRotationPolicy"("isActive");

-- CreateIndex
CREATE INDEX "PasswordRotation_passwordId_idx" ON "PasswordRotation"("passwordId");

-- CreateIndex
CREATE INDEX "PasswordRotation_policyId_idx" ON "PasswordRotation"("policyId");

-- CreateIndex
CREATE INDEX "PasswordRotation_rotatedBy_idx" ON "PasswordRotation"("rotatedBy");

-- CreateIndex
CREATE INDEX "PasswordRotation_rotatedAt_idx" ON "PasswordRotation"("rotatedAt");

-- CreateIndex
CREATE INDEX "PasswordRotation_status_idx" ON "PasswordRotation"("status");

-- CreateIndex
CREATE INDEX "PasswordRotation_scheduledFor_idx" ON "PasswordRotation"("scheduledFor");

-- CreateIndex
CREATE INDEX "Password_rotationPolicyId_idx" ON "Password"("rotationPolicyId");

-- AddForeignKey
ALTER TABLE "Password" ADD CONSTRAINT "Password_rotationPolicyId_fkey" FOREIGN KEY ("rotationPolicyId") REFERENCES "PasswordRotationPolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordRotationPolicy" ADD CONSTRAINT "PasswordRotationPolicy_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordRotation" ADD CONSTRAINT "PasswordRotation_passwordId_fkey" FOREIGN KEY ("passwordId") REFERENCES "Password"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordRotation" ADD CONSTRAINT "PasswordRotation_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "PasswordRotationPolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordRotation" ADD CONSTRAINT "PasswordRotation_rotatedBy_fkey" FOREIGN KEY ("rotatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
