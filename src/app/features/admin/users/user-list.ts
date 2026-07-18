import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { PasswordModule } from 'primeng/password';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { finalize } from 'rxjs';
import { AuthUser, UserRole } from '../../../core/models/auth';
import { AdminUserService } from '../../../core/services/admin-user.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmDialog, ConfirmDialogData } from '../../../shared/confirm-dialog/confirm-dialog';

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrateur',
  MANAGER: 'Gestionnaire',
  CUSTOMER: 'Client',
};

interface RoleOption {
  label: string;
  value: UserRole;
}

type PendingAction =
  | { type: 'delete'; user: AuthUser }
  | { type: 'activate'; user: AuthUser }
  | { type: 'deactivate'; user: AuthUser };

@Component({
  selector: 'app-user-list',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    TableModule,
    DrawerModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    SelectModule,
    TagModule,
    PaginatorModule,
    ProgressSpinnerModule,
    ConfirmDialog,
  ],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserList implements OnInit {
  private adminUserService = inject(AdminUserService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  users = signal<AuthUser[]>([]);
  loading = signal(true);
  page = signal(0);
  pageSize = signal(10);
  totalElements = signal(0);

  isFormDrawerOpen = signal(false);
  saving = signal(false);
  editingUser = signal<AuthUser | null>(null);

  confirmVisible = signal(false);
  confirmData = signal<ConfirmDialogData | null>(null);
  private pendingAction = signal<PendingAction | null>(null);

  roleOptions: RoleOption[] = [
    { label: ROLE_LABELS.CUSTOMER, value: 'CUSTOMER' },
    { label: ROLE_LABELS.MANAGER, value: 'MANAGER' },
    { label: ROLE_LABELS.ADMIN, value: 'ADMIN' },
  ];

  userForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    avatar: [''],
    role: ['CUSTOMER' as UserRole, [Validators.required]],
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  roleLabel(role: UserRole): string {
    return ROLE_LABELS[role];
  }

  isCurrentUser(user: AuthUser): boolean {
    return this.authService.getCurrentUser()()?.id === user.id;
  }

  openCreateDrawer(): void {
    this.editingUser.set(null);
    this.userForm.reset({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      avatar: '',
      role: 'CUSTOMER',
    });
    this.passwordControl.setValidators([Validators.required, Validators.minLength(6)]);
    this.passwordControl.updateValueAndValidity();
    this.isFormDrawerOpen.set(true);
  }

  openEditDrawer(user: AuthUser): void {
    this.editingUser.set(user);
    this.userForm.reset({
      email: user.email,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar ?? '',
      role: user.role,
    });
    this.passwordControl.setValidators([Validators.minLength(6)]);
    this.passwordControl.updateValueAndValidity();
    this.isFormDrawerOpen.set(true);
  }

  closeFormDrawer(): void {
    this.isFormDrawerOpen.set(false);
    this.editingUser.set(null);
    this.userForm.reset({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      avatar: '',
      role: 'CUSTOMER',
    });
  }

  saveUser(): void {
    this.userForm.markAllAsTouched();

    if (this.userForm.invalid || this.saving()) {
      return;
    }

    const { email, password, firstName, lastName, avatar, role } = this.userForm.getRawValue();
    const avatarValue = avatar.trim() || undefined;
    const editing = this.editingUser();

    const request$ = editing
      ? this.adminUserService.updateUser(editing.id, {
          email,
          firstName,
          lastName,
          role,
          ...(avatarValue ? { avatar: avatarValue } : {}),
          ...(password ? { password } : {}),
        })
      : this.adminUserService.createUser({
          email,
          password,
          firstName,
          lastName,
          role,
          ...(avatarValue ? { avatar: avatarValue } : {}),
        });

    this.saving.set(true);
    request$.pipe(finalize(() => this.saving.set(false))).subscribe((result) => {
      if (result) {
        this.closeFormDrawer();
        this.loadUsers();
      }
    });
  }

  openDeleteDialog(user: AuthUser): void {
    this.pendingAction.set({ type: 'delete', user });
    this.confirmData.set({
      title: 'Supprimer l\'utilisateur',
      message: `Êtes-vous sûr de vouloir supprimer ${user.firstName} ${user.lastName} (${user.email}) ? Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
      destructive: true,
    });
    this.confirmVisible.set(true);
  }

  openActivateDialog(user: AuthUser): void {
    this.pendingAction.set({ type: 'activate', user });
    this.confirmData.set({
      title: 'Activer l\'utilisateur',
      message: `Activer le compte de ${user.firstName} ${user.lastName} ?`,
      confirmLabel: 'Activer',
    });
    this.confirmVisible.set(true);
  }

  openDeactivateDialog(user: AuthUser): void {
    this.pendingAction.set({ type: 'deactivate', user });
    this.confirmData.set({
      title: 'Désactiver l\'utilisateur',
      message: `Désactiver le compte de ${user.firstName} ${user.lastName} ? L'utilisateur ne pourra plus se connecter.`,
      confirmLabel: 'Désactiver',
      destructive: true,
    });
    this.confirmVisible.set(true);
  }

  confirmAction(): void {
    const action = this.pendingAction();
    if (!action) {
      this.confirmVisible.set(false);
      return;
    }

    const onComplete = (success: boolean): void => {
      if (success) {
        this.loadUsers();
      }
      this.pendingAction.set(null);
      this.confirmVisible.set(false);
    };

    switch (action.type) {
      case 'delete':
        this.adminUserService.deleteUser(action.user.id).subscribe(onComplete);
        break;
      case 'activate':
        this.adminUserService.activateUser(action.user.id).subscribe((user) => onComplete(!!user));
        break;
      case 'deactivate':
        this.adminUserService.deactivateUser(action.user.id).subscribe((user) => onComplete(!!user));
        break;
    }
  }

  onPageChange(event: PaginatorState): void {
    this.page.set(event.page ?? 0);
    this.pageSize.set(event.rows ?? 10);
    this.loadUsers();
  }

  formDrawerTitle(): string {
    return this.editingUser() ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur';
  }

  get emailControl() {
    return this.userForm.controls.email;
  }

  get passwordControl() {
    return this.userForm.controls.password;
  }

  get firstNameControl() {
    return this.userForm.controls.firstName;
  }

  get lastNameControl() {
    return this.userForm.controls.lastName;
  }

  get roleControl() {
    return this.userForm.controls.role;
  }

  private loadUsers(): void {
    this.loading.set(true);

    this.adminUserService
      .listUsers({
        page: this.page(),
        size: this.pageSize(),
        sortBy: 'id',
        sortOrder: 'desc',
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((result) => {
        if (!result) {
          this.users.set([]);
          this.totalElements.set(0);
          return;
        }

        this.users.set(result.content);
        this.totalElements.set(result.totalElements);
      });
  }
}
