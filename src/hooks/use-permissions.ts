"use client"

import { trpc } from "@/trpc/client"

/**
 * Hook to get current user's permissions
 */
export function usePermissions() {
  const { data: permissionsData, isLoading } = trpc.auth.getCurrentUserPermissions.useQuery()

  const permissions = permissionsData?.permissions || []

  const hasPermission = (permissionKey: string) => {
    return permissions.includes(permissionKey)
  }

  const hasAnyPermission = (permissionKeys: string[]) => {
    return permissionKeys.some((key) => permissions.includes(key))
  }

  const hasAllPermissions = (permissionKeys: string[]) => {
    return permissionKeys.every((key) => permissions.includes(key))
  }

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isLoading,
  }
}

