import { Component, inject } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';
import { NavigationLoadingService } from '../../core/services/navigation-loading.service';

@Component({
  selector: 'app-navigation-progress',
  imports: [ProgressBarModule],
  templateUrl: './navigation-progress.html',
  styleUrl: './navigation-progress.css',
})
export class NavigationProgress {
  protected readonly loading = inject(NavigationLoadingService);
}
