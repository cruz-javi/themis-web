import { LogOut } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSession } from '@/features/auth/hooks/use-session';
import { useLogout } from '@/features/auth/hooks/use-logout';
import { ROLE_LABELS } from '@/features/auth/lib/role-labels';

function initials(nombreCompleto: string): string {
  return nombreCompleto
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function Header() {
  const { session } = useSession();
  const logout = useLogout();
  const navigate = useNavigate();

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => {
        void navigate({ to: '/login' });
      },
    });
  }

  if (!session) {
    return null;
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-5" />
        <span className="text-sm font-semibold">Themis</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-md p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
          <Avatar>
            <AvatarFallback>{initials(session.nombreCompleto)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex flex-col gap-1 font-normal">
            <span className="text-sm font-medium">{session.nombreCompleto}</span>
            <Badge variant="secondary" className="w-fit">
              {ROLE_LABELS[session.role]}
            </Badge>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={logout.isPending}
            onSelect={(event) => {
              event.preventDefault();
              handleLogout();
            }}
          >
            <LogOut />
            {logout.isPending ? 'Saliendo...' : 'Cerrar sesión'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
