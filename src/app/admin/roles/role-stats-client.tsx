"use client"

import { useTranslation } from "react-i18next"
import { RoleStats } from "@/modules/roles/client"

interface RoleStatsClientProps {
  stats: {
    total: number
    system: number
    custom: number
    permissions: number
  }
}

export function RoleStatsClient({ stats }: RoleStatsClientProps) {
  const { t } = useTranslation()
  const { total, system, custom, permissions } = stats

  const statsData = [
    {
      label: t("roles.totalRoles"),
      value: total.toLocaleString(),
      description: t("roles.totalRolesDescription", { system, custom }),
    },
    {
      label: t("roles.systemRoles"),
      value: system.toLocaleString(),
      description: t("roles.systemRolesDescription"),
    },
    {
      label: t("roles.customRoles"),
      value: custom.toLocaleString(),
      description: t("roles.customRolesDescription"),
    },
    {
      label: t("roles.permissions"),
      value: permissions.toLocaleString(),
      description: t("roles.permissionsDescription"),
    },
  ]

  return <RoleStats stats={statsData} />
}
