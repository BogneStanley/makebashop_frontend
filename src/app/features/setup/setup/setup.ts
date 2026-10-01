import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { NotificationService } from '../../../core/services/notification.service';
import { SetupService } from '../../../core/services/setup.service';
import { applyApiValidationErrors } from '../../../core/utils/api-error-handler';
import { mapHttpError } from '../../../core/utils/map-http-error';

function matchingPasswords(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmation = control.get('passwordConfirmation')?.value;
  return password && confirmation && password !== confirmation ? { passwordsMismatch: true } : null;
}

@Component({
  selector: 'app-setup',
  imports: [ReactiveFormsModule, RouterModule, ButtonModule, InputTextModule, PasswordModule],
  templateUrl: './setup.html',
  styleUrl: './setup.css',
})
export class Setup {
  private readonly formBuilder = inject(FormBuilder);
  private readonly setupService = inject(SetupService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly state = signal<'loading' | 'available' | 'unavailable' | 'error'>('loading');
  readonly isSubmitting = signal(false);

  readonly setupForm = this.formBuilder.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(14),
          Validators.pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/),
        ],
      ],
      passwordConfirmation: ['', Validators.required],
    },
    { validators: matchingPasswords },
  );

  constructor() {
    this.loadStatus();
  }

  get emailControl() {
    return this.setupForm.controls.email;
  }

  get firstNameControl() {
    return this.setupForm.controls.firstName;
  }

  get lastNameControl() {
    return this.setupForm.controls.lastName;
  }

  get passwordControl() {
    return this.setupForm.controls.password;
  }

  get passwordConfirmationControl() {
    return this.setupForm.controls.passwordConfirmation;
  }

  retry(): void {
    this.loadStatus();
  }

  onSubmit(): void {
    this.setupForm.markAllAsTouched();
    if (this.setupForm.invalid || this.isSubmitting()) {
      return;
    }

    const { email, firstName, lastName, password } = this.setupForm.getRawValue();
    this.isSubmitting.set(true);

    this.setupService.complete({ email, firstName, lastName, password }).subscribe({
      next: () => {
        this.notifications.success('Le premier administrateur a été créé. Connectez-vous pour continuer.');
        void this.router.navigate(['/login']);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        if (error instanceof HttpErrorResponse && error.status === 404) {
          this.state.set('unavailable');
          return;
        }

        applyApiValidationErrors(this.setupForm, error);
        this.notifications.error(mapHttpError(error));
      },
      complete: () => this.isSubmitting.set(false),
    });
  }

  private loadStatus(): void {
    this.state.set('loading');
    this.setupService.getStatus().subscribe({
      next: (status) => this.state.set(status.setupRequired ? 'available' : 'unavailable'),
      error: (error) => {
        this.state.set(error instanceof HttpErrorResponse && error.status === 404 ? 'unavailable' : 'error');
      },
    });
  }
}
