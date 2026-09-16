import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { useSession } from '@/features/auth/hooks/use-session';
import { ROLE_LABELS } from '@/features/auth/lib/role-labels';

/**
 * Landing genérica post-login para los 4 roles. Placeholder honesto: sin
 * datos falsos ni gráficos todavía — el contenido real de cada rol se
 * define más adelante (ver docs/HU).
 */
export function DashboardPage() {
  const { session } = useSession();

  if (!session) {
    return null;
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Bienvenido, {session.nombreCompleto}</CardTitle>
        <CardDescription>
          <Badge variant="secondary">{ROLE_LABELS[session.role]}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Esta es la pantalla de inicio del portal. El contenido específico de tu rol todavía
          no está definido.
        </p>
      </CardContent>
    </Card>
  );
}
