import { Component, EventEmitter, Output, OnInit, OnDestroy, isDevMode, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/login/auth.service';
import { AlertaService } from '../../services/alerta/alerta.service';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification/notification.service';
import { Alerta } from '../../interfaces/Alerta';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();

  currentUser: any = null;
  numeroNotificaciones: number = 0;
  notificacionesAbiertas: boolean = false;
  alertasRecientes: Alerta[] = [];
  cargandoAlertas: boolean = false;
  
  private userSubscription: Subscription = new Subscription();
  private notificacionesSubscription: Subscription = new Subscription();
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
        this.alertasRecientes = [];
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

  // Cerrar notificaciones al hacer clic fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-container')) {
      this.notificacionesAbiertas = false;
    }
  }

  // Método para inicializar el sistema de notificaciones
  private inicializarNotificaciones() {
    // Suscribirse al contador reactivo de alertas activas
    this.notificacionesSubscription = this.alertaService.alertasActivasCount$.subscribe({
      next: (count) => {
        this.numeroNotificaciones = count;
      },
      error: (error) => {
        console.error('❌ Error en notificaciones:', error);
        this.numeroNotificaciones = 0;
      }
    });

    // Cargar contador inicial
    this.alertaService.actualizarContadorAlertas();
  }

  // Toggle para mostrar/ocultar el panel de notificaciones
  toggleNotificaciones(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    this.notificacionesAbiertas = !this.notificacionesAbiertas;
    
    if (this.notificacionesAbiertas) {
      this.cargarAlertasRecientes();
    }
  }

  // Cargar alertas recientes
  cargarAlertasRecientes() {
    this.cargandoAlertas = true;
    this.alertaService.obtenerActivas().subscribe({
      next: (alertas) => {
        this.alertasRecientes = alertas.slice(0, 5); // Mostrar máximo 5 alertas
        this.cargandoAlertas = false;
      },
      error: (error) => {
        console.error('Error al cargar alertas recientes:', error);
        this.alertasRecientes = [];
        this.cargandoAlertas = false;
      }
    });
  }

  // Marcar alerta como leída
  marcarComoLeida(id: number) {
    this.alertaService.desactivar(id).subscribe({
      next: () => {
        // Eliminar la alerta de la lista local
        this.alertasRecientes = this.alertasRecientes.filter(a => a.id !== id);
        // Actualizar el contador
        this.alertaService.actualizarContadorAlertas();
      },
      error: (error) => console.error('Error al marcar alerta como leída:', error)
    });
  }

  // Refrescar notificaciones manualmente
  refrescarNotificaciones() {
    if (this.currentUser) {
      this.cargarAlertasRecientes();
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

  // Método para obtener clase CSS según nivel de urgencia
  getNivelUrgenciaClass(nivel: string): string {
    switch (nivel?.toUpperCase()) {
      case 'ALTA': 
      case 'CRITICA': return 'danger';
      case 'MEDIA': return 'warning';
      case 'BAJA': return 'info';
      default: return 'secondary';
    }
  }
}