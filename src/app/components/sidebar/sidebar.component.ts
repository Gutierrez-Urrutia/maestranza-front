import { Component, Input } from '@angular/core';
import { MenuItem } from '../../interfaces/MenuItem';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/login/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: true,
  imports: [
    CommonModule, RouterModule
  ]
})
export class SidebarComponent {
  @Input() visible = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  menuItems: MenuItem[] = [
    {
      name: 'Inventario',
      icon: 'bi-box',
      route: '/inventario',
    },
    {
      name: 'Movimientos',
      icon: 'bi-arrow-left-right',
      route: '/movimientos',
    },
    {
      name: 'Alertas',
      icon: 'bi-exclamation-triangle',
      route: '/alertas',
    },
    {
      name: 'Usuarios',
      icon: 'bi-people',
      route: '/usuarios'
    },
    {
      name: "Cerrar sesión",
      icon: 'bi-box-arrow-right',
      route: '/logout'
    }
  ];

  onMenuItemClick(item: MenuItem): void {
    if (item.route === '/logout') {
      this.logout();
    } else {
      this.router.navigate([item.route]);
    }
  }

  private logout(): void {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que deseas salir del sistema?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Mostrar loading
        Swal.fire({
          title: 'Cerrando sesión...',
          text: 'Por favor espera',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // Hacer logout con petición al servidor
        this.authService.logoutFromServer().subscribe({
          next: () => {
            // Mostrar mensaje de éxito
            Swal.fire({
              title: '¡Sesión cerrada!',
              text: 'Has cerrado sesión exitosamente',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false,
              allowOutsideClick: false
            }).then(() => {
              // Redirigir al login
              this.router.navigate(['/login']);
            });
          },
          error: (error) => {
            console.error('Error en logout:', error);
            // Aún así redirigir al login
            Swal.fire({
              title: 'Sesión cerrada',
              text: 'Has sido desconectado del sistema',
              icon: 'info',
              timer: 1500,
              showConfirmButton: false
            }).then(() => {
              this.router.navigate(['/login']);
            });
          }
        });
      }
    });
  }
}