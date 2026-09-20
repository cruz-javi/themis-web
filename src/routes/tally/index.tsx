import { createFileRoute } from '@tanstack/react-router';
import { TallyElectionsListPage } from '@/features/tally/pages/TallyElectionsListPage';

// Publica (fuera de _authenticated): CU-11 no requiere sesion ni identidad.
export const Route = createFileRoute('/tally/')({
  component: TallyElectionsListPage,
});
