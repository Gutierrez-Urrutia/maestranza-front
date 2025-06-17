import { Component, EventEmitter, Output, OnInit, OnDestroy, isDevMode } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/login/auth.service';
import { AlertaService } from '../../services/alerta/alerta.service';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification/notification.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();

  currentUser: any = null;
  numeroNotificaciones: number = 0;
  private userSubscription: Subscription = new Subscription();
  private notificacionesSubscription: Subscription = new Subscription();
  // Para el botón de prueba en modo desarrollo
  isDevMode = isDevMode();

  constructor(
    private authService: AuthService,
    private alertaService: AlertaService,
    private notificationService: NotificationService 
  ) { }

  ngOnInit() {
    // Suscribirse a los cambios del usuario
    this.userSubscription = this.authService.user$.subscribe(user => {
      this.currentUser = user;

      if (user) {
        this.inicializarNotificaciones();
        // Iniciar conexión SSE cuando el usuario está autenticado
        this.notificationService.conectar();
      } else {
        this.numeroNotificaciones = 0;
        // Desconectar SSE cuando el usuario cierra sesión
        this.notificationService.desconectar();
      }
    });
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
    this.notificacionesSubscription.unsubscribe();
    // Desconectar SSE cuando se destruye el componente
    this.notificationService.desconectar();
  }

  // Método para inicializar el sistema de notificaciones
  private inicializarNotificaciones() {
    // Suscribirse al contador reactivo de alertas activas
    this.notificacionesSubscription = this.alertaService.alertasActivasCount$.subscribe({
      next: (count) => {
        this.numeroNotificaciones = count;
        console.log('🔔 Notificaciones actualizadas:', count);
      },
      error: (error) => {
        console.error('❌ Error en notificaciones:', error);
        this.numeroNotificaciones = 0;
      }
    });

    // Cargar contador inicial
    this.alertaService.actualizarContadorAlertas();
  }

  // Método para obtener el mensaje de bienvenida
  getMensajeBienvenida(): string {
    if (!this.currentUser) {
      return '';
    }

    // Verificar si tiene nombre y apellido
    if (this.currentUser.nombre && this.currentUser.apellido) {
      const nombreCompleto = `${this.currentUser.nombre} ${this.currentUser.apellido}`;
      return `Bienvenido/a ${nombreCompleto}`;
    }

    // Si no tiene nombre completo, usar solo el nombre
    if (this.currentUser.nombre) {
      return `Bienvenido/a ${this.currentUser.nombre}`;
    }

    // Como fallback, usar el username
    return `Bienvenido/a ${this.currentUser.username}`;
  }

  // Método para refrescar notificaciones manualmente
  refrescarNotificaciones() {
    if (this.currentUser) {
      this.alertaService.actualizarContadorAlertas();
    }
  }

  // Método para obtener el texto del tooltip
  getTooltipNotificaciones(): string {
    if (this.numeroNotificaciones === 0) {
      return 'No hay alertas activas';
    } else if (this.numeroNotificaciones === 1) {
      return '1 alerta activa';
    } else {
      return `${this.numeroNotificaciones} alertas activas`;
    }
  }

  // Método para probar notificaciones
  // probarNotificacion() {
  //   console.log('Probando notificación toast...');
  //   const mensaje = {titulo: 'Esta es una notificación de prueba', mensaje: "hola"};
  //   this.notificationService.simularNuevaAlerta(mensaje);
  // }
}