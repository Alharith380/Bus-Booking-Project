import type { AuthResponse, LoginInput, RegisterInput } from '@/features/auth/types';

export type AuthService = {
  login(input: LoginInput): Promise<AuthResponse>;
  register(input: RegisterInput): Promise<AuthResponse>;
};
