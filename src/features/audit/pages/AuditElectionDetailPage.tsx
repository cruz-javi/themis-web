import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { useBatches } from '@/features/batch-approval/hooks/use-batches';
import { BatchStatusBadge } from '@/features/batch-approval/components/BatchStatusBadge';
import { useRateAlerts } from '../hooks/use-rate-alerts';
import { useAuditResult } from '../hooks/use-audit-result';

export interface AuditElectionDetailPageProps {
  electionId: string;
}

// CU-15: vista de auditoria de solo lectura -- historial de lotes de
// registro (reusa useBatches de batch-approval/, mismo dato que ve la
// autoridad, sin el boton de aprobar), alertas de ritmo (CU-06), y el
// resultado (final si ya cerro, en vivo si no) con el desglose relay vs.
// chain-sync como senal de cuanto tuvo que recuperar la red de seguridad.
export function AuditElectionDetailPage({ electionId }: AuditElectionDetailPageProps) {
  const batchesQuery = useBatches(electionId);
  const rateAlertsQuery = useRateAlerts(electionId);
  const auditResultQuery = useAuditResult(electionId);
  const audit = auditResultQuery.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Auditoría de elección</h1>
        {audit ? <Badge variant="secondary">{audit.estado}</Badge> : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resultado</CardTitle>
          <CardDescription>
            {audit?.result
              ? `Conteo final inmutable, calculado el ${new Date(audit.result.computedAt).toLocaleString('es-BO')}`
              : 'La elección todavía no cerró: se muestra el conteo en vivo'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {(audit?.result ? null : audit?.liveTally)?.map((option) => (
            <div key={option.optionId} className="flex justify-between text-sm">
              <span>{option.nombre}</span>
              <span className="font-medium">{option.voteCount}</span>
            </div>
          ))}
          {audit?.result ? (
            <>
              <p className="text-sm">Total: {audit.result.totalVotes} votos</p>
              <p className="text-xs text-muted-foreground">
                Raíz final: <code>{audit.result.finalMerkleRoot}</code> · bloque{' '}
                {audit.result.sourceBlockNumber}
              </p>
            </>
          ) : null}
          {audit ? (
            <p className="text-xs text-muted-foreground">
              Votos persistidos por relay síncrono: {audit.voteSubmissionCounts.relay} · recuperados
              por sincronización on-chain: {audit.voteSubmissionCounts.chainSync}
            </p>
          ) : null}
          {audit?.chainSync ? (
            <p className="text-xs text-muted-foreground">
              Sincronizado hasta el bloque {audit.chainSync.lastSyncedBlock} (
              {new Date(audit.chainSync.updatedAt).toLocaleString('es-BO')})
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de lotes de registro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {batchesQuery.data?.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todavía no hay lotes.</p>
          ) : null}
          {batchesQuery.data?.map((batch) => (
            <div key={batch.id} className="flex items-center justify-between text-sm">
              <span>{new Date(batch.closedAt).toLocaleString('es-BO')}</span>
              <span>{batch.credentialCount} credenciales</span>
              <BatchStatusBadge status={batch.status} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alertas de ritmo de registro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {rateAlertsQuery.data?.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin alertas registradas.</p>
          ) : null}
          {rateAlertsQuery.data?.map((alert) => (
            <div key={alert.id} className="text-sm">
              {new Date(alert.windowStart).toLocaleString('es-BO')}: {alert.registrationCount}{' '}
              registros (umbral {alert.thresholdPerMinute}/min)
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
