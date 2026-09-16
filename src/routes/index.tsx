import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    // El guard real vive en _authenticated.tsx: sin sesión, /dashboard
    // redirige a /login antes de renderizar nada.
    throw redirect({ to: '/dashboard' });
  },
});
