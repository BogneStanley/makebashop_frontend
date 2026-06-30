import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import localeFr from '@angular/common/locales/fr';
import { registerLocaleData } from '@angular/common';
import { definePreset } from '@primeuix/themes';
import { MessageService } from 'primeng/api';
import { AuthService } from './core/services/auth.service';

registerLocaleData(localeFr);

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{orange.50}',
      100: '{orange.100}',
      200: '{orange.200}',
      300: '{orange.300}',
      400: '{orange.400}',
      500: '{orange.500}',
      600: '{orange.600}',
      700: '{orange.700}',
      800: '{orange.800}',
      900: '{orange.900}',
      950: '{orange.950}',
    },
  },
  components: {
    button: {
      root: {
        borderRadius: '{border.radius.none}',
        roundedBorderRadius: '{border.radius.none}',
        paddingX: '0.625rem',
        paddingY: '0.375rem',
        gap: '0.375rem',
        iconOnlyWidth: '2rem',
        sm: {
          fontSize: '0.6875rem',
          paddingX: '0.5rem',
          paddingY: '0.25rem',
          iconOnlyWidth: '1.75rem',
        },
        lg: {
          fontSize: '0.8125rem',
          paddingX: '0.875rem',
          paddingY: '0.5rem',
          iconOnlyWidth: '2.375rem',
        },
        label: {
          fontWeight: '600',
        },
      },
      css: `
        .p-button {
          font-size: 0.75rem;
          line-height: 1.25rem;
        }
      `,
    },
    inputnumber: {
      button: {
        borderRadius: '{border.radius.none}',
      },
    },
    tag: {
      root: {
        fontSize: '0.6875rem',
        fontWeight: '600',
        padding: '0.1875rem 0.4375rem',
        gap: '0.25rem',
        borderRadius: '{border.radius.none}',
        roundedBorderRadius: '{border.radius.none}',
      },
      icon: {
        size: '0.6875rem',
      },
    },
    badge: {
      root: {
        fontSize: '0.6875rem',
        fontWeight: '600',
        padding: '0 0.375rem',
        minWidth: '1.25rem',
        height: '1.25rem',
        borderRadius: '{border.radius.none}',
      },
      sm: {
        fontSize: '0.625rem',
        minWidth: '1.125rem',
        height: '1.125rem',
      },
      lg: {
        fontSize: '0.75rem',
        minWidth: '1.375rem',
        height: '1.375rem',
      },
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    MessageService,
    provideAppInitializer(() => inject(AuthService).ensureSession()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideBrowserGlobalErrorListeners(),
    providePrimeNG({
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: false, // or 'none'
        },
      },
    }),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideClientHydration(withEventReplay()),
  ],
};
