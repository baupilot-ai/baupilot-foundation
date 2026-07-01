export const APP_ROLES = [
  'owner',
  'admin',
  'bauleiter',
  'polier',
  'subcontractor',
  'client',
  'viewer',
] as const

export type AppRole = (typeof APP_ROLES)[number]

export const ROLE_LABELS: Record<AppRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  bauleiter: 'Bauleiter',
  polier: 'Polier',
  subcontractor: 'Nachunternehmer',
  client: 'Bauherr',
  viewer: 'Nur Lesen',
}

export const PERMISSIONS = [
  'dashboard.read',
  'company.read',
  'company.update',
  'company.billing',
  'projects.read',
  'projects.create',
  'projects.update',
  'projects.delete',
  'site.read',
  'site.write',
  'site.delete',
  'documents.read',
  'documents.write',
  'documents.upload',
  'documents.approve',
  'documents.archive',
  'documents.delete',
  'milestones.read',
  'milestones.write',
  'notifications.read',
  'quality.read',
  'quality.write',
  'resources.read',
  'resources.write',
  'resources.delete',
  'team.read',
  'team.write',
  'team.delete',
  'settings.read',
  'settings.update',
  'ai.chat',
  'ai.daily_reports',
  'ai.protocols',
  'ai.search',
  'ai.summary',
  'ai.settings',
  'ai.admin',
] as const

export type Permission = (typeof PERMISSIONS)[number]

export const ROLE_PERMISSIONS: Record<AppRole, readonly Permission[]> = {
  owner: PERMISSIONS,
  admin: PERMISSIONS.filter((p) => p !== 'company.billing'),
  bauleiter: [
    'dashboard.read',
    'company.read',
    'projects.read',
    'projects.create',
    'projects.update',
    'projects.delete',
    'site.read',
    'site.write',
    'site.delete',
    'documents.read',
    'documents.write',
    'documents.upload',
    'documents.approve',
    'documents.archive',
    'documents.delete',
    'milestones.read',
    'milestones.write',
    'notifications.read',
    'quality.read',
    'quality.write',
    'resources.read',
    'resources.write',
    'team.read',
    'settings.read',
  ],
  polier: [
    'dashboard.read',
    'company.read',
    'projects.read',
    'site.read',
    'site.write',
    'documents.read',
    'documents.write',
    'documents.upload',
    'milestones.read',
    'milestones.write',
    'notifications.read',
    'quality.read',
    'quality.write',
    'resources.read',
    'resources.write',
    'team.read',
    'settings.read',
  ],
  subcontractor: [
    'dashboard.read',
    'projects.read',
    'site.read',
    'site.write',
    'documents.read',
    'documents.write',
    'documents.upload',
    'notifications.read',
    'settings.read',
  ],
  client: [
    'dashboard.read',
    'projects.read',
    'site.read',
    'documents.read',
    'milestones.read',
    'notifications.read',
    'quality.read',
    'settings.read',
  ],
  viewer: [
    'dashboard.read',
    'projects.read',
    'site.read',
    'documents.read',
    'milestones.read',
    'notifications.read',
    'quality.read',
    'settings.read',
  ],
}

export function normalizeRole(role: string | null | undefined): AppRole | null {
  if (!role) return null
  return APP_ROLES.includes(role as AppRole) ? (role as AppRole) : null
}

export function roleHasPermission(role: string | null | undefined, permission: Permission): boolean {
  const normalized = normalizeRole(role)
  if (!normalized) return false
  return ROLE_PERMISSIONS[normalized].includes(permission)
}

export function roleHasAnyPermission(role: string | null | undefined, permissions: readonly Permission[]): boolean {
  return permissions.some((permission) => roleHasPermission(role, permission))
}
