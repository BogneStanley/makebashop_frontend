import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AddToCartRequest, CartResponse, UpdateCartRequest } from '../models/cart';
import { ResponseWrapper } from '../models/common/api-wrapper.models';
import { mapCartItemResponse } from '../utils/map-cart-response';
import { mapHttpError } from '../utils/map-http-error';
import { CartContextService } from './cart-context.service';
import { NotificationService } from './notification.service';
import { Product } from './product.service';

/** Délai avant envoi au serveur après un clic sur +/- */
const DELAI_BOUTONS_MS = 400;

/** Délai avant envoi au serveur après une saisie clavier */
const DELAI_CLAVIER_MS = 4000;

export interface CartItem {
  id: string;
  variantId: number;
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export type CartVariantAction = 'update' | 'remove';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private cartContext = inject(CartContextService);
  private notifications = inject(NotificationService);
  private readonly baseUrl = `${environment.apiUrl}/cart`;

  // --- État affiché dans l'interface ---
  private cartItems = signal<CartItem[]>([]);
  private totalAmount = signal(0);
  private loading = signal(false);
  private variantLoading = signal<Record<number, CartVariantAction>>({});
  private addingToCart = signal(false);
  private clearingCart = signal(false);

  // --- Suivi des modifications de quantité ---
  /** Dernière quantité confirmée par le serveur */
  private savedQuantities: Record<number, number> = {};
  /** Quantité modifiée localement, pas encore envoyée */
  private pendingQuantities: Record<number, number> = {};
  /** Timers de debounce (un par article) */
  private saveTimers: Record<number, ReturnType<typeof setTimeout>> = {};
  /** Compteur pour ignorer les réponses HTTP arrivées trop tard */
  private requestCounter: Record<number, number> = {};

  getCartItems() {
    return this.cartItems;
  }

  isLoading() {
    return this.loading;
  }

  getVariantLoading() {
    return this.variantLoading;
  }

  isAddingToCart() {
    return this.addingToCart;
  }

  isClearingCart() {
    return this.clearingCart;
  }

  isVariantBusy(variantId: number): boolean {
    return this.variantLoading()[variantId] !== undefined;
  }

  getCartCount(): number {
    let count = 0;
    for (const item of this.cartItems()) {
      count += item.quantity;
    }
    return count;
  }

  getCartTotal(): number {
    return this.totalAmount();
  }

  /** L'utilisateur change la quantité (clavier ou boutons +/-) */
  setDraftQuantity(variantId: number, quantity: number, fromKeyboard: boolean): void {
    if (!this.isBrowser()) {
      return;
    }

    const qty = Math.max(1, quantity);
    this.pendingQuantities[variantId] = qty;
    this.showQuantityOnScreen(variantId, qty);

    const delay = fromKeyboard ? DELAI_CLAVIER_MS : DELAI_BOUTONS_MS;
    this.scheduleSave(variantId, delay);
  }

  /** Envoie tout de suite la quantité en attente (ex: quand l'input perd le focus) */
  flushDraftQuantity(variantId: number): void {
    this.cancelTimer(variantId);
    this.saveQuantityToServer(variantId);
  }

  /** Envoie toutes les quantités en attente (ex: fermeture du panier) */
  flushAllDraftQuantities(): void {
    for (const variantId of Object.keys(this.pendingQuantities).map(Number)) {
      this.flushDraftQuantity(variantId);
    }
  }

  loadCart(): Observable<void> {
    if (!this.isBrowser()) {
      return of(undefined);
    }

    this.loading.set(true);

    return this.http.get<ResponseWrapper<CartResponse>>(this.baseUrl).pipe(
      tap((response) => this.applyCart(response.data)),
      map(() => undefined),
      catchError((error) => {
        this.notifications.error(mapHttpError(error));
        return of(undefined);
      }),
      tap(() => this.loading.set(false)),
    );
  }

  addToCart(productId: number, variantId: number, quantity: number): Observable<void> {
    if (!this.isBrowser()) {
      return of(undefined);
    }

    const body: AddToCartRequest = { productId, variantId, quantity };

    this.addingToCart.set(true);

    return this.http.post<ResponseWrapper<CartResponse>>(this.baseUrl, body).pipe(
      tap((response) => {
        this.applyCart(response.data);
        this.notifications.success('Produit ajouté au panier');
      }),
      map(() => undefined),
      catchError((error) => {
        this.notifications.error(mapHttpError(error));
        return throwError(() => error);
      }),
      finalize(() => this.addingToCart.set(false)),
    );
  }

  removeFromCart(variantId: number): Observable<void> {
    if (!this.isBrowser()) {
      return of(undefined);
    }

    this.forgetPendingChanges(variantId);
    this.removeItemFromScreen(variantId);
    delete this.savedQuantities[variantId];
    this.startVariantAction(variantId, 'remove');

    return this.http
      .delete<ResponseWrapper<CartResponse>>(`${this.baseUrl}/items/${variantId}`)
      .pipe(
        tap((response) => this.applyCart(response.data)),
        map(() => undefined),
        catchError((error) => {
          this.notifications.error(mapHttpError(error));
          this.loadCart().subscribe();
          return throwError(() => error);
        }),
        finalize(() => this.stopVariantAction(variantId)),
      );
  }

