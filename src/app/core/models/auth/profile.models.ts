export interface UpdateProfileRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
