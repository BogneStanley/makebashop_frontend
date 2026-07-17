import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NavigationLoadingService {
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);

  private pendingNavigations = 0;
  private progressTimer: ReturnType<typeof setInterval> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  readonly isNavigating = signal(false);
  readonly progress = signal(0);

  constructor() {
    if (!this.isBrowser()) {
      return;
    }

    this.router.events
      .pipe(
        filter(
          (event) =>
            event instanceof NavigationStart ||
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.beginNavigation();
          return;
        }

        this.endNavigation();
      });
  }

  private beginNavigation(): void {
    this.clearHideTimer();
    this.pendingNavigations += 1;

    if (this.pendingNavigations > 1) {
      return;
    }

    this.isNavigating.set(true);
    this.progress.set(8);
    this.startProgressTimer();
    document.body.style.cursor = 'wait';
    document.body.setAttribute('aria-busy', 'true');
  }

  private endNavigation(): void {
    this.pendingNavigations = Math.max(0, this.pendingNavigations - 1);

    if (this.pendingNavigations > 0) {
      return;
    }

    this.clearProgressTimer();
    this.progress.set(100);

    this.hideTimer = setTimeout(() => {
      if (this.pendingNavigations === 0) {
        this.isNavigating.set(false);
        this.progress.set(0);
        document.body.style.cursor = '';
        document.body.removeAttribute('aria-busy');
      }
    }, 250);
  }

  private startProgressTimer(): void {
    this.clearProgressTimer();

    this.progressTimer = setInterval(() => {
      const current = this.progress();
      if (current >= 90) {
        return;
      }

      const increment = current < 30 ? 10 : current < 60 ? 5 : 2;
      this.progress.set(Math.min(90, current + increment));
    }, 180);
  }

  private clearProgressTimer(): void {
    if (this.progressTimer !== null) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }

  private clearHideTimer(): void {
    if (this.hideTimer !== null) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
