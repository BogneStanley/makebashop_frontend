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
    {
      id: 1,
      name: 'Manteau en Cachemire',
      price: 295,
      image:
        'https://images.unsplash.com/photo-1771771425345-ea40b23e8220?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description: 'Manteau élégant en cachemire pur, parfait pour les journées d\'hiver.',
    },
    {
      id: 2,
      name: 'Chemise en Lin',
      price: 125,
      image:
        'https://images.unsplash.com/photo-1771771425345-ea40b23e8220?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description: 'Chemise légère en lin naturel, idéale pour l\'été.',
    },
    {
      id: 3,
      name: 'Veste Structurée',
      price: 185,
      image:
        'https://images.unsplash.com/photo-1771771425345-ea40b23e8220?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description: 'Veste structurée aux lignes modernes et polyvalente.',
    },
    {
      id: 4,
      name: 'Pantalon Taille Haute',
      price: 95,
      image:
        'https://images.unsplash.com/photo-1771771425345-ea40b23e8220?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description: 'Pantalon taille haute coupe droite, très confortable.',
    },
  ]);

  bestSellers = signal<Product[]>([
    {
      id: 5,
      name: 'Robe en Soie',
      price: 180,
      image:
        'https://images.unsplash.com/photo-1771771425345-ea40b23e8220?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description: 'Robe fluide en soie avec motif subtil.',
    },
    {
      id: 6,
      name: 'Blazer Classique',
      price: 240,
      image:
        'https://images.unsplash.com/photo-1771771425345-ea40b23e8220?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description: 'Blazer classique coupe slim, parfait pour le bureau.',
    },
    {
      id: 7,
      name: 'Trench Coat',
      price: 320,
      image:
        'https://images.unsplash.com/photo-1771771425345-ea40b23e8220?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description: 'Trench coat intemporel en coton impermeable.',
    },
    {
      id: 8,
      name: 'Ceinture Cuir',
      price: 65,
      image:
        'https://images.unsplash.com/photo-1771771425345-ea40b23e8220?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description: 'Ceinture en cuir véritable, boucle métallique.',
    },
  ]);
}
