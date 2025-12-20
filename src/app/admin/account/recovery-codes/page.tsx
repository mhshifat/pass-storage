"use client"

import { RecoveryCodesManager } from "@/modules/auth/client/recovery-codes/recovery-codes-manager"

export default function RecoveryCodesPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recovery Codes</h1>
        <p className="text-muted-foreground mt-1">
          Manage backup codes to access your account if you lose your MFA device
        </p>
      </div>

      <RecoveryCodesManager />
    </div>
  )
}
