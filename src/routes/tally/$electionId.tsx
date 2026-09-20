import { createFileRoute } from '@tanstack/react-router';
import { TallyDetailPage } from '@/features/tally/pages/TallyDetailPage';

export const Route = createFileRoute('/tally/$electionId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { electionId } = Route.useParams();
  return <TallyDetailPage electionId={electionId} />;
}
