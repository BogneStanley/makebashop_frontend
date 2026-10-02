import { OrderResponse } from '../orders/order-response.models';
import { MoneyResponse } from '../products/product-response.models';

export interface DashboardSummary {
  orderCount: number;
  activeProductCount: number;
  revenue: MoneyResponse;
  customerCount: number;
  recentOrders: OrderResponse[];
}
