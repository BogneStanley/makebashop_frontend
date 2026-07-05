export interface SettingsNavItem {
  category: string;
  label: string;
  description: string;
  icon: string;
  route: string;
}

export const SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
  {
    category: 'Page d’accueil',
    label: 'Mises en avant',
    description: 'Nouveautés, populaires et sélection à la une affichées sur la home.',
    icon: 'pi pi-star',
    route: 'highlights',
  },
  {
    category: 'Boutique',
    label: 'Contacts',
    description: 'Email, téléphone, adresse, réseaux sociaux et WhatsApp.',
    icon: 'pi pi-phone',
    route: 'contact',
  },
];

export function groupSettingsByCategory(
  items: SettingsNavItem[],
): { category: string; items: SettingsNavItem[] }[] {
  const groups = new Map<string, SettingsNavItem[]>();

  for (const item of items) {
    const existing = groups.get(item.category) ?? [];
    existing.push(item);
    groups.set(item.category, existing);
  }

  return [...groups.entries()].map(([category, groupItems]) => ({
    category,
    items: groupItems,
  }));
}
