import { Component, EventEmitter, Output, OnInit, OnDestroy, isDevMode, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/login/auth.service';
import { AlertaService } from '../../services/alerta/alerta.service';
import { PermissionService } from '../../services/permission/permission.service';
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
    private notificationService: NotificationService,
    private permissionService: PermissionService
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
    // Usar setTimeout para asegurar que el click del toggle se procese primero
    setTimeout(() => {
      const target = event.target as HTMLElement;
      
      // Solo cerrar si está abierto y el click no fue dentro del contenedor de notificaciones
      if (this.notificacionesAbiertas && !target.closest('.notification-container')) {
        console.log('🔔 Click fuera detectado, cerrando dropdown');
        this.notificacionesAbiertas = false;
      }
    }, 0);
  }

  // Cerrar notificaciones al presionar Escape
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent) {
    if (this.notificacionesAbiertas) {
      console.log('🔔 Escape presionado, cerrando dropdown');
      this.notificacionesAbiertas = false;
      event.preventDefault();
      event.stopPropagation();
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
    console.log('🔔 toggleNotificaciones EJECUTADA - evento:', event);
    
    event.preventDefault();
    event.stopPropagation(); // Prevenir que el click se propague al document
    
    console.log('🔔 Toggle notificaciones - Estado anterior:', this.notificacionesAbiertas);
    this.notificacionesAbiertas = !this.notificacionesAbiertas;
    console.log('🔔 Toggle notificaciones - Estado nuevo:', this.notificacionesAbiertas);
    
    // Forzar la actualización del DOM
    setTimeout(() => {
      const dropdown = document.querySelector('.notification-dropdown');
      const container = document.querySelector('.notification-container');
      
      console.log('🔔 Container aria-expanded:', container?.getAttribute('aria-expanded'));
      console.log('🔔 Dropdown después del toggle:', dropdown);
      
      if (dropdown) {
        console.log('🔔 Dropdown classes:', dropdown.className);
        console.log('🔔 Dropdown styles:', {
          display: window.getComputedStyle(dropdown).display,
          opacity: window.getComputedStyle(dropdown).opacity,
          visibility: window.getComputedStyle(dropdown).visibility
        });
        
        // Forzar mostrar el dropdown manualmente si notificacionesAbiertas es true
        if (this.notificacionesAbiertas) {
          console.log('🔔 Forzando mostrar dropdown...');
          (dropdown as HTMLElement).style.display = 'block';
          (dropdown as HTMLElement).style.opacity = '1';
          (dropdown as HTMLElement).style.visibility = 'visible';
          (dropdown as HTMLElement).style.transform = 'translateY(0)';
        } else {
          console.log('🔔 Ocultando dropdown...');
          (dropdown as HTMLElement).style.display = 'none';
        }
      }
    }, 10);
    
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

  // Método para verificar si el usuario puede acceder a alertas
  canAccessAlertas(): boolean {
    return this.permissionService.canAccessAlertas();
  }

  debugClick() {
    console.log('🔔 Mousedown en botón notificaciones detectado');
    
    // Después de un pequeño delay, verificar la posición del dropdown
    setTimeout(() => {
      const dropdown = document.querySelector('.notification-dropdown');
      const button = document.querySelector('.notification-btn');
      
      if (dropdown && button) {
        const dropdownRect = dropdown.getBoundingClientRect();
        const buttonRect = button.getBoundingClientRect();
        
        console.log('📍 Posición del botón:', {
          top: buttonRect.top,
          left: buttonRect.left,
          bottom: buttonRect.bottom,
          right: buttonRect.right,
          width: buttonRect.width,
          height: buttonRect.height
        });
        
        console.log('📍 Posición del dropdown:', {
          top: dropdownRect.top,
          left: dropdownRect.left,
          bottom: dropdownRect.bottom,
          right: dropdownRect.right,
          width: dropdownRect.width,
          height: dropdownRect.height
        });
        
        console.log('📍 ¿Dropdown visible en viewport?', {
          dentroViewportHorizontal: dropdownRect.left >= 0 && dropdownRect.right <= window.innerWidth,
          dentroViewportVertical: dropdownRect.top >= 0 && dropdownRect.bottom <= window.innerHeight,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight
        });
        
        // Añadir un borde rojo al dropdown para debugging visual
        (dropdown as HTMLElement).style.border = '3px solid red';
        (dropdown as HTMLElement).style.backgroundColor = 'yellow';
        console.log('🎨 Dropdown destacado con borde rojo y fondo amarillo para debug visual');
      }
    }, 100);
  }
}