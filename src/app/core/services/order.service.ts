import { Injectable } from '@angular/core';
import { CartItem } from './cart.service';
import {
  CreateOrderRequest,
  CreateOrderResponse,
} from '../models/orders/create-order.models';
import {
  OrderItemResponse,
  OrderResponse,
} from '../models/orders/order-response.models';
import { mockOrders } from '../models/orders/order.mock';

const FCFA = 'FCFA';
const SHOP_WHATSAPP_NUMBER = '221771234567';
const MOCK_DELAY_MS = 800;

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const order = this.buildMockOrder(request);
        resolve({
          order,
          whatsappUrl: this.buildWhatsappUrl(order),
        });
      }, MOCK_DELAY_MS);
    });
  }

  createOrderFromCart(
    customerInfo: Omit<CreateOrderRequest, 'items'>,
    cartItems: CartItem[],
  ): Promise<CreateOrderResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const order = this.buildMockOrderFromCart(customerInfo, cartItems);
        resolve({
          order,
          whatsappUrl: this.buildWhatsappUrl(order),
        });
      }, MOCK_DELAY_MS);
    });
  }

  private buildMockOrderFromCart(
    customerInfo: Omit<CreateOrderRequest, 'items'>,
    cartItems: CartItem[],
  ): OrderResponse {
    const nextId = mockOrders.length + 1;
    const orderNumber = `ORD-2026-${String(nextId).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const items: OrderItemResponse[] = cartItems.map((item, index) => {
      const unitPrice = item.product.price;
      const subtotal = unitPrice * item.quantity;

      return {
        id: nextId * 100 + index + 1,
        product: {
          id: item.product.id,
          name: item.product.name,
          description: item.product.description,
          isActive: true,
          categories: [],
          images: [],
          productVariants: [],
        },
        variant: {
          id: index + 1,
          sku: `SKU-${item.product.id}`,
          price: { amount: unitPrice, currency: FCFA },
          stockQuantity: item.product.stock,
          color: item.selectedColor ?? '',
          size: item.selectedSize ?? '',
        },
        quantity: item.quantity,
        price: { amount: unitPrice, currency: FCFA },
        subtotal: { amount: subtotal, currency: FCFA },
      };
    });

    const totalAmount = items.reduce((sum, item) => sum + item.subtotal.amount, 0);

    return {
      id: nextId,
      orderNumber,
      status: 'PENDING',
      customerFirstName: customerInfo.customerFirstName,
      customerLastName: customerInfo.customerLastName,
      customerEmail: customerInfo.customerEmail?.trim() || '',
      customerPhoneNumber: customerInfo.customerPhoneNumber,
      note: customerInfo.note?.trim() || null,
      totalAmount: { amount: totalAmount, currency: FCFA },
      createdAt: now,
      updatedAt: now,
      items,
    };
  }

  private buildMockOrder(request: CreateOrderRequest): OrderResponse {
    const nextId = mockOrders.length + 1;
    const orderNumber = `ORD-2026-${String(nextId).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const items: OrderItemResponse[] = request.items.map((item, index) => {
      const unitPrice = this.getMockUnitPrice(item.productId);
      const subtotal = unitPrice * item.quantity;

      return {
        id: nextId * 100 + index + 1,
        product: {
          id: item.productId,
          name: this.getMockProductName(item.productId),
          description: '',
          isActive: true,
          categories: [],
          images: [],
          productVariants: [],
        },
        variant: {
          id: index + 1,
          sku: `SKU-${item.productId}`,
          price: { amount: unitPrice, currency: FCFA },
          stockQuantity: 10,
          color: item.selectedColor ?? '',
          size: item.selectedSize ?? '',
        },
        quantity: item.quantity,
        price: { amount: unitPrice, currency: FCFA },
        subtotal: { amount: subtotal, currency: FCFA },
      };
    });

    const totalAmount = items.reduce((sum, item) => sum + item.subtotal.amount, 0);

    return {
      id: nextId,
      orderNumber,
      status: 'PENDING',
      customerFirstName: request.customerFirstName,
      customerLastName: request.customerLastName,
      customerEmail: request.customerEmail?.trim() || '',
      customerPhoneNumber: request.customerPhoneNumber,
      note: request.note?.trim() || null,
      totalAmount: { amount: totalAmount, currency: FCFA },
      createdAt: now,
      updatedAt: now,
      items,
    };
  }

  private buildWhatsappUrl(order: OrderResponse): string {
    const lines = [
      `Bonjour, je souhaite confirmer ma commande *${order.orderNumber}*.`,
      '',
      `*Client :* ${order.customerFirstName} ${order.customerLastName}`,
      `*Téléphone :* ${order.customerPhoneNumber}`,
    ];

    if (order.customerEmail) {
      lines.push(`*Email :* ${order.customerEmail}`);
    }

    lines.push(
      '',
      '*Articles :*',
      ...order.items.map(
        (item) =>
          `- ${item.product.name}${item.variant.size ? ` (${item.variant.size})` : ''} x${item.quantity} — ${item.subtotal.amount.toLocaleString('fr-FR')} ${FCFA}`,
      ),
      '',
      `*Total :* ${order.totalAmount.amount.toLocaleString('fr-FR')} ${FCFA}`,
    );

    if (order.note) {
      lines.push('', `*Note :* ${order.note}`);
    }

    const text = encodeURIComponent(lines.join('\n'));
    return `https://wa.me/${SHOP_WHATSAPP_NUMBER}?text=${text}`;
  }

  private getMockProductName(productId: number): string {
    const names: Record<number, string> = {
      1: 'Manteau en Cachemire',
      2: 'Chemise en Lin',
      3: 'Veste Structurée',
      4: 'Pantalon Taille Haute',
      5: 'Robe Élégante',
    };
    return names[productId] ?? `Produit #${productId}`;
  }

  private getMockUnitPrice(productId: number): number {
    const prices: Record<number, number> = {
      1: 295,
      2: 125,
      3: 5000,
      4: 95,
      5: 180,
    };
    return prices[productId] ?? 100;
  }
}
