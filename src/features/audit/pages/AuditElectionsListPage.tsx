import { Link } from '@tanstack/react-router';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { usePublicElections } from '@/features/tally/hooks/use-public-elections';

// CU-15: listado de elecciones para el Auditor. Reusa el mismo endpoint
// publico que CU-11 (GET /elections/public) -- antes de esto el Auditor no
// tenia forma de listar elecciones (GET /elections es ADMIN-only).
export function AuditElectionsListPage() {
  const electionsQuery = usePublicElections();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Auditoría</h1>
        <p className="text-sm text-muted-foreground">
          Elegí una elección para ver su historial de registro y resultado.
        </p>
      </div>

      {electionsQuery.isError ? (
        <p className="text-sm text-red-700" role="alert">
          No se pudieron cargar las elecciones.
        </p>
      ) : null}

      <div className="space-y-3">
        {electionsQuery.data?.map((election) => (
          <Link
            key={election.id}
            to="/audit/elections/$electionId"
            params={{ electionId: election.id }}
            className="block"
          >
            <Card className="transition-colors hover:bg-accent">
              <CardHeader>
                <CardTitle>{election.nombre}</CardTitle>
                <CardDescription>{election.estado}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
