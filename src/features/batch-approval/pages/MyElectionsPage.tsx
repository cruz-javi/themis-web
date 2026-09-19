import * as React from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table/DataTable';
import { ESTADO_LABELS } from '@/features/admin-elections/components/ElectionsDataTable';
import type { ElectionDto } from '@/features/admin-elections/types/election.types';
import { useMyAuthorityElections } from '../hooks/use-my-authority-elections';

const PAGE_SIZE = 10;

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const columns: ColumnDef<ElectionDto>[] = [
  { accessorKey: 'nombre', header: 'Nombre' },
  {
    accessorKey: 'estado',
    header: 'Estado',
    cell: ({ row }) => ESTADO_LABELS[row.original.estado],
  },
  {
    id: 'registro',
    header: 'Registro',
    cell: ({ row }) =>
      `${formatDate(row.original.registroInicio)} — ${formatDate(row.original.registroFin)}`,
  },
];

/** Elecciones donde la cuenta esta designada como autoridad: punto de entrada a los lotes. */
export function MyElectionsPage() {
  const navigate = useNavigate();
  const [pageIndex, setPageIndex] = React.useState(0);
  const electionsQuery = useMyAuthorityElections();

  const all = electionsQuery.data ?? [];
  const data = all.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE);
  const pageCount = Math.max(1, Math.ceil(all.length / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mis elecciones</h1>
        <p className="text-sm text-muted-foreground">
          Elecciones en las que estás designado como autoridad de registro. Entra a una para
          revisar y aprobar sus lotes.
        </p>
      </div>

      {electionsQuery.isError ? (
        <p className="text-sm text-red-700" role="alert">
          No se pudieron cargar tus elecciones.
        </p>
      ) : null}

      <DataTable
        columns={columns}
        data={data}
        pageIndex={pageIndex}
        pageSize={PAGE_SIZE}
        pageCount={pageCount}
        onPageChange={setPageIndex}
        isLoading={electionsQuery.isLoading}
        rowActions={{
          onView: (election) =>
            navigate({
              to: '/elections/$electionId/batches',
              params: { electionId: election.id },
            }),
        }}
        emptyMessage="No estás designado como autoridad en ninguna elección."
      />
    </div>
  );
}
