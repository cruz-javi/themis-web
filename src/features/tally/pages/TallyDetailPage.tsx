import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Progress } from '@/components/ui/progress';
import { useTally } from '../hooks/use-tally';

export interface TallyDetailPageProps {
  electionId: string;
}

// CU-11: conteo en vivo, publico (sin auth). Se refresca solo (useTally),
// funciona tanto durante VOTACION_ABIERTA como despues de CERRADA (en ese
// caso refleja el ultimo estado sincronizado, no necesariamente el snapshot
// inmutable de CU-14 -- para eso esta la auditoria).
export function TallyDetailPage({ electionId }: TallyDetailPageProps) {
  const tallyQuery = useTally(electionId);
  const tally = tallyQuery.data;
  const total = tally?.totalVotes ?? 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Conteo en vivo</h1>
        <p className="text-sm text-muted-foreground">
          Se actualiza automáticamente cada pocos segundos.
        </p>
      </div>

      {tallyQuery.isError ? (
        <p className="text-sm text-red-700" role="alert">
          No se pudo cargar el conteo.
        </p>
      ) : null}

      {tally ? (
        <Card>
          <CardHeader>
            <CardTitle>{tally.estado}</CardTitle>
            <CardDescription>{total} voto{total === 1 ? '' : 's'} en total</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tally.opciones.map((option) => {
              const pct = total === 0 ? 0 : Math.round((option.voteCount / total) * 100);
              return (
                <div key={option.optionId} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{option.nombre}</span>
                    <span className="text-muted-foreground">
                      {option.voteCount} ({pct}%)
                    </span>
                  </div>
                  <Progress value={pct} />
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
