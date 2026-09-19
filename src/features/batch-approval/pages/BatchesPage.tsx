import * as React from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table/DataTable';
import { useSession } from '@/features/auth/hooks/use-session';
import { useBatches } from '../hooks/use-batches';
import { BatchStatusBadge } from '../components/BatchStatusBadge';
import type { BatchDto } from '../types/batch.types';

const PAGE_SIZE = 10;

export interface BatchesPageProps {
  electionId: string;
}

export function BatchesPage({ electionId }: BatchesPageProps) {
  const navigate = useNavigate();
  const { session } = useSession();
  const isAuthority = session?.role === 'AUTORIDAD_REGISTRO';
  const [pageIndex, setPageIndex] = React.useState(0);
  const batchesQuery = useBatches(electionId);

  // Mas recientes primero.
  const all = [...(batchesQuery.data ?? [])].sort(
    (a, b) => new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime(),
  );
  const data = all.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE);
  const pageCount = Math.max(1, Math.ceil(all.length / PAGE_SIZE));

  const columns: ColumnDef<BatchDto>[] = [
    {
      id: 'cierre',
      header: 'Cierre del checkpoint',
      cell: ({ row }) => new Date(row.original.closedAt).toLocaleString('es-BO'),
    },
    {
      id: 'estado',
      header: 'Estado',
      cell: ({ row }) => <BatchStatusBadge status={row.original.status} />,
    },
    { accessorKey: 'credentialCount', header: 'Credenciales' },
    {
      id: 'aprobaciones',
      header: 'Aprobaciones',
      cell: ({ row }) => `${row.original.approvalCount} de ${row.original.approvalsRequired}`,
    },
  ];

  if (isAuthority) {
    columns.push({
      id: 'tuAprobacion',
      header: 'Tu aprobación',
      cell: ({ row }) =>
        row.original.yaAprobado
          ? 'Aprobado'
          : row.original.status === 'PENDING_APPROVAL'
            ? 'Pendiente'
            : '—',
    });
  }

  function goBack() {
    if (isAuthority) {
      navigate({ to: '/authority/elections' });
    } else {
      navigate({ to: '/admin/elections/$electionId', params: { electionId } });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lotes de checkpoint</h1>
          <p className="text-sm text-muted-foreground">
            Cada checkpoint agrupa las credenciales presentadas. Con las aprobaciones necesarias,
            el lote se inserta en el árbol on-chain.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={goBack}>
          <ArrowLeft className="size-4" />
          Volver
        </Button>
      </div>

      {batchesQuery.isError ? (
        <p className="text-sm text-red-700" role="alert">
          No se pudieron cargar los lotes.
        </p>
      ) : null}

      <DataTable
        columns={columns}
        data={data}
        pageIndex={pageIndex}
        pageSize={PAGE_SIZE}
        pageCount={pageCount}
        onPageChange={setPageIndex}
        isLoading={batchesQuery.isLoading}
        rowActions={{
          onView: (batch) =>
            navigate({
              to: '/elections/$electionId/batches/$batchId',
              params: { electionId, batchId: batch.id },
            }),
        }}
        emptyMessage="Todavía no hay lotes: se crean al cerrar cada checkpoint si hay credenciales pendientes."
      />
    </div>
  );
}
