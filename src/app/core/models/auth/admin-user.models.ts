import { AuthUser, UserRole } from './user.models';

export interface CreateAdminUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
}

export interface UpdateAdminUserRequest {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role?: UserRole;
}

export interface AdminUsersQuery {
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AdminUsersPage {
  content: AuthUser[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
