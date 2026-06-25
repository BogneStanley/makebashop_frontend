import { Injectable, signal } from '@angular/core';

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface CategoryInput {
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private categories = signal<Category[]>([
    {
      id: 1,
      name: 'Manteaux',
      description: 'Manteaux et trench coats pour toutes les saisons.',
    },
    {
      id: 2,
      name: 'Chemises',
      description: 'Chemises en lin, coton et matières premium.',
    },
    {
      id: 3,
      name: 'Vestes',
      description: 'Blazers et vestes structurées pour un look élégant.',
    },
    {
      id: 4,
      name: 'Pantalons',
      description: 'Pantalons taille haute et coupes modernes.',
    },
    {
      id: 5,
      name: 'Robes',
      description: 'Robes fluides et pièces iconiques en soie.',
    },
    {
      id: 6,
      name: 'Accessoires',
      description: 'Ceintures, foulards et accessoires complémentaires.',
    },
  ]);

  private nextId = 7;

  getCategories() {
    return this.categories;
  }

  getCategoryById(id: number): Category | undefined {
    return this.categories().find((c) => c.id === id);
  }

  createCategory(input: CategoryInput): Category {
    const category: Category = {
      id: this.nextId++,
      name: input.name.trim(),
      description: input.description.trim(),
    };

    this.categories.update((items) => [...items, category]);
    return category;
  }

  updateCategory(id: number, input: CategoryInput): Category | undefined {
    const existing = this.getCategoryById(id);
    if (!existing) {
      return undefined;
    }

    const updated: Category = {
      ...existing,
      name: input.name.trim(),
      description: input.description.trim(),
    };

    this.categories.update((items) => items.map((c) => (c.id === id ? updated : c)));
    return updated;
  }

  deleteCategory(id: number): boolean {
    const exists = this.categories().some((c) => c.id === id);
    if (!exists) {
      return false;
    }

    this.categories.update((items) => items.filter((c) => c.id !== id));
    return true;
  }
}
