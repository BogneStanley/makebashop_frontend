import { Component, input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart-item-quantity',
  imports: [FormsModule, InputNumberModule],
  template: `
    <p-inputNumber
      [ngModel]="quantity()"
      (ngModelChange)="onQuantityChange($event)"
      (onBlur)="onBlur()"
      (onInput)="markKeyboardInput()"
      [showButtons]="true"
      buttonLayout="horizontal"
      spinnerMode="horizontal"
      [min]="1"
      [max]="max()"
      size="small"
      class="w-24"
    ></p-inputNumber>
  `,
})
export class CartItemQuantity {
  variantId = input.required<number>();
  quantity = input.required<number>();
  max = input.required<number>();

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
}
