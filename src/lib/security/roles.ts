export {
  APP_ROLES,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
  normalizeRole,
  roleHasPermission,
  roleHasAnyPermission,
  type AppRole,
  type Permission,
} from './permissions'

import { type AppRole } from './permissions'

export function hasRole(role: string | null | undefined, allowed: readonly AppRole[]) {
  return Boolean(role && allowed.includes(role as AppRole))
}
