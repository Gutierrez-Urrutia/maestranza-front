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


  // Si hay token y no es una ruta pública, agregarlo
  if (token && !isPublicRoute(req.url)) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', token)
    });


    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => handleError(error, router, authService))
    );
  }

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
    authService.logout();
    router.navigate(['/login']);
  }
  return throwError(() => error);
}