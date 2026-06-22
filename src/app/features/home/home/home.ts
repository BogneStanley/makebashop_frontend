import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { Hero } from '../hero/hero';
import { ProductCard, Product } from '../../../shared/product-card/product-card';

@Component({
  selector: 'app-home',
  imports: [CommonModule, Header, Footer, Hero, ProductCard],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  nouveautes = signal<Product[]>([
    { id: 1, name: 'Manteau en Cachemire', price: 295, image: 'https://images.unsplash.com/photo-1551489413-c3a68b6c6e0f?w=600&h=600&fit=crop' },
    { id: 2, name: 'Chemise en Lin', price: 125, image: 'https://images.unsplash.com/photo-1589302164182-86e2f2d561e8?w=600&h=600&fit=crop' },
    { id: 3, name: 'Veste Structurée', price: 185, image: 'https://images.unsplash.com/photo-1597300241177-4de65f8b790d?w=600&h=600&fit=crop' },
    { id: 4, name: 'Pantalon Taille Haute', price: 95, image: 'https://images.unsplash.com/photo-1542272604-667491f7acd1?w=600&h=600&fit=crop' },
  ]);

  bestSellers = signal<Product[]>([
    { id: 5, name: 'Robe en Soie', price: 180, image: 'https://images.unsplash.com/photo-1595777458173-26cd278bf092?w=600&h=600&fit=crop' },
    { id: 6, name: 'Blazer Classique', price: 240, image: 'https://images.unsplash.com/photo-1591047139889-91b8f7e2a6f1?w=600&h=600&fit=crop' },
    { id: 7, name: 'Trench Coat', price: 320, image: 'https://images.unsplash.com/photo-1548628637-2b9d8e4c7f1a?w=600&h=600&fit=crop' },
    { id: 8, name: 'Ceinture Cuir', price: 65, image: 'https://images.unsplash.com/photo-1553066114-716419387f5c?w=600&h=600&fit=crop' },
  ]);
}
