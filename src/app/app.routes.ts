import { Routes } from '@angular/router';
import { adminAuthGuard } from './core/guards/admin-auth.guard';

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
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart/cart').then((m) => m.Cart),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'manage',
    loadComponent: () =>
      import('./features/admin/admin-layout/admin-layout').then((m) => m.AdminLayout),
    canActivate: [adminAuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/admin/categories/category-list').then((m) => m.CategoryList),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];
