import { Injectable, computed, signal } from '@angular/core';

export interface AdminUser {
  email: string;
}

export interface LoginResult {
  success: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser = signal<AdminUser | null>(null);

  isAuthenticated = computed(() => this.currentUser() !== null);

  getCurrentUser() {
    return this.currentUser;
  }

  login(email: string, password: string): Promise<LoginResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email && password.length >= 6) {
          this.currentUser.set({ email });
          resolve({ success: true });
          return;
        }

        resolve({
          success: false,
          error: 'Identifiants administrateur incorrects.',
        });
      }, 600);
    });
  }

  logout(): void {
    this.currentUser.set(null);
  }
}
