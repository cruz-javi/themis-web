import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { usePublicElections } from '../hooks/use-public-elections';

// CU-11: pagina publica (sin auth) -- cualquiera puede ver que elecciones
// existen y entrar a su conteo en vivo, sin depender de sesion.
export function TallyElectionsListPage() {
  const electionsQuery = usePublicElections();

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Conteo de votos en vivo</h1>
        <p className="text-sm text-muted-foreground">
          Elegí una elección para ver su conteo en tiempo real.
        </p>
      </div>

      {electionsQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : null}

      {electionsQuery.isError ? (
        <p className="text-sm text-red-700" role="alert">
          No se pudieron cargar las elecciones.
        </p>
      ) : null}

      {electionsQuery.data?.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no hay elecciones públicas.</p>
      ) : null}

      <div className="space-y-3">
        {electionsQuery.data?.map((election) => (
          <Link
            key={election.id}
            to="/tally/$electionId"
            params={{ electionId: election.id }}
            className="block"
          >
            <Card className="transition-colors hover:bg-accent">
              <CardHeader>
                <CardTitle>{election.nombre}</CardTitle>
                <CardDescription>{election.estado}</CardDescription>
              </CardHeader>
              {election.descripcion ? (
                <CardContent className="text-sm text-muted-foreground">
                  {election.descripcion}
                </CardContent>
              ) : null}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
