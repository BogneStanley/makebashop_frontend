import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import {
  CsvTransferKind,
  CsvTransferResult,
  CsvTransferService,
} from '../../../core/services/csv-transfer.service';
import { NotificationService } from '../../../core/services/notification.service';

interface TransferSection {
  kind: CsvTransferKind;
  title: string;
  description: string;
  columns: string;
}

@Component({
  selector: 'app-csv-transfer-page',
  imports: [ButtonModule, MessageModule, ProgressSpinnerModule],
  templateUrl: './csv-transfer.page.html',
  styleUrl: './csv-transfer.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsvTransferPage {
  private csvTransfer = inject(CsvTransferService);
  private notifications = inject(NotificationService);

  readonly sections: TransferSection[] = [
    {
      kind: 'products',
      title: 'Produits',
      description:
        'Le fichier contient une ligne par variante. Les images ne sont pas transférées.',
      columns:
        'name, description, details, shipping_info, is_active, categories, sku, price, stock_quantity, size, color',
    },
    {
      kind: 'categories',
      title: 'Catégories',
      description: 'Une catégorie existante portant le même nom est mise à jour.',
      columns: 'name, description',
    },
    {
      kind: 'settings',
      title: 'Configurations',
      description: 'Inclut les contacts et les listes de produits mis en avant.',
      columns: 'section, key, value',
    },
  ];

  exporting = signal<CsvTransferKind | null>(null);
  importing = signal<CsvTransferKind | null>(null);
  result = signal<CsvTransferResult | null>(null);

  async export(kind: CsvTransferKind): Promise<void> {
    if (this.exporting()) return;
    this.exporting.set(kind);
    try {
      await this.csvTransfer.export(kind);
      this.notifications.success('Le fichier CSV a été téléchargé.');
    } catch {
      this.notifications.error('Impossible de préparer le fichier CSV.');
    } finally {
      this.exporting.set(null);
    }
  }

  async onFileSelected(kind: CsvTransferKind, event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || this.importing()) return;

    this.importing.set(kind);
    this.result.set(null);
    try {
      const result = await this.csvTransfer.import(kind, file);
      this.result.set(result);
      if (result.imported) {
        this.notifications.success(`${result.imported} élément(s) importé(s).`);
      }
    } catch {
      this.result.set({
        imported: 0,
        skipped: 0,
        errors: ['Lecture ou import du fichier impossible.'],
      });
    } finally {
      this.importing.set(null);
    }
  }
}
