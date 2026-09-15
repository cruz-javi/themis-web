import { Outlet, createFileRoute } from '@tanstack/react-router';
import { requireAuth } from '@/features/auth/lib/require-auth';

/**
 * Layout "pathless" (el prefijo `_` no agrega segmento a la URL): agrupa
 * todas las rutas administrativas que exigen sesión. El guard vive una
 * sola vez acá, en vez de repetirse en el `beforeLoad` de cada ruta hija
 * (`src/routes/_authenticated/*`) — agregar una ruta protegida nueva es
 * tan simple como crear el archivo dentro de esta carpeta.
 */
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context }) => requireAuth(context.auth),
  component: () => <Outlet />,
});
