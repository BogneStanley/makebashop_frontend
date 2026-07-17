import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CONTACT_KEYS } from '../models/settings';
import { CartItem } from './cart.service';
import { ContactSettingsService } from './contact-settings.service';
import { NotificationService } from './notification.service';
import { Product } from './product.service';

export interface WhatsappProductOrder {
  product: Product;
  size?: string;
  color?: string;
  price: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class WhatsappOrderingService {
  private contactSettingsService = inject(ContactSettingsService);
  private notifications = inject(NotificationService);
  private platformId = inject(PLATFORM_ID);

  readonly enabled = environment.whatsappOrderingEnabled;

  orderProduct(order: WhatsappProductOrder): void {
    if (!this.enabled || !this.isBrowser()) {
      return;
    }

    this.contactSettingsService.getContacts().subscribe((settings) => {
      const whatsappUrl = this.buildUrl(settings?.contacts?.[CONTACT_KEYS.whatsapp], [
        'Bonjour, je souhaite commander le produit suivant :',
        '',
        this.formatProductLine(order),
        '',
        `Lien : ${this.buildProductUrl(order.product.id)}`,
      ]);

      if (!whatsappUrl) {
        this.notifications.error('Numéro WhatsApp non configuré.');
        return;
      }

      this.openWhatsapp(whatsappUrl);
    });
  }

  orderCart(items: CartItem[], total: number): void {
    if (!this.enabled || !this.isBrowser() || items.length === 0) {
      return;
    }

    this.contactSettingsService.getContacts().subscribe((settings) => {
      const lines = [
        'Bonjour, je souhaite passer une commande :',
        '',
        '*Articles :*',
        ...items.flatMap((item) => {
          const lineTotal = (item.product.price * item.quantity).toLocaleString('fr-FR');
          const variant = [item.selectedSize, item.selectedColor].filter(Boolean).join(', ');
          const label = variant
            ? `- ${item.product.name} (${variant}) x${item.quantity} — ${lineTotal} FCFA`
            : `- ${item.product.name} x${item.quantity} — ${lineTotal} FCFA`;

          return [label, `  ${this.buildProductUrl(item.product.id)}`];
        }),
        '',
        `*Total estimé :* ${total.toLocaleString('fr-FR')} FCFA`,
      ];

      const whatsappUrl = this.buildUrl(settings?.contacts?.[CONTACT_KEYS.whatsapp], lines);

      if (!whatsappUrl) {
        this.notifications.error('Numéro WhatsApp non configuré.');
        return;
      }

      this.openWhatsapp(whatsappUrl);
    });
  }

  buildProductUrl(productId: number): string {
    const configuredBase = environment.siteUrl?.trim();
    const base = configuredBase || (this.isBrowser() ? window.location.origin : '');

    return `${base.replace(/\/$/, '')}/products/${productId}`;
  }

  private formatProductLine(order: WhatsappProductOrder): string {
    const parts = [`*${order.product.name}*`];

    if (order.size) {
      parts.push(`Taille : ${order.size}`);
    }

    if (order.color) {
      parts.push(`Couleur : ${order.color}`);
    }

    parts.push(
      `Quantité : ${order.quantity}`,
      `Prix unitaire : ${order.price.toLocaleString('fr-FR')} FCFA`,
    );

    return parts.join('\n');
  }

  private buildUrl(phone: string | undefined, lines: string[]): string {
    if (!phone?.trim()) {
      return '';
    }

    return this.contactSettingsService.buildWhatsappUrl(phone, lines.join('\n'));
  }

  private openWhatsapp(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
