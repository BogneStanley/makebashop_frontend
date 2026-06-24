import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AdminSidebar } from '../admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, AdminSidebar, ButtonModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayout {
  isSidebarOpen = signal(false);

  toggleSidebar(): void {
    this.isSidebarOpen.update((open) => !open);
  }

  closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }
}
