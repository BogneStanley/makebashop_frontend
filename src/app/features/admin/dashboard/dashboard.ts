import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { mockOrders } from '../../../core/models/orders/order.mock';
import { AuthService } from '../../../core/services/auth.service';

interface DashboardStat {
  label: string;
  value: string;
  icon: string;
  hint: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  private authService = inject(AuthService);

  currentUser = this.authService.getCurrentUser();

  stats: DashboardStat[] = [
    { label: 'Commandes', value: String(mockOrders.length), icon: 'pi pi-shopping-bag', hint: 'Total' },
    { label: 'Produits', value: '—', icon: 'pi pi-box', hint: 'Catalogue actif' },
    { label: 'Revenus', value: '—', icon: 'pi pi-chart-line', hint: 'Estimation' },
    { label: 'Clients', value: '—', icon: 'pi pi-users', hint: 'Total' },
  ];
}
