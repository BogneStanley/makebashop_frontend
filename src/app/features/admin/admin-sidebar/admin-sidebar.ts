import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../core/services/auth.service';

export interface AdminNavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-admin-sidebar',
  imports: [RouterModule, ButtonModule],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSidebar {
  private authService = inject(AuthService);
  private router = inject(Router);

  isOpen = input(false);
  closeSidebar = output<void>();

  currentUser = this.authService.getCurrentUser();

  navItems: AdminNavItem[] = [
    { label: 'Tableau de bord', icon: 'pi pi-th-large', route: '/manage/dashboard' },
    { label: 'Catégories', icon: 'pi pi-tags', route: '/manage/categories' },
  ];

  onNavClick(): void {
    this.closeSidebar.emit();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
