import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApiError } from '@/api/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import {
  createUserSchema,
  type CreateUserFormValues,
} from '../schemas/create-user.schema';
import { useCreateUser } from '../hooks/use-create-user';

// Select nativo: son solo 3 opciones fijas, no amerita instalar el Select de
// shadcn/Radix. forwardRef es obligatorio para que react-hook-form pueda
// leer su valor (ver themis-web/README.md, seccion shadcn/ui).
const RoleSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    data-slot="select"
    className={cn(
      'border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
      'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
      'aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
      className,
    )}
    {...props}
  >
    <option value="">Selecciona un rol</option>
    <option value="ADMIN">Administrador</option>
    <option value="AUTORIDAD_REGISTRO">Autoridad de Registro</option>
    <option value="AUDITOR">Auditor</option>
  </select>
));
RoleSelect.displayName = 'RoleSelect';

function mutationErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 409) {
      return 'Ya existe una cuenta con ese email.';
    }
    if (error.status === 403) {
      return 'No tienes permiso para crear cuentas.';
    }
  }
  return 'No se pudo crear la cuenta. Intenta de nuevo.';
}

export function CreateUserPage() {
  const createUser = useCreateUser();
  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { email: '', password: '', nombreCompleto: '', role: undefined },
  });

  function onSubmit(values: CreateUserFormValues) {
    createUser.mutate(values, {
      onSuccess: () => {
        form.reset();
      },
    });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center p-6">
      <div className="w-full">
        <h1 className="mb-6 text-center text-2xl font-bold text-slate-900">
          Themis - Crear cuenta de plataforma
        </h1>
        <Card>
          <CardHeader>
            <CardTitle>Nueva cuenta</CardTitle>
            <CardDescription>
              Administrador, Autoridad de Registro o Auditor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(onSubmit)}
              noValidate
            >
              <div className="space-y-2">
                <Label htmlFor="nombreCompleto">Nombre completo</Label>
                <Input
                  id="nombreCompleto"
                  autoComplete="name"
                  aria-invalid={!!form.formState.errors.nombreCompleto}
                  {...form.register('nombreCompleto')}
                />
                {form.formState.errors.nombreCompleto ? (
                  <p className="text-sm text-red-700">
                    {form.formState.errors.nombreCompleto.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="off"
                  placeholder="nueva.autoridad@themis.dev"
                  aria-invalid={!!form.formState.errors.email}
                  {...form.register('email')}
                />
                {form.formState.errors.email ? (
                  <p className="text-sm text-red-700">
                    {form.formState.errors.email.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contrasena</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={!!form.formState.errors.password}
                  {...form.register('password')}
                />
                {form.formState.errors.password ? (
                  <p className="text-sm text-red-700">
                    {form.formState.errors.password.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <RoleSelect
                  id="role"
                  aria-invalid={!!form.formState.errors.role}
                  {...form.register('role')}
                />
                {form.formState.errors.role ? (
                  <p className="text-sm text-red-700">
                    {form.formState.errors.role.message}
                  </p>
                ) : null}
              </div>

              {createUser.isError ? (
                <p className="text-sm text-red-700" role="alert">
                  {mutationErrorMessage(createUser.error)}
                </p>
              ) : null}

              {createUser.isSuccess ? (
                <p className="text-sm text-green-700" role="status">
                  Cuenta creada: {createUser.data.email} ({createUser.data.role})
                </p>
              ) : null}

              <Button
                type="submit"
                className="w-full"
                disabled={createUser.isPending}
              >
                {createUser.isPending ? 'Creando...' : 'Crear cuenta'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
