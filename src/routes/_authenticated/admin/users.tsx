import { createFileRoute } from '@tanstack/react-router';
import { requireSuperUsuario } from '@/features/auth/lib/role-guards';
import { CreateUserPage } from '@/features/create-user/pages/CreateUserPage';

export const Route = createFileRoute('/_authenticated/admin/users')({
  beforeLoad: ({ context }) => requireSuperUsuario(context.auth),
  component: CreateUserPage,
});
