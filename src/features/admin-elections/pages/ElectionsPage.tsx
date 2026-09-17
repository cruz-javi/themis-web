import * as React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useElections } from '../hooks/use-elections';
import { useDeleteElection } from '../hooks/use-delete-election';
import { ElectionsDataTable } from '../components/ElectionsDataTable';
import { ElectionFormDrawer } from '../components/ElectionFormDrawer';
import type { ElectionDto, ElectionStatus } from '../types/election.types';

const PAGE_SIZE = 10;

const ESTADO_OPTIONS: { value: ElectionStatus; label: string }[] = [
  { value: 'BORRADOR', label: 'Borrador' },
  { value: 'REGISTRO_ABIERTO', label: 'Registro abierto' },
  { value: 'VOTACION_ABIERTA', label: 'Votación abierta' },
  { value: 'CERRADA', label: 'Cerrada' },
];

type DrawerState = { mode: 'create' } | { mode: 'edit'; election: ElectionDto } | null;

export function ElectionsPage() {
  const navigate = useNavigate();
  const [pageIndex, setPageIndex] = React.useState(0);
  const [nombre, setNombre] = React.useState('');
  const [estado, setEstado] = React.useState<ElectionStatus | ''>('');

  const electionsQuery = useElections({
    nombre: nombre || undefined,
    estado: estado || undefined,
  });
  const deleteElection = useDeleteElection();

  const [drawer, setDrawer] = React.useState<DrawerState>(null);
  const [electionToDelete, setElectionToDelete] = React.useState<ElectionDto | null>(null);

  const allData = electionsQuery.data ?? [];
  const data = allData.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE);
  const pageCount = Math.max(1, Math.ceil(allData.length / PAGE_SIZE));

  function handleConfirmDelete() {
    if (!electionToDelete) {
      return;
    }
    deleteElection.mutate(electionToDelete.id, {
      onSuccess: () => setElectionToDelete(null),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Elecciones</h1>
          <p className="text-sm text-muted-foreground">
            Crear, configurar y administrar elecciones (HU-01).
          </p>
        </div>
        <Button type="button" onClick={() => setDrawer({ mode: 'create' })}>
          <Plus className="size-4" />
          Nueva elección
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Filtrar por nombre"
          value={nombre}
          onChange={(event) => {
            setNombre(event.target.value);
            setPageIndex(0);
          }}
          className="max-w-xs"
        />
        <select
          className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
          value={estado}
          onChange={(event) => {
            setEstado(event.target.value as ElectionStatus | '');
            setPageIndex(0);
          }}
        >
          <option value="">Todos los estados</option>
          {ESTADO_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <ElectionsDataTable
        data={data}
        pageIndex={pageIndex}
        pageSize={PAGE_SIZE}
        pageCount={pageCount}
        onPageChange={setPageIndex}
        isLoading={electionsQuery.isLoading}
        onView={(election) =>
          navigate({ to: '/admin/elections/$electionId', params: { electionId: election.id } })
        }
        onEdit={(election) => setDrawer({ mode: 'edit', election })}
        onDelete={(election) => setElectionToDelete(election)}
      />

      <ElectionFormDrawer
        open={drawer !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDrawer(null);
          }
        }}
        mode={drawer?.mode ?? 'create'}
        election={drawer?.mode === 'edit' ? drawer.election : null}
      />

      <AlertDialog
        open={electionToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setElectionToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar elección</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar <span className="font-medium">{electionToDelete?.nombre}</span> de
              forma permanente. Solo es posible mientras esté en Borrador.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteElection.isError ? (
            <p className="text-sm text-red-700" role="alert">
              No se pudo eliminar. La elección puede haber dejado de estar en Borrador.
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleConfirmDelete();
              }}
              disabled={deleteElection.isPending}
            >
              {deleteElection.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
