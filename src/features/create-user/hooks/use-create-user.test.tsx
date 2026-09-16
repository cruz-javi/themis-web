import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { useCreateUser } from './use-create-user';

const { postMock } = vi.hoisted(() => ({ postMock: vi.fn() }));

vi.mock('@/api/client', () => ({
  api: { post: postMock },
}));

describe('useCreateUser', () => {
  beforeEach(() => {
    postMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function wrapper({ children }: { children: ReactNode }) {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  it('llama a POST /auth/users con los datos del formulario', async () => {
    const response = {
      id: 'id-1',
      email: 'nueva.autoridad@themis.dev',
      nombreCompleto: 'Nueva Autoridad',
      role: 'AUTORIDAD_REGISTRO' as const,
    };
    postMock.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useCreateUser(), { wrapper });
    const input = {
      email: 'nueva.autoridad@themis.dev',
      password: 'unaClaveSegura123',
      nombreCompleto: 'Nueva Autoridad',
      role: 'AUTORIDAD_REGISTRO' as const,
    };

    act(() => {
      result.current.mutate(input);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(postMock).toHaveBeenCalledWith('/auth/users', input);
    expect(result.current.data).toEqual(response);
  });

  it('propaga el error cuando la API responde 409', async () => {
    postMock.mockRejectedValueOnce(new Error('409'));

    const { result } = renderHook(() => useCreateUser(), { wrapper });

    act(() => {
      result.current.mutate({
        email: 'repetido@themis.dev',
        password: 'unaClaveSegura123',
        nombreCompleto: 'Repetido',
        role: 'ADMIN',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
