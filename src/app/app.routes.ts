import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home/home').then((m) => m.Home),
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home/home').then((m) => m.Home),
  },
  {
    path: 'products',
    loadComponent: () => import('./features/products/product-search/product-search').then((m) => m.ProductSearch),
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./features/products/product-details/product-details').then((m) => m.ProductDetails),
  },
];
