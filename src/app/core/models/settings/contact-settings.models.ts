export interface ContactSettings {
  contacts: Record<string, string>;
  updatedAt: string;
}

export interface UpdateContactSettingsRequest {
  contacts: Record<string, string>;
}

export const CONTACT_KEYS = {
  instagram: 'instagram',
  facebook: 'facebook',
  tiktok: 'tiktok',
  email: 'email',
  phone: 'phone',
  address: 'address',
  whatsapp: 'whatsapp',
  whatsappGroup: 'whatsapp_group',
} as const;

export type ContactKey = (typeof CONTACT_KEYS)[keyof typeof CONTACT_KEYS];

export interface ContactFieldDefinition {
  key: ContactKey;
  label: string;
  placeholder: string;
  icon: string;
  hint?: string;
}

export const CONTACT_FIELD_DEFINITIONS: ContactFieldDefinition[] = [
  {
    key: CONTACT_KEYS.email,
    label: 'Email',
    placeholder: 'contact@boutique.cm',
    icon: 'pi-envelope',
  },
  {
    key: CONTACT_KEYS.phone,
    label: 'Téléphone',
    placeholder: '+237 6XX XXX XXX',
    icon: 'pi-phone',
  },
  {
    key: CONTACT_KEYS.address,
    label: 'Adresse',
    placeholder: 'Douala, Cameroun',
    icon: 'pi-map-marker',
  },
  {
    key: CONTACT_KEYS.whatsapp,
    label: 'WhatsApp',
    placeholder: '+237 6XX XXX XXX',
    icon: 'pi-whatsapp',
    hint: 'Numéro utilisé pour les commandes et le contact direct.',
  },
  {
    key: CONTACT_KEYS.whatsappGroup,
    label: 'Groupe WhatsApp',
    placeholder: 'https://chat.whatsapp.com/xxxxx',
    icon: 'pi-users',
    hint: 'Lien d’invitation affiché sur la page d’accueil.',
  },
  {
    key: CONTACT_KEYS.instagram,
    label: 'Instagram',
    placeholder: 'https://instagram.com/maboutique',
    icon: 'pi-instagram',
  },
  {
    key: CONTACT_KEYS.facebook,
    label: 'Facebook',
    placeholder: 'https://facebook.com/maboutique',
    icon: 'pi-facebook',
  },
  {
    key: CONTACT_KEYS.tiktok,
    label: 'TikTok',
    placeholder: 'https://tiktok.com/@maboutique',
    icon: 'pi-tiktok',
  },
];
