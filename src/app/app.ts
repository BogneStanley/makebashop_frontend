import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { NavigationProgress } from './shared/navigation-progress/navigation-progress';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, NavigationProgress],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('shop_front');
}
