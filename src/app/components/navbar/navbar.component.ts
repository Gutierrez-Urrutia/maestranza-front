import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/login/auth.service';
import { AlertaService } from '../../services/alerta/alerta.service'; // ← Importar AlertaService
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();

  currentUser: any = null;
  numeroNotificaciones: number = 0; // ← Nueva propiedad
  private userSubscription: Subscription = new Subscription();
  private notificacionesSubscription: Subscription = new Subscription(); // ← Nueva suscripción

  constructor(
    private authService: AuthService,
    private alertaService: AlertaService // ← Inyectar AlertaService
  ) { }

  ngOnInit() {
    // Suscribirse a los cambios del usuario
    this.userSubscription = this.authService.user$.subscribe(user => {
      console.log('🔍 NAVBAR - Usuario recibido del BehaviorSubject:', user);
      this.currentUser = user;

      // Cargar notificaciones cuando el usuario esté autenticado
      if (user) {
        this.cargarNotificaciones();
      }
    });
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
    this.notificacionesSubscription.unsubscribe();
  }

  // Método para cargar el número de notificaciones
  private cargarNotificaciones() {
    this.notificacionesSubscription = this.alertaService.obtenerActivas().subscribe({
      next: (alertas) => {
        this.numeroNotificaciones = alertas.length;
        console.log('🔔 Número de notificaciones:', this.numeroNotificaciones);
      },
      error: (error) => {
        console.error('❌ Error al cargar notificaciones:', error);
        this.numeroNotificaciones = 0;
      }
    });
  }

  // Método para obtener el mensaje de bienvenida
  getMensajeBienvenida(): string {
    if (!this.currentUser) {
      console.log('No hay usuario actual');
      return '';
    }

    console.log('Datos del usuario:', this.currentUser);
    console.log('Nombre:', this.currentUser.nombre);
    console.log('Apellido:', this.currentUser.apellido);

    // Verificar si tiene nombre y apellido
    if (this.currentUser.nombre && this.currentUser.apellido) {
      const nombreCompleto = `${this.currentUser.nombre} ${this.currentUser.apellido}`;
      console.log('Nombre completo:', nombreCompleto);
      return `Bienvenido/a ${nombreCompleto}`;
    }

    // Si no tiene nombre completo, usar solo el nombre
    if (this.currentUser.nombre) {
      return `Bienvenido/a ${this.currentUser.nombre}`;
    }

    // Como fallback, usar el username
    return `Bienvenido/a ${this.currentUser.username}`;
  }

  // Método para manejar click en notificaciones
  onNotificacionesClick() {
    console.log('🔔 Click en notificaciones');
    // Aquí puedes agregar lógica para mostrar un dropdown de notificaciones
    // o navegar a la página de alertas
  }

  // Método para refrescar notificaciones
  refrescarNotificaciones() {
    if (this.currentUser) {
      this.cargarNotificaciones();
    }
  }
}