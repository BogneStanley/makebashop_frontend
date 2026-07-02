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
    path: 'checkout',
    loadComponent: () =>
      import('./features/checkout/checkout/checkout').then((m) => m.Checkout),
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
      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/pages/product-list.page').then((m) => m.ProductListPage),
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import('./features/products/pages/product-create.page').then((m) => m.ProductCreatePage),
      },
      {
        path: 'products/:id/edit',
        loadComponent: () =>
          import('./features/products/pages/product-edit.page').then((m) => m.ProductEditPage),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/orders/pages/order-list.page').then((m) => m.OrderListPage),
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./features/orders/pages/order-detail.page').then((m) => m.OrderDetailPage),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/admin/settings/settings-layout').then((m) => m.SettingsLayout),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/admin/settings/settings-index.page').then((m) => m.SettingsIndexPage),
          },
          {
            path: 'highlights',
            loadComponent: () =>
              import('./features/admin/settings/highlights-settings.page').then(
                (m) => m.HighlightsSettingsPage,
              ),
          },
        ],
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];
