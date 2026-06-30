import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

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
  private notifications = inject(NotificationService);
  private router = inject(Router);

  isOpen = input(false);
  closeSidebar = output<void>();

  currentUser = this.authService.getCurrentUser();

  navItems: AdminNavItem[] = [
    { label: 'Tableau de bord', icon: 'pi pi-th-large', route: '/manage/dashboard' },
    { label: 'Catégories', icon: 'pi pi-tags', route: '/manage/categories' },
    { label: 'Produits', icon: 'pi pi-box', route: '/manage/products' },
    { label: 'Commandes', icon: 'pi pi-shopping-bag', route: '/manage/orders' },
  ];

  onNavClick(): void {
    this.closeSidebar.emit();
  }

  logout(): void {
    console.log('logout');
    this.authService.logout().subscribe(() => {
      this.notifications.info('Vous êtes déconnecté.');
      this.router.navigate(['/login']);
    });
  }
}
