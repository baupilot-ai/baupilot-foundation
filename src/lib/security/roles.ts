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
  client: 'Bauherr / Client',
  viewer: 'Viewer',
}

export const ROLE_PERMISSIONS = {
  manageCompany: ['owner', 'admin'],
  manageProjects: ['owner', 'admin', 'bauleiter'],
  manageSiteOperations: ['owner', 'admin', 'bauleiter', 'polier'],
  deleteRecords: ['owner', 'admin', 'bauleiter'],
  readOnly: ['client', 'viewer'],
} satisfies Record<string, readonly AppRole[]>

export function hasRole(role: string | null | undefined, allowed: readonly AppRole[]) {
  return Boolean(role && allowed.includes(role as AppRole))
}
