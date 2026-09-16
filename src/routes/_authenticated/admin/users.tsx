import { createFileRoute } from '@tanstack/react-router';
import { requireRole } from '@/features/auth/lib/require-role';
import { CreateUserPage } from '@/features/create-user/pages/CreateUserPage';

export const Route = createFileRoute('/_authenticated/admin/users')({
  beforeLoad: ({ context }) => requireRole(context.auth, ['SUPERUSUARIO']),
  component: CreateUserPage,
});
