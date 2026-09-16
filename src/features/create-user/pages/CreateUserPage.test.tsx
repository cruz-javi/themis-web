import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateUserPage } from './CreateUserPage';

const { postMock, MockApiError } = vi.hoisted(() => {
  class HoistedMockApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
    }
  }

  return { postMock: vi.fn(), MockApiError: HoistedMockApiError };
});

vi.mock('@/api/client', () => ({
  api: { post: postMock },
  ApiError: MockApiError,
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <CreateUserPage />
    </QueryClientProvider>,
  );
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Nombre completo'), 'Nueva Autoridad');
  await user.type(screen.getByLabelText('Email'), 'nueva.autoridad@themis.dev');
  await user.type(screen.getByLabelText('Contrasena'), 'unaClaveSegura123');
  await user.selectOptions(screen.getByLabelText('Rol'), 'AUTORIDAD_REGISTRO');
}

describe('CreateUserPage', () => {
  beforeEach(() => {
    postMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('envia el formulario y muestra un mensaje de exito', async () => {
    postMock.mockResolvedValueOnce({
      id: 'id-1',
      email: 'nueva.autoridad@themis.dev',
      nombreCompleto: 'Nueva Autoridad',
      role: 'AUTORIDAD_REGISTRO',
    });
    const user = userEvent.setup();
    renderPage();

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(
      await screen.findByText(
        'Cuenta creada: nueva.autoridad@themis.dev (AUTORIDAD_REGISTRO)',
      ),
    ).toBeInTheDocument();
    expect(postMock).toHaveBeenCalledWith('/auth/users', {
      email: 'nueva.autoridad@themis.dev',
      password: 'unaClaveSegura123',
      nombreCompleto: 'Nueva Autoridad',
      role: 'AUTORIDAD_REGISTRO',
    });
  });

  it('muestra un mensaje especifico cuando el email ya existe (409)', async () => {
    postMock.mockRejectedValueOnce(new MockApiError('conflict', 409));
    const user = userEvent.setup();
    renderPage();

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(
      await screen.findByText('Ya existe una cuenta con ese email.'),
    ).toBeInTheDocument();
  });

  it('valida el formulario con zod antes de llamar a la API', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(await screen.findByText('El nombre es obligatorio')).toBeInTheDocument();
    expect(postMock).not.toHaveBeenCalled();
  });
});
