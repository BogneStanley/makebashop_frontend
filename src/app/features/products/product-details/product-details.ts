import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { ProductService, Product } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-product-details',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    Header,
    Footer,
    ButtonModule,
    InputNumberModule,
  ],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  product = signal<Product | undefined>(undefined);
  selectedImage = signal<string>('');
  selectedColor = signal<string>('');
  selectedSize = signal<string>('');
  quantity = signal<number>(1);
  activeTab = signal<string>('description');

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = parseInt(idParam, 10);
      const prod = this.productService.getProductById(id);
      if (prod) {
        this.product.set(prod);
        this.selectedImage.set(prod.image);
        if (prod.colors && prod.colors.length > 0) {
          this.selectedColor.set(prod.colors[0]);
        }
        if (prod.sizes && prod.sizes.length > 0) {
          this.selectedSize.set(prod.sizes[0]);
        }
      }
    }
  }

  selectImage(img: string): void {
    this.selectedImage.set(img);
  }

  selectColor(color: string): void {
    this.selectedColor.set(color);
  }

  selectSize(size: string): void {
    this.selectedSize.set(size);
  }

  setTab(tab: string): void {
    this.activeTab.set(tab);
  }

  addToCart(): void {
    const prod = this.product();
    if (!prod) return;

    this.cartService.addToCart(
      prod,
      this.quantity(),
      this.selectedSize(),
      this.selectedColor()
    );
  }
}
