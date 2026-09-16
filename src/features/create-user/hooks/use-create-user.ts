import { useMutation } from '@tanstack/react-query';
import { api } from '@/api/client';
import type { CreateUserResponse } from '../types/create-user.types';
import type { CreateUserFormValues } from '../schemas/create-user.schema';

export function useCreateUser() {
  return useMutation({
    mutationFn: (input: CreateUserFormValues) =>
      api.post<CreateUserResponse>('/auth/users', input),
  });
}
