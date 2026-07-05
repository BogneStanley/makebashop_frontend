import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TextareaModule } from 'primeng/textarea';
import { finalize } from 'rxjs';
import {
  CONTACT_FIELD_DEFINITIONS,
  ContactFieldDefinition,
  ContactKey,
} from '../../../core/models/settings';
import { ContactSettingsService } from '../../../core/services/contact-settings.service';

@Component({
  selector: 'app-contact-settings-page',
  imports: [
    FormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    MessageModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './contact-settings.page.html',
  styleUrl: './contact-settings.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactSettingsPage implements OnInit {
  private contactSettingsService = inject(ContactSettingsService);

  readonly fields = CONTACT_FIELD_DEFINITIONS;

  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);
  formValues = signal<Record<ContactKey, string>>(this.emptyForm());

  ngOnInit(): void {
    this.loadContacts();
  }

  updateField(key: ContactKey, value: string): void {
    this.formValues.update((current) => ({ ...current, [key]: value }));
  }

  save(): void {
    if (this.saving()) {
      return;
    }

    this.saving.set(true);
    this.contactSettingsService
      .updateContacts(this.formValues())
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe((settings) => {
        if (!settings) {
          return;
        }

        this.applyContacts(settings.contacts);
      });
  }

  fieldValue(field: ContactFieldDefinition): string {
    return this.formValues()[field.key] ?? '';
  }

  private loadContacts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.contactSettingsService
      .getAdminContacts()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((settings) => {
        if (!settings) {
          this.error.set('Impossible de charger les contacts.');
          return;
        }

        this.applyContacts(settings.contacts);
      });
  }

  private applyContacts(contacts: Record<string, string>): void {
    const next = this.emptyForm();

    for (const field of this.fields) {
      next[field.key] = contacts[field.key] ?? '';
    }

    this.formValues.set(next);
  }

  private emptyForm(): Record<ContactKey, string> {
    return this.fields.reduce(
      (acc, field) => {
        acc[field.key] = '';
        return acc;
      },
      {} as Record<ContactKey, string>,
    );
  }
}
