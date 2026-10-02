import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { DashboardSummary } from '../../../core/models/dashboard';
import { formatMoney, getOrderStatusLabel } from '../../../core/models/orders/order.models';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardService } from '../../../core/services/dashboard.service';

interface DashboardStat {
  label: string;
  value: string;
  icon: string;
  hint: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);

  currentUser = this.authService.getCurrentUser();
  summary = signal<DashboardSummary | null>(null);
  loading = signal(true);
  failed = signal(false);

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.failed.set(false);

    this.dashboardService
      .getSummary()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((summary) => {
        this.summary.set(summary);
        this.failed.set(!summary);
      });
  }

  stats(): DashboardStat[] {
    const summary = this.summary();

    return [
      {
        label: 'Commandes',
        value: summary ? String(summary.orderCount) : '—',
        icon: 'pi pi-shopping-bag',
        hint: 'Total',
      },
      {
        label: 'Produits',
        value: summary ? String(summary.activeProductCount) : '—',
        icon: 'pi pi-box',
        hint: 'Catalogue actif',
      },
      {
        label: 'Revenus',
        value: summary ? this.formatAmount(summary.revenue.amount, summary.revenue.currency) : '—',
        icon: 'pi pi-chart-line',
        hint: 'Commandes payées',
      },
      {
        label: 'Clients',
        value: summary ? String(summary.customerCount) : '—',
        icon: 'pi pi-users',
        hint: 'Ayant commandé',
      },
    ];
  }

  formatAmount(amount: number, currency: string): string {
    return formatMoney({ amount, currency });
  }

  orderStatusLabel(status: string): string {
    return getOrderStatusLabel(status);
  }
}
