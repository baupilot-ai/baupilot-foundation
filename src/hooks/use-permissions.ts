import { useMemo } from 'react'
import { useProfile } from '@/hooks/use-profile'
import {
  normalizeRole,
  roleHasPermission,
  roleHasAnyPermission,
  type Permission,
} from '@/lib/security/permissions'

export function usePermissions() {
  const { profile, loading } = useProfile()
  const role = normalizeRole(profile?.role)

  return useMemo(
    () => ({
      loading,
      profile,
      role,
      can: (permission: Permission) => roleHasPermission(role, permission),
      canAny: (permissions: readonly Permission[]) => roleHasAnyPermission(role, permissions),
    }),
    [loading, profile, role],
  )
}
