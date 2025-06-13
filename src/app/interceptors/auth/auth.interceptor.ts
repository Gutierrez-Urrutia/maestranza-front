import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/login/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private authService: AuthService // ← Inyectar AuthService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // ✅ Usar el token del AuthService en lugar de localStorage directamente
    const token = this.authService.getToken();

    if (environment.logging.enableConsoleLog) {
      console.log('🔍 Interceptor: Procesando petición a:', req.url);
      console.log('🔑 Token encontrado:', !!token);
    }

    // Agregar token a todas las peticiones autenticadas
    if (token && this.shouldAddToken(req.url)) {
      req = req.clone({
        setHeaders: {
          Authorization: token, // ← Ya incluye "Bearer " desde AuthService
          'Content-Type': 'application/json'
        }
      });

      if (environment.logging.enableConsoleLog) {
        console.log('🔐 Token agregado a la petición');
      }
    } else {
      if (environment.logging.enableConsoleLog) {
        console.log('❌ No se agregó token. Ruta pública o token no disponible');
      }
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (environment.logging.enableConsoleLog) {
          console.error('❌ Error en petición HTTP:', error.status, error.message);
        }

        // Manejar diferentes tipos de errores
        switch (error.status) {
          case 401:
            this.handleUnauthorized();
            break;
          case 403:
            this.handleForbidden();
            break;
          case 0:
            this.handleNetworkError();
            break;
          default:
            if (environment.logging.enableConsoleLog) {
              console.error('Error HTTP no manejado:', error.status, error.message);
            }
        }

        return throwError(() => error);
      })
    );
  }

  /**
   * Determina si se debe agregar el token a la petición
   */
  private shouldAddToken(url: string): boolean {
    // No agregar token a rutas públicas
    const publicRoutes = [
      '/api/auth/login',
      '/api/auth/registro', // ← Cambiar a 'registro' como en tu backend
      '/api/auth/verify',   // ← Agregar verify para evitar bucles
      '/api/public'
    ];

    const isPublic = publicRoutes.some(route => url.includes(route));

    if (environment.logging.enableConsoleLog) {
      console.log('🔍 URL:', url, '| Es pública:', isPublic);
    }

    return !isPublic;
  }

  /**
   * Maneja errores 401 (No autorizado)
   */
  private handleUnauthorized(): void {
    if (environment.logging.enableConsoleLog) {
      console.warn('🚫 Token inválido o expirado. Cerrando sesión...');
    }

    // ✅ Usar el método logout del AuthService para limpiar todo correctamente
    this.authService.logout();

    // Redirigir al login
    this.router.navigate(['/login'], {
      queryParams: { reason: 'session_expired' }
    });
  }

  /**
   * Maneja errores 403 (Prohibido)
   */
  private handleForbidden(): void {
    if (environment.logging.enableConsoleLog) {
      console.warn('🔒 Acceso prohibido. Permisos insuficientes.');
    }

    // Puedes personalizar esto según tu aplicación
    console.error('Acceso denegado a este recurso');
  }

  /**
   * Maneja errores de red (status 0)
   */
  private handleNetworkError(): void {
    if (environment.logging.enableConsoleLog) {
      console.error('🌐 Error de conexión. Servidor no disponible.');
    }

    console.error('Error de conexión con el servidor');
  }
}