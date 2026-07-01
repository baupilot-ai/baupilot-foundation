import { type ReactNode } from 'react'
import { ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type Permission } from '@/lib/security/permissions'
import { usePermissions } from '@/hooks/use-permissions'

type PermissionGateProps = {
  permission?: Permission
  anyOf?: readonly Permission[]
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGate({ permission, anyOf, children, fallback }: PermissionGateProps) {
  const { loading, can, canAny } = usePermissions()

  if (loading) return null

  const allowed = permission ? can(permission) : anyOf ? canAny(anyOf) : true
  if (allowed) return <>{children}</>

  return (
    <>
      {fallback ?? (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" /> Zugriff gesperrt
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Dein Benutzerkonto hat für diesen Bereich nur eingeschränkte Rechte.
          </CardContent>
        </Card>
      )}
    </>
  )
}
