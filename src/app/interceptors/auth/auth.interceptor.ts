import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../services/login/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Obtener token directamente de sessionStorage
  const token = sessionStorage.getItem('token');

  console.log('🔍 Interceptor - URL:', req.url);
  console.log('🔍 Interceptor - Token:', token ? 'Presente' : 'Ausente');

  // Si hay token y no es una ruta pública, agregarlo
  if (token && !isPublicRoute(req.url)) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', token)
    });

    console.log('✅ Interceptor - Token agregado a la petición');

    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => handleError(error, router, authService))
    );
  }

  console.log('⚠️ Interceptor - Petición sin token');
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => handleError(error, router, authService))
  );
};

function isPublicRoute(url: string): boolean {
  const publicRoutes = ['/api/auth/login', '/api/auth/registro'];
  return publicRoutes.some(route => url.includes(route));
}

function handleError(error: HttpErrorResponse, router: Router, authService: AuthService) {
  if (error.status === 401) {
    console.log('❌ Error 401 - Redirigiendo al login');
    authService.logout();
    router.navigate(['/login']);
  }
  return throwError(() => error);
}