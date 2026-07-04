import { Component, input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart-item-quantity',
  imports: [FormsModule, InputNumberModule],
  templateUrl: './cart-item-quantity.html',
  styleUrl: './cart-item-quantity.css',
})
export class CartItemQuantity {
  variantId = input.required<number>();
  quantity = input.required<number>();
  max = input.required<number>();
  compact = input(false);

  private cartService = inject(CartService);
  private fromKeyboard = false;

  onQuantityChange(value: number | null): void {
    this.cartService.setDraftQuantity(this.variantId(), value ?? 1, this.fromKeyboard);
    this.fromKeyboard = false;
  }

  onBlur(): void {
    this.cartService.flushDraftQuantity(this.variantId());
  }

  markKeyboardInput(): void {
    this.fromKeyboard = true;
  }

  decrease(): void {
    this.onQuantityChange(Math.max(1, this.quantity() - 1));
    this.cartService.flushDraftQuantity(this.variantId());
  }

  increase(): void {
    this.onQuantityChange(Math.min(this.max(), this.quantity() + 1));
    this.cartService.flushDraftQuantity(this.variantId());
  }
}
