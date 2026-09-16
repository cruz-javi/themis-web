// Contrato TS a mano, siguiendo
// themis-core/src/modules/auth/presentation/dto/create-user.dto.ts y
// create-user-response.dto.ts.
// TODO: reemplazar por tipos generados cuando se instale openapi-typescript.

export type CreatableRole = 'ADMIN' | 'AUTORIDAD_REGISTRO' | 'AUDITOR';

export interface CreateUserRequest {
  email: string;
  password: string;
  nombreCompleto: string;
  role: CreatableRole;
}

export interface CreateUserResponse {
  id: string;
  email: string;
  nombreCompleto: string;
  role: CreatableRole;
}
