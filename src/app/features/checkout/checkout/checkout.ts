import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-checkout',
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    RouterModule,
    Header,
    Footer,
    ButtonModule,
    InputTextModule,
    TextareaModule,
  ],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  cartItems = this.cartService.getCartItems();
  cartTotal = computed(() => this.cartService.getCartTotal());
  cartCount = computed(() => this.cartService.getCartCount());

  isSubmitting = signal(false);
  submitError = signal<string | null>(null);

  checkoutForm = this.fb.nonNullable.group({
    customerFirstName: ['', [Validators.required, Validators.minLength(2)]],
    customerLastName: ['', [Validators.required, Validators.minLength(2)]],
    customerEmail: ['', [Validators.email]],
    customerPhoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-().]{8,20}$/)]],
    note: [''],
  });

  ngOnInit(): void {
    if (this.cartItems().length === 0) {
      void this.router.navigate(['/cart']);
    }
  }

  get firstNameControl() {
    return this.checkoutForm.controls.customerFirstName;
  }

  get lastNameControl() {
    return this.checkoutForm.controls.customerLastName;
  }

  get emailControl() {
    return this.checkoutForm.controls.customerEmail;
  }

  get phoneControl() {
    return this.checkoutForm.controls.customerPhoneNumber;
  }

  async onSubmit(): Promise<void> {
    this.checkoutForm.markAllAsTouched();

    if (this.checkoutForm.invalid || this.cartItems().length === 0) {
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    try {
      const { note, customerEmail, ...customerInfo } = this.checkoutForm.getRawValue();
      const response = await this.orderService.createOrderFromCart(
        {
          ...customerInfo,
          customerEmail: customerEmail.trim() || undefined,
          note: note.trim() || undefined,
        },
        this.cartItems(),
      );

      this.cartService.clearCart();
      window.location.href = response.whatsappUrl;
    } catch {
      this.submitError.set('Impossible de créer la commande. Veuillez réessayer.');
      this.isSubmitting.set(false);
    }
  }
}
