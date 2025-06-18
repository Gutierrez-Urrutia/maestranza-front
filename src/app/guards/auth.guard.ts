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


    // Primero verificar si hay token local
    const hasLocalToken = this.authService.isAuthenticated(false);

    if (!hasLocalToken) {
      this.router.navigate(['/login']);
      return false;
    }

    // Validar con el servidor
    return this.authService.isTokenValid().pipe(
      map((isValid: boolean) => {
        if (isValid) {
          return true;
        } else {
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