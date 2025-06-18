import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import { AlertaService } from '../alerta/alerta.service';

// Actualiza la interfaz para que coincida con los datos que realmente llegan del servidor
export interface NotificacionAlerta {
  id: number;
  nombre: string;
  nivelUrgencia: string;
  productoNombre: string;
  descripcion: string;
  fecha: string;
  productoId?: number;
  productoCodigo?: string;
  productoStock?: number;
  productoUmbralStock?: number;
  productoUbicacion?: string;
  categoriaNombre?: string;
  tiempoTranscurrido?: string;
  resumenCorto?: string;
  activo?: boolean;
  stockActual?: number;
  umbralMinimo?: number;
}

export interface NotificacionEvento {
  tipo: string;
  alerta?: NotificacionAlerta;
  contadorTotal: number;
  timestamp: string;
}

export interface ToastOptions extends Partial<IndividualConfig> {
  onHidden?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private eventSource: EventSource | null = null;
  private reconnectTimeout: any = null;
  private reconnectDelay = 5000;
  private maxReconnectAttempts = 5;
  private reconnectAttempts = 0;

  // Endpoint base del servidor
  private apiUrl = environment.apiUrl;

  // Subjects para publicar datos
  private nuevaAlertaSubject = new BehaviorSubject<NotificacionAlerta | null>(null);
  private contadorSubject = new BehaviorSubject<number>(0);
  private conexionSubject = new BehaviorSubject<boolean>(false);

  // Observables públicos para suscribirse desde componentes
  public nuevaAlerta$ = this.nuevaAlertaSubject.asObservable();
  public contador$ = this.contadorSubject.asObservable();
  public conexion$ = this.conexionSubject.asObservable();

  constructor(
    private ngZone: NgZone,
    private toastr: ToastrService,
    private alertaService: AlertaService // Añadido: Inyectar AlertaService
  ) {
  }

  /**
   * Conectar a la fuente de eventos SSE
   */
  conectar(): void {

    if (this.eventSource) {
      this.desconectar();
    }

    // Usar NgZone para asegurar que Angular detecte los cambios cuando lleguen eventos
    this.ngZone.runOutsideAngular(() => {
      try {
        // CORREGIR URL - Eliminar el v1 duplicado
        const sseUrl = `${this.apiUrl}/alertas/subscribe`;

        // IMPORTANTE: Incluir token de autenticación como parámetro de URL
        // Obtener token del localStorage (ajustar según cómo guardas tu token)
        const token = localStorage.getItem('auth_token');

        // Añadir token como parámetro de consulta
        const urlConToken = `${sseUrl}?token=${token}`;


        // Crear conexión con la URL que incluye el token
        this.eventSource = new EventSource(urlConToken);

        // Configurar los event listeners
        this.configurarEventHandlers();

      } catch (error) {
        console.error('❌ Error creando conexión SSE:', error);
        this.manejarErrorConexion();
      }
    });

    // Cargar el contador inicial de alertas
    this.cargarContadorAlertas();
  }

  /**
   * Configurar los manejadores de eventos
   */
  private configurarEventHandlers(): void {
    if (!this.eventSource) return;

    // Evento de conexión abierta (general)
    this.eventSource.onopen = (event) => {
      this.ngZone.run(() => {
        this.conexionSubject.next(true);
        this.reconnectAttempts = 0;
      });
    };

    // Evento de error
    this.eventSource.onerror = (error) => {
      this.ngZone.run(() => {
        console.error('❌ Error en conexión SSE:', error);
        this.conexionSubject.next(false);
        this.manejarErrorConexion();
      });
    };

    // IMPORTANTE: Escuchar evento específico "conexion"
    this.eventSource.addEventListener('conexion', (event: any) => {
      this.ngZone.run(() => {
        // Aquí podemos manejar la confirmación de conexión
      });
    });

    // IMPORTANTE: Escuchar evento específico "alerta"
    this.eventSource.addEventListener('alerta', (event: any) => {
      this.ngZone.run(() => {
        try {
          const alerta = JSON.parse(event.data);

          // Procesar la alerta
          this.nuevaAlertaSubject.next(alerta);
          this.mostrarToastAlerta(alerta);

          // Actualizar el contador inmediatamente cuando llega una alerta nueva
          this.alertaService.actualizarContadorAlertas();

          // No es necesario incrementar manualmente el contador local
          // ya que actualizarContadorAlertas() obtiene el valor real del servidor
          // const nuevoContador = (this.contadorSubject.value || 0) + 1;
          // this.actualizarContador(nuevoContador);
        } catch (error) {
          console.error('❌ Error procesando alerta:', error);
        }
      });
    });

    // Mantener también el handler general para depuración
    this.eventSource.onmessage = (event) => {
      // No procesamos aquí las alertas porque ya las capturamos en el listener específico
    };
  }
  /**
   * Actualizar contador de alertas
   */
  private actualizarContador(contador: number): void {
    this.contadorSubject.next(contador);
  }

