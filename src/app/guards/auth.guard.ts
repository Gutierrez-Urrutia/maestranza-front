import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/login/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {

    console.log('🛡️ AuthGuard: Verificando acceso a:', state.url);

    // Primero verificar si hay token local
    const hasLocalToken = this.authService.isAuthenticated(false);

    if (!hasLocalToken) {
      console.log('❌ No hay token local');
      this.router.navigate(['/login']);
      return false;
    }

    // Validar con el servidor
    return this.authService.isTokenValid().pipe(
      map((isValid: boolean) => {
        if (isValid) {
          console.log('✅ Token válido. Permitiendo acceso a:', state.url);
          return true;
        } else {
          console.log('❌ Token inválido. Redirigiendo al login');
          this.router.navigate(['/login']);
          return false;
        }
      }),
      catchError((error) => {
        console.error('❌ Error validando token:', error);
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}