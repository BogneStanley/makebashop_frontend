import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CONTACT_KEYS } from '../../core/models/settings';
import { ContactSettingsService } from '../../core/services/contact-settings.service';

@Component({
  selector: 'app-footer',
  imports: [RouterModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer implements OnInit {
  private contactSettingsService = inject(ContactSettingsService);

  readonly keys = CONTACT_KEYS;

  email = signal<string | null>(null);
  phone = signal<string | null>(null);
  address = signal<string | null>(null);
  instagram = signal<string | null>(null);
  facebook = signal<string | null>(null);
  tiktok = signal<string | null>(null);

  ngOnInit(): void {
    this.contactSettingsService.getContacts().subscribe((settings) => {
      const contacts = settings?.contacts ?? {};
      this.email.set(contacts[CONTACT_KEYS.email] || null);
      this.phone.set(contacts[CONTACT_KEYS.phone] || null);
      this.address.set(contacts[CONTACT_KEYS.address] || null);
      this.instagram.set(contacts[CONTACT_KEYS.instagram] || null);
      this.facebook.set(contacts[CONTACT_KEYS.facebook] || null);
      this.tiktok.set(contacts[CONTACT_KEYS.tiktok] || null);
    });
  }
}