  /**
   * Método para actualizar el contador después de cerrar el toast
   */
  private actualizarContadorDespuesDeToast(): void {
    this.alertaService.actualizarContadorAlertas();
  }

  /**
   * Cargar contador inicial de alertas
   */
  private cargarContadorAlertas(): void {
    fetch(`${this.apiUrl}/alertas/count`)
      .then(response => response.json())
      .then(data => {
        this.actualizarContador(data.count);
      })
      .catch(error => {
        console.error('❌ Error cargando contador de alertas:', error);
      });
  }

  /**
   * Mostrar toast para una alerta
   */
  private mostrarToastAlerta(alerta: NotificacionAlerta): void {

    // Crear mensaje conciso
    let mensaje = alerta.productoNombre || 'Producto';

    const stock = alerta.productoStock || alerta.stockActual;
    const umbral = alerta.productoUmbralStock || alerta.umbralMinimo;

    if (stock !== undefined && umbral !== undefined) {
      mensaje += ` (${stock}/${umbral})`;
    }

    if (alerta.descripcion) {
      // Acortar la descripción si es muy larga
      const descCorta = alerta.descripcion.length > 100
        ? alerta.descripcion.substring(0, 100) + '...'
        : alerta.descripcion;
      mensaje += ` - ${descCorta}`;
    }

    // Determinar tipo de toast según la urgencia
    const tipo = this.determinarTipoToast(alerta.nivelUrgencia);
    const titulo = this.obtenerTituloPorUrgencia(alerta.nivelUrgencia);

    // Crear opciones con la interfaz personalizada
    const toastOptions: ToastOptions = {
      timeOut: tipo === 'error' ? 7000 : tipo === 'warning' ? 6000 : 5000,
      closeButton: true,
      progressBar: true,
      onHidden: () => this.actualizarContadorDespuesDeToast()
    };

    // Usar ngZone para asegurar que Angular detecta los cambios
    this.ngZone.run(() => {
      switch (tipo) {
        case 'error':
          this.toastr.error(mensaje, titulo, toastOptions);
          break;
        case 'warning':
          this.toastr.warning(mensaje, titulo, toastOptions);
          break;
        case 'info':
          this.toastr.info(mensaje, titulo, toastOptions);
          break;
        default:
          this.toastr.warning(mensaje, titulo, toastOptions);
      }
    });
  }

  /**
   * Determinar tipo de toast según urgencia
   */
  private determinarTipoToast(nivelUrgencia: string): 'success' | 'warning' | 'error' | 'info' {
    switch (nivelUrgencia?.toUpperCase()) {
      case 'ALTA':
      case 'CRITICA':
        return 'error';
      case 'MEDIA':
        return 'warning';
      case 'BAJA':
        return 'info';
      default:
        return 'warning';
    }
  }

  /**
   * Obtener título según nivel de urgencia
   */
  private obtenerTituloPorUrgencia(nivelUrgencia: string): string {
    switch (nivelUrgencia?.toUpperCase()) {
      case 'ALTA':
      case 'CRITICA':
        return '🚨 Alerta Crítica de Stock';
      case 'MEDIA':
        return '⚠️ Alerta de Stock';
      case 'BAJA':
        return '📋 Notificación de Stock';
      default:
        return '⚠️ Stock Bajo Detectado';
    }
  }

  /**
   * Manejar error de conexión
   */
  private manejarErrorConexion(): void {
    this.ngZone.run(() => {
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }

      this.conexionSubject.next(false);
      this.intentarReconectar();
    });
  }

  /**
   * Intentar reconexión automática
   */
  private intentarReconectar(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`❌ Máximo de intentos de reconexión alcanzado (${this.maxReconnectAttempts})`);
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;


    this.reconnectTimeout = setTimeout(() => {
      this.conectar();
    }, delay);
  }

  /**
   * Desconectar la fuente de eventos
   */
  desconectar(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.conexionSubject.next(false);
  }

  /**
   * Verificar si hay conexión activa
   */
  get isConectado(): boolean {
    return this.eventSource !== null && this.eventSource.readyState === EventSource.OPEN;
  }
}