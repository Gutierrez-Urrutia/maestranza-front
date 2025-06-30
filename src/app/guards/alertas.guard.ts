import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { PermissionService } from '../services/permission/permission.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertasGuard implements CanActivate {

  constructor(
    private permissionService: PermissionService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    
    // Verificar si el usuario puede acceder a alertas usando el nuevo método
    if (this.permissionService.canAccessAlertas()) {
      return true;
    }

    // Si no tiene acceso, mostrar mensaje y redirigir
    Swal.fire({
      icon: 'error',
      title: 'Acceso Denegado',
      text: 'No tienes permisos para acceder a la gestión de alertas',
      confirmButtonText: 'Entendido'
    }).then(() => {
      // Redirigir a inventario como página por defecto
      this.router.navigate(['/inventario']);
    });

    return false;
  }
}
