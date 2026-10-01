export interface SetupStatusResponse {
  setupRequired: boolean;
}

export interface InitialAdminSetupRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}
