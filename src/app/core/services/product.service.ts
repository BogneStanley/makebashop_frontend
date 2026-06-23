import { Injectable, signal } from '@angular/core';

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  images: string[];
  description: string;
  category: string;
  stock: number;
  sizes?: string[];
  colors?: string[]; // hex values or names
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private products = signal<Product[]>([
    {
      id: 1,
      name: 'Manteau en Cachemire',
      price: 295,
      image:
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=735&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=735&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=687&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=736&auto=format&fit=crop',
      ],
      description:
        "Manteau élégant en cachemire pur, parfait pour les journées d'hiver. Confectionné avec le plus grand soin, il offre un confort thermique incomparable et une silhouette structurée intemporelle.",
      category: 'Manteaux',
      stock: 5,
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['#2D2B2A', '#D2B48C', '#EAE6DF'],
    },
    {
      id: 2,
      name: 'Chemise en Lin',
      price: 125,
      image:
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=688&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=688&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=687&auto=format&fit=crop',
      ],
      description:
        "Chemise légère en lin naturel, idéale pour l'été. Sa coupe décontractée et sa matière hautement respirante en font un choix privilégié pour vos journées ensoleillées.",
      category: 'Chemises',
      stock: 12,
      sizes: ['XS', 'S', 'M', 'L'],
      colors: ['#FFFFFF', '#ADD8E6', '#F5F5DC'],
    },
    {
      id: 3,
      name: 'Veste Structurée',
      price: 5000,
      image:
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=736&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=736&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=1470&auto=format&fit=crop',
      ],
      description:
        'Veste structurée aux lignes modernes et polyvalente. Parfaite pour rehausser une tenue décontractée ou pour un rendez-vous professionnel.',
      category: 'Vestes',
      stock: 10000,
      sizes: ['S', 'M', 'L'],
      colors: ['bink', '#4A4A4A', '#8B0000'],
    },
    {
      id: 4,
      name: 'Pantalon Taille Haute',
      price: 95,
      image:
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=687&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=687&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?q=80&w=687&auto=format&fit=crop',
      ],
      description:
        'Pantalon taille haute coupe droite, très confortable. Confectionné dans un tissu fluide et résistant qui flatte la silhouette tout en offrant une grande liberté de mouvement.',
      category: 'Pantalons',
      stock: 15,
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['#000080', '#000000', '#808080'],
    },
    {
      id: 5,
      name: 'Robe en Soie',
      price: 180,
      image:
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=764&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=764&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=708&auto=format&fit=crop',
      ],
      description:
        "Robe fluide en soie avec motif subtil. Sa fluidité apporte une touche de poésie et d'élégance naturelle à chacun de vos pas.",
      category: 'Robes',
      stock: 4,
      sizes: ['S', 'M', 'L'],
      colors: ['#E6E6FA', '#FFC0CB', '#301934'],
    },
    {
      id: 6,
      name: 'Blazer Classique',
      price: 240,
      image:
        'https://images.unsplash.com/photo-1548624149-f7b3156c2199?q=80&w=687&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1548624149-f7b3156c2199?q=80&w=687&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=687&auto=format&fit=crop',
      ],
      description:
        "Blazer classique coupe slim, parfait pour le bureau. Un essentiel de la garde-robe moderne qui structure instantanément n'importe quel look.",
      category: 'Vestes',
      stock: 0, // Out of stock for testing
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['#000000', '#000080', '#5C4033'],
    },
    {
      id: 7,
      name: 'Trench Coat',
      price: 320,
      image:
        'https://images.unsplash.com/photo-1525450824786-227cbef70703?q=80&w=735&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1525450824786-227cbef70703?q=80&w=735&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1604644401890-0bd678c83788?q=80&w=735&auto=format&fit=crop',
      ],
      description:
        "Trench coat intemporel en coton imperméable. Son design croisé classique avec ceinture amovible s'adapte à toutes les saisons.",
      category: 'Manteaux',
      stock: 7,
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['#F5F5DC', '#000000'],
    },
    {
      id: 8,
      name: 'Ceinture Cuir',
      price: 65,
      image:
        'https://images.unsplash.com/photo-1624222247344-550fb8ec5519?q=80&w=700&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1624222247344-550fb8ec5519?q=80&w=700&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1624222247335-e11a3db61a7a?q=80&w=700&auto=format&fit=crop',
      ],
      description:
        "Ceinture en cuir véritable avec boucle métallique dorée minimaliste. L'accessoire idéal pour souligner la taille de vos robes et manteaux.",
      category: 'Accessoires',
      stock: 20,
      sizes: ['S', 'M', 'L'],
      colors: ['#5C4033', '#000000', '#D2B48C'],
    },
  ]);

  getProducts() {
    return this.products;
  }

  getProductById(id: number): Product | undefined {
    return this.products().find((p) => p.id === id);
  }

  getCategories(): string[] {
    const allCategories = this.products().map((p) => p.category);
    return Array.from(new Set(allCategories));
  }
}
