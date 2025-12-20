"use client"

import { useTranslation } from "react-i18next"
import { UserStats } from "@/modules/users/client"

interface UserStatsClientProps {
  stats: {
    total: number
    active: number
    mfa: number
    admins: number
  }
}

export function UserStatsClient({ stats }: UserStatsClientProps) {
  const { t } = useTranslation()
  const { total, active, mfa, admins } = stats

  const statsData = [
    {
      label: t("users.totalUsers"),
      value: total.toLocaleString(),
      description: t("users.totalUsersDescription"),
    },
    {
      label: t("users.activeUsers"),
      value: active.toLocaleString(),
      description: total ? t("users.activeUsersDescription", { percentage: Math.round((active / total) * 100) }) : "",
    },
    {
      label: t("users.mfaEnabled"),
      value: mfa.toLocaleString(),
      description: total ? t("users.mfaEnabledDescription", { percentage: Math.round((mfa / total) * 100) }) : "",
    },
    {
      label: t("users.admins"),
      value: admins.toLocaleString(),
      description: total ? t("users.adminsDescription", { percentage: parseFloat(((admins / total) * 100).toFixed(1)) }) : "",
    },
  ]

  return <UserStats stats={statsData} />
}
