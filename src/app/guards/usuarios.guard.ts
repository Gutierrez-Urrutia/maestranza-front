import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { PermissionService } from '../services/permission/permission.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class UsuariosGuard implements CanActivate {

  constructor(
    private permissionService: PermissionService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    
    // Verificar si el usuario puede acceder a la gestión de usuarios
    if (this.permissionService.canAccessUsuarios()) {
      return true;
    }

    // Si no tiene permisos, mostrar mensaje y redirigir
    Swal.fire({
      icon: 'error',
      title: 'Acceso Denegado',
      text: 'No tienes permisos para acceder a la gestión de usuarios',
      confirmButtonText: 'Entendido'
    }).then(() => {
      // Redirigir a inventario como página por defecto
      this.router.navigate(['/inventario']);
    });

    return false;
  }
}
