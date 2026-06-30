import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private messageService = inject(MessageService);

  success(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Succès',
      detail: message,
      life: 4000,
    });
  }

  error(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: message,
      life: 5000,
    });
  }

  info(message: string): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Information',
      detail: message,
      life: 4000,
    });
  }
}
