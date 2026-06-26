import { Paginated } from '../common/pagination.models';
import { CategoryResponse, ProductResponse } from './product-response.models';
import { ProductListItemView, toProductListItemView } from './product.models';

const FCFA = 'FCFA';

export const mockCategories: CategoryResponse[] = [
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
];

export const mockProducts: ProductResponse[] = [
  {
    id: 1,
    name: 'Trench coat classique',
    description:
      'Trench coat en coton imperméable, coupe ajustée et finitions soignées.',
    isActive: true,
    categories: [mockCategories[0]],
    images: [
      {
        id: 101,
        url: 'https://picsum.photos/seed/trench-coat/600/800',
        name: 'trench-coat-face.jpg',
        position: 0,
        isPrimary: true,
      },
      {
        id: 102,
        url: 'https://picsum.photos/seed/trench-coat-detail/600/800',
        name: 'trench-coat-detail.jpg',
        position: 1,
        isPrimary: false,
      },
    ],
    productVariants: [
      {
        id: 1001,
        sku: 'TRC-BLK-S',
        price: { amount: 125000, currency: FCFA },
        stockQuantity: 8,
        color: 'Noir',
        size: 'S',
      },
      {
        id: 1002,
        sku: 'TRC-BLK-M',
        price: { amount: 125000, currency: FCFA },
        stockQuantity: 12,
        color: 'Noir',
        size: 'M',
      },
      {
        id: 1003,
        sku: 'TRC-BLK-L',
        price: { amount: 125000, currency: FCFA },
        stockQuantity: 0,
        color: 'Noir',
        size: 'L',
      },
    ],
  },
  {
    id: 2,
    name: 'Chemise lin premium',
    description: 'Chemise en lin respirant, col classique et boutons nacre.',
    isActive: true,
    categories: [mockCategories[1]],
    images: [
      {
        id: 201,
        url: 'https://picsum.photos/seed/linen-shirt/600/800',
        name: 'linen-shirt.jpg',
        position: 0,
        isPrimary: true,
      },
    ],
    productVariants: [
      {
        id: 2001,
        sku: 'CHM-WHT-M',
        price: { amount: 45000, currency: FCFA },
        stockQuantity: 25,
        color: 'Blanc',
        size: 'M',
      },
      {
        id: 2002,
        sku: 'CHM-BLU-M',
        price: { amount: 45000, currency: FCFA },
        stockQuantity: 18,
        color: 'Bleu ciel',
        size: 'M',
      },
    ],
  },
  {
    id: 3,
    name: 'Blazer structuré',
    description: 'Blazer à épaules marquées, doublure satinée.',
    isActive: true,
    categories: [mockCategories[2], mockCategories[3]],
    images: [
      {
        id: 301,
        url: 'https://picsum.photos/seed/structured-blazer/600/800',
        name: 'blazer-front.jpg',
        position: 0,
        isPrimary: true,
      },
    ],
    productVariants: [
      {
        id: 3001,
        sku: 'BLZ-NVY-M',
        price: { amount: 89000, currency: FCFA },
        stockQuantity: 6,
        color: 'Marine',
        size: 'M',
      },
    ],
  },
  {
    id: 4,
    name: 'Robe soie fluide',
    description: 'Robe midi en soie, tombé fluide et finition délicate.',
    isActive: false,
    categories: [mockCategories[4]],
    images: [
      {
        id: 401,
        url: 'https://picsum.photos/seed/silk-dress/600/800',
        name: 'silk-dress.jpg',
        position: 0,
        isPrimary: true,
      },
    ],
    productVariants: [
      {
        id: 4001,
        sku: 'RBS-EMR-S',
        price: { amount: 156000, currency: FCFA },
        stockQuantity: 3,
        color: 'Émeraude',
        size: 'S',
      },
      {
        id: 4002,
        sku: 'RBS-EMR-M',
        price: { amount: 156000, currency: FCFA },
        stockQuantity: 2,
        color: 'Émeraude',
        size: 'M',
      },
    ],
  },
  {
    id: 5,
    name: 'Ceinture cuir tressé',
    description: 'Ceinture en cuir pleine fleur, boucle dorée brossée.',
    isActive: true,
    categories: [mockCategories[5]],
    images: [],
    productVariants: [
      {
        id: 5001,
        sku: 'CLT-CML-OS',
        price: { amount: 28000, currency: FCFA },
        stockQuantity: 0,
        color: 'Camel',
        size: 'Unique',
      },
    ],
  },
];

export const mockProductListItems: ProductListItemView[] =
  mockProducts.map(toProductListItemView);

export const mockPaginatedProducts: Paginated<ProductResponse> = {
  pageNumber: 0,
  pageSize: 10,
  totalPages: 1,
  totalElements: mockProducts.length,
  content: mockProducts,
  first: true,
  last: true,
  empty: false,
  sort: { property: 'name', direction: 'asc' },
};

export const mockPaginatedProductListItems: Paginated<ProductListItemView> = {
  pageNumber: 0,
  pageSize: 10,
  totalPages: 1,
  totalElements: mockProductListItems.length,
  content: mockProductListItems,
  first: true,
  last: true,
  empty: false,
  sort: { property: 'name', direction: 'asc' },
};

export function getMockProductById(id: number): ProductResponse | undefined {
  return mockProducts.find((product) => product.id === id);
}