  clearCart(): Observable<void> {
    if (!this.isBrowser()) {
      return of(undefined);
    }

    this.forgetAllPendingChanges();
    this.clearingCart.set(true);

    return this.http.delete<ResponseWrapper<CartResponse>>(this.baseUrl).pipe(
      tap((response) => this.applyCart(response.data)),
      map(() => undefined),
      catchError((error) => {
        this.notifications.error(mapHttpError(error));
        return throwError(() => error);
      }),
      finalize(() => this.clearingCart.set(false)),
    );
  }

  // --- Modifications de quantité ---

  private scheduleSave(variantId: number, delayMs: number): void {
    this.cancelTimer(variantId);
    this.saveTimers[variantId] = setTimeout(() => this.saveQuantityToServer(variantId), delayMs);
  }

  private saveQuantityToServer(variantId: number): void {
    const quantity = this.pendingQuantities[variantId];
    if (quantity === undefined) {
      return;
    }

    // Rien à envoyer si la quantité est déjà celle du serveur
    if (this.savedQuantities[variantId] === quantity) {
      delete this.pendingQuantities[variantId];
      return;
    }

    if (quantity <= 0) {
      delete this.pendingQuantities[variantId];
      this.removeFromCart(variantId).subscribe();
      return;
    }

    const requestId = (this.requestCounter[variantId] ?? 0) + 1;
    this.requestCounter[variantId] = requestId;

    const body: UpdateCartRequest = {
      variantsQuantity: [{ variantId, quantity }],
    };

    this.startVariantAction(variantId, 'update');

    this.http
      .put<ResponseWrapper<CartResponse>>(this.baseUrl, body)
      .pipe(finalize(() => this.stopVariantAction(variantId)))
      .subscribe({
      next: (response) => {
        // Ignorer si l'utilisateur a modifié la quantité entre-temps
        if (this.requestCounter[variantId] !== requestId) {
          return;
        }

        this.savedQuantities[variantId] = quantity;
        delete this.pendingQuantities[variantId];
        this.applyCart(response.data);
      },
      error: (error) => {
        if (this.requestCounter[variantId] !== requestId) {
          return;
        }

        this.notifications.error(mapHttpError(error));
        delete this.pendingQuantities[variantId];
        this.showQuantityOnScreen(variantId, this.savedQuantities[variantId] ?? quantity);
      },
    });
  }

  private showQuantityOnScreen(variantId: number, quantity: number): void {
    const items = this.cartItems().map((item) =>
      item.variantId === variantId ? { ...item, quantity } : item,
    );
    this.cartItems.set(items);
    this.updateTotalFromItems();
  }

  private removeItemFromScreen(variantId: number): void {
    this.cartItems.set(this.cartItems().filter((item) => item.variantId !== variantId));
    this.updateTotalFromItems();
  }

  private updateTotalFromItems(): void {
    let total = 0;
    for (const item of this.cartItems()) {
      total += item.product.price * item.quantity;
    }
    this.totalAmount.set(total);
  }

  // --- Mise à jour du panier depuis le serveur ---

  private applyCart(cart: CartResponse): void {
    this.cartContext.setCartId(cart.id);

    const serverItems = cart.items.map(mapCartItemResponse);
    const orderedItems = this.keepDisplayOrder(this.cartItems(), serverItems);

    this.cartItems.set(orderedItems);

    const hasLocalEdits = orderedItems.some((item) => this.pendingQuantities[item.variantId] !== undefined);
    if (hasLocalEdits) {
      this.updateTotalFromItems();
    } else {
      this.totalAmount.set(cart.totalAmount?.amount ?? 0);
    }

    for (const item of orderedItems) {
      const pending = this.pendingQuantities[item.variantId];
      if (pending !== undefined && pending !== item.quantity) {
        this.showQuantityOnScreen(item.variantId, pending);
      } else {
        this.savedQuantities[item.variantId] = item.quantity;
      }
    }
  }

  /** Garde l'ordre actuel des articles à l'écran */
  private keepDisplayOrder(oldItems: CartItem[], newItems: CartItem[]): CartItem[] {
    const result: CartItem[] = [];

    for (const oldItem of oldItems) {
      const updated = newItems.find((item) => item.variantId === oldItem.variantId);
      if (updated) {
        result.push(updated);
      }
    }

    for (const newItem of newItems) {
      const alreadyListed = result.some((item) => item.variantId === newItem.variantId);
      if (!alreadyListed) {
        result.push(newItem);
      }
    }

    return result;
  }

  // --- Utilitaires ---

  private cancelTimer(variantId: number): void {
    const timer = this.saveTimers[variantId];
    if (timer !== undefined) {
      clearTimeout(timer);
      delete this.saveTimers[variantId];
    }
  }

  private forgetPendingChanges(variantId: number): void {
    this.cancelTimer(variantId);
    delete this.pendingQuantities[variantId];
    // Annule une sauvegarde de quantité déjà en cours
    this.requestCounter[variantId] = (this.requestCounter[variantId] ?? 0) + 1;
  }

  private forgetAllPendingChanges(): void {
    for (const variantId of Object.keys(this.saveTimers).map(Number)) {
      this.cancelTimer(variantId);
    }
    this.pendingQuantities = {};
  }

  private startVariantAction(variantId: number, action: CartVariantAction): void {
    this.variantLoading.update((state) => ({ ...state, [variantId]: action }));
  }

  private stopVariantAction(variantId: number): void {
    this.variantLoading.update((state) => {
      const next = { ...state };
      delete next[variantId];
      return next;
    });
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
