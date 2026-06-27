import { Paginated } from '../common/pagination.models';
import { mockProducts } from '../products/product.mock';
import { OrderItemResponse, OrderResponse } from './order-response.models';
import { OrderListItemView, toOrderListItemView } from './order.models';

const FCFA = 'FCFA';

function item(
  id: number,
  productId: number,
  variantIndex: number,
  quantity: number,
): OrderItemResponse {
  const product = mockProducts.find((p) => p.id === productId)!;
  const variant = product.productVariants[variantIndex];
  const subtotal = variant.price.amount * quantity;

  return {
    id,
    product,
    variant,
    quantity,
    price: { ...variant.price },
    subtotal: { amount: subtotal, currency: FCFA },
  };
}

function total(items: OrderItemResponse[]) {
  return {
    amount: items.reduce((sum, i) => sum + i.subtotal.amount, 0),
    currency: FCFA,
  };
}

export const mockOrders: OrderResponse[] = [
  {
    id: 1,
    orderNumber: 'ORD-2026-0001',
    status: 'PENDING',
    customerFirstName: 'Aminata',
    customerLastName: 'Diallo',
    customerEmail: 'aminata.diallo@email.com',
    customerPhoneNumber: '+221 77 123 45 67',
    note: 'Livraison en fin de journée si possible.',
    totalAmount: total([item(1, 1, 1, 1), item(2, 2, 0, 2)]),
    createdAt: '2026-06-25T10:30:00',
    updatedAt: '2026-06-25T10:30:00',
    items: [item(1, 1, 1, 1), item(2, 2, 0, 2)],
  },
  {
    id: 2,
    orderNumber: 'ORD-2026-0002',
    status: 'PAID',
    customerFirstName: 'Moussa',
    customerLastName: 'Sow',
    customerEmail: 'moussa.sow@email.com',
    customerPhoneNumber: '+221 78 987 65 43',
    note: null,
    totalAmount: total([item(3, 3, 0, 1)]),
    createdAt: '2026-06-24T14:15:00',
    updatedAt: '2026-06-24T16:00:00',
    items: [item(3, 3, 0, 1)],
  },
  {
    id: 3,
    orderNumber: 'ORD-2026-0003',
    status: 'CANCELLED',
    customerFirstName: 'Fatou',
    customerLastName: 'Ndiaye',
    customerEmail: 'fatou.ndiaye@email.com',
    customerPhoneNumber: '+221 76 555 12 34',
    note: 'Client a changé d\'avis.',
    totalAmount: total([item(4, 4, 0, 1)]),
    createdAt: '2026-06-23T09:00:00',
    updatedAt: '2026-06-23T11:30:00',
    items: [item(4, 4, 0, 1)],
  },
  {
    id: 4,
    orderNumber: 'ORD-2026-0004',
    status: 'PAID',
    customerFirstName: 'Ibrahima',
    customerLastName: 'Ba',
    customerEmail: 'ibrahima.ba@email.com',
    customerPhoneNumber: '+221 77 444 88 99',
    note: null,
    totalAmount: total([item(5, 1, 0, 1), item(6, 5, 0, 1)]),
    createdAt: '2026-06-22T16:45:00',
    updatedAt: '2026-06-22T17:10:00',
    items: [item(5, 1, 0, 1), item(6, 5, 0, 1)],
  },
  {
    id: 5,
    orderNumber: 'ORD-2026-0005',
    status: 'PENDING',
    customerFirstName: 'Mariama',
    customerLastName: 'Fall',
    customerEmail: 'mariama.fall@email.com',
    customerPhoneNumber: '+221 70 222 33 44',
    note: null,
    totalAmount: total([item(7, 2, 1, 1)]),
    createdAt: '2026-06-27T08:20:00',
    updatedAt: '2026-06-27T08:20:00',
    items: [item(7, 2, 1, 1)],
  },
  {
    id: 6,
    orderNumber: 'ORD-2026-0006',
    status: 'PENDING',
    customerFirstName: 'Ousmane',
    customerLastName: 'Kane',
    customerEmail: 'ousmane.kane@email.com',
    customerPhoneNumber: '+221 77 666 77 88',
    note: 'Appeler avant livraison.',
    totalAmount: total([item(8, 3, 0, 2)]),
    createdAt: '2026-06-20T11:00:00',
    updatedAt: '2026-06-20T11:00:00',
    items: [item(8, 3, 0, 2)],
  },
];

export const mockOrderListItems: OrderListItemView[] =
  mockOrders.map(toOrderListItemView);

export const mockPaginatedOrders: Paginated<OrderResponse> = {
  pageNumber: 0,
  pageSize: 10,
  totalPages: 1,
  totalElements: mockOrders.length,
  content: mockOrders,
  first: true,
  last: true,
  empty: false,
  sort: { property: 'createdAt', direction: 'desc' },
};

export function getMockOrderById(id: number): OrderResponse | undefined {
  return mockOrders.find((order) => order.id === id);
}
