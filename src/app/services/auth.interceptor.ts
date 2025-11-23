import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Functional HTTP Interceptor for Standalone Components
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Get the auth token from the service
  const token = authService.getToken();
  
  // Clone the request and add authorization header if token exists
  if (token && !authService.isTokenExpired()) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  // Pass the cloned request to the next handler
  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Token expired or unauthorized
        authService.logout();
        router.navigate(['/login'], {
          queryParams: { returnUrl: router.url }
        });
      }
      
      return throwError(() => error);
    })
  );
};