import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  provideHttpClient,
  withInterceptors,
  HttpInterceptorFn,
} from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// Ustawiaj withCredentials dla żądań do backendu (np. Spring Security sesyjny)
// i zostaw inne requesty bez zmian (np. assety/CDN)
const withCredsInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith('/api')) {
    req = req.clone({ withCredentials: true });
  }
  return next(req);
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    // <-- NOWE:
    provideHttpClient(
      withInterceptors([withCredsInterceptor])
    ),
  ],
};
