export type UserRole = 'CUSTOMER' | 'ADMIN' | 'MANAGER';

export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  role: UserRole;
  isActivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}
