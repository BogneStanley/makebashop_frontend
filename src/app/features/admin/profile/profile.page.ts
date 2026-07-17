import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { finalize } from 'rxjs';
import { AuthUser, UserRole } from '../../../core/models/auth';
import { UserProfileService } from '../../../core/services/user-profile.service';

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrateur',
  MANAGER: 'Gestionnaire',
  CUSTOMER: 'Client',
};

@Component({
  selector: 'app-profile-page',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    MessageModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage implements OnInit {
  private userProfileService = inject(UserProfileService);
  private fb = inject(FormBuilder);

  loading = signal(true);
  savingProfile = signal(false);
  savingPassword = signal(false);
  error = signal<string | null>(null);
  profile = signal<AuthUser | null>(null);

  profileForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    avatar: [''],
  });

  passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  roleLabel(role: UserRole): string {
    return ROLE_LABELS[role];
  }

  saveProfile(): void {
    this.profileForm.markAllAsTouched();

    if (this.profileForm.invalid || this.savingProfile()) {
      return;
    }

    const { email, firstName, lastName, avatar } = this.profileForm.getRawValue();

    this.savingProfile.set(true);
    this.userProfileService
      .updateProfile({
        email,
        firstName,
        lastName,
        avatar: avatar.trim() || undefined,
      })
      .pipe(finalize(() => this.savingProfile.set(false)))
      .subscribe((user) => {
        if (!user) {
          return;
        }

        this.profile.set(user);
      });
  }

  savePassword(): void {
    this.passwordForm.markAllAsTouched();

    if (this.passwordForm.invalid || this.savingPassword()) {
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.getRawValue();

    if (newPassword !== confirmPassword) {
      this.passwordForm.controls.confirmPassword.setErrors({ mismatch: true });
      return;
    }

    this.savingPassword.set(true);
    this.userProfileService
      .updatePassword({ currentPassword, newPassword })
      .pipe(finalize(() => this.savingPassword.set(false)))
      .subscribe((success) => {
        if (!success) {
          return;
        }

        this.passwordForm.reset();
      });
  }

  get emailControl() {
    return this.profileForm.controls.email;
  }

  get firstNameControl() {
    return this.profileForm.controls.firstName;
  }

  get lastNameControl() {
    return this.profileForm.controls.lastName;
  }

  get currentPasswordControl() {
    return this.passwordForm.controls.currentPassword;
  }

  get newPasswordControl() {
    return this.passwordForm.controls.newPassword;
  }

  get confirmPasswordControl() {
    return this.passwordForm.controls.confirmPassword;
  }

  private loadProfile(): void {
    this.loading.set(true);
    this.error.set(null);

    this.userProfileService
      .getProfile()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((user) => {
        if (!user) {
          this.error.set('Impossible de charger le profil.');
          return;
        }

        this.applyProfile(user);
      });
  }

  private applyProfile(user: AuthUser): void {
    this.profile.set(user);
    this.profileForm.patchValue({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar ?? '',
    });
  }
}
