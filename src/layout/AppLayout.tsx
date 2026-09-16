import { Outlet } from '@tanstack/react-router';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Header } from './Header';

/**
 * Chrome compartido de toda la zona autenticada: envuelve `<Outlet />` en
 * `_authenticated.tsx`, así que `/login` (fuera de ese layout pathless)
 * nunca lo ve. Sin `children`: es de uso único, montado una sola vez desde
 * la ruta.
 */
export function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
