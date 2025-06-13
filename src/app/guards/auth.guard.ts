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

    // SIEMPRE validar con el servidor - no confiar solo en el token local
    return this.authService.isTokenValid().pipe(
      map((isValid: boolean) => {
        if (isValid) {
          console.log('✅ Token válido. Permitiendo acceso a:', state.url);
          return true;
        } else {
          console.log('❌ Token inválido o expirado. Redirigiendo al login desde:', state.url);
          this.router.navigate(['/login'], {
            queryParams: {
              reason: 'session_expired',
              redirectUrl: state.url
            }
          });
          return false;
        }
      }),
      catchError((error) => {
        console.error('❌ Error validando token:', error);
        this.router.navigate(['/login'], {
          queryParams: {
            reason: 'validation_error',
            redirectUrl: state.url
          }
        });
        return of(false);
      })
    );
  }
}