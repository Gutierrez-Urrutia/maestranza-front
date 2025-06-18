import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FooterComponent } from '../../components/footer/footer.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Alerta, NivelUrgencia } from '../../interfaces/Alerta';
import { AlertaService } from '../../services/alerta/alerta.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-alertas',
  templateUrl: './alertas.component.html',
  styleUrls: ['./alertas.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FooterComponent,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule
  ]
})
export class AlertasComponent implements AfterViewInit, OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  displayedColumns: string[] = ['urgencia', 'producto', 'stock', 'descripcion', 'tiempo', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<Alerta>();

  alertas: Alerta[] = [];
  isLoading = false;

  // Opciones de filtro
  opcionesUrgencia: string[] = [
    'Todos',
    'CRITICA',
    'ALTA',
    'MEDIA',
    'BAJA'
  ];

  opcionesEstado: string[] = [
    'Todos',
    'Activas',
    'Inactivas'
  ];

  urgenciaSeleccionada: string = 'Todos';
  estadoSeleccionado: string = 'Todos';

  constructor(private alertaService: AlertaService) { }

  ngOnInit() {
    this.cargarAlertas();
  }

  private cargarAlertas() {
    this.isLoading = true;

    this.alertaService.obtenerTodas().subscribe({
      next: (alertas) => {
        this.alertas = alertas;
        this.dataSource.data = alertas;

        // Actualizar contador automáticamente después de cargar
        this.alertaService.actualizarContadorAlertas();

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar alertas:', error);
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las alertas'
        });
      }
    });
  }

  // Método helper para obtener la clase CSS del badge según el nivel de urgencia
  getUrgenciaBadgeClass(urgencia: NivelUrgencia): string {
    switch (urgencia) {
      case NivelUrgencia.CRITICA:
        return 'urgencia-critica';
      case NivelUrgencia.ALTA:
        return 'urgencia-alta';
      case NivelUrgencia.MEDIA:
        return 'urgencia-media';
      case NivelUrgencia.BAJA:
        return 'urgencia-baja';
      default:
        return 'bg-secondary';
    }
  }

  // Método helper para obtener nombre de urgencia más legible
  getUrgenciaDisplayName(urgencia: string): string {
    switch (urgencia) {
      case 'Todos':
        return 'Todos';
      case 'CRITICA':
        return 'Crítica';
      case 'ALTA':
        return 'Alta';
      case 'MEDIA':
        return 'Media';
      case 'BAJA':
        return 'Baja';
      default:
        return urgencia;
    }
  }

  // Método helper para obtener icono según el nivel de urgencia
  getUrgenciaIcon(urgencia: NivelUrgencia): string {
    switch (urgencia) {
      case NivelUrgencia.CRITICA:
        return 'bi-exclamation-triangle-fill';
      case NivelUrgencia.ALTA:
        return 'bi-exclamation-triangle';
      case NivelUrgencia.MEDIA:
        return 'bi-exclamation-circle';
      case NivelUrgencia.BAJA:
        return 'bi-info-circle';
      default:
        return 'bi-bell';
    }
  }

  // Método para obtener el color del stock según el nivel
  getStockColorClass(alerta: Alerta): string {
    const porcentaje = (alerta.productoStock / alerta.productoUmbralStock) * 100;

    if (porcentaje <= 0) return 'text-danger fw-bold'; // Sin stock
    if (porcentaje <= 25) return 'text-danger'; // Stock crítico
    if (porcentaje <= 50) return 'text-warning'; // Stock bajo
    return 'text-success'; // Stock normal
  }

  seleccionarUrgencia(urgencia: string): void {
    this.urgenciaSeleccionada = urgencia;
    this.aplicarFiltros();
  }

  seleccionarEstado(estado: string): void {
    this.estadoSeleccionado = estado;
    this.aplicarFiltros();
  }

  private aplicarFiltros() {
    let alertasFiltradas = [...this.alertas];

    // Filtrar por urgencia
    if (this.urgenciaSeleccionada !== 'Todos') {
      alertasFiltradas = alertasFiltradas.filter(alerta =>
        alerta.nivelUrgencia === this.urgenciaSeleccionada
      );
    }

    // Filtrar por estado
    if (this.estadoSeleccionado === 'Activas') {
      alertasFiltradas = alertasFiltradas.filter(alerta => alerta.activo);
    } else if (this.estadoSeleccionado === 'Inactivas') {
      alertasFiltradas = alertasFiltradas.filter(alerta => !alerta.activo);
    }

    this.dataSource.data = alertasFiltradas;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // MÉTODO UNIFICADO para cambiar estado (reemplaza activarAlerta y desactivarAlerta)
  cambiarEstado(alerta: Alerta) {
    const accion = alerta.activo ? 'desactivar' : 'activar';
    const titulo = alerta.activo ? '¿Desactivar alerta?' : '¿Activar alerta?';
    const texto = `¿Está seguro que desea ${accion} la alerta "${alerta.nombre}"?`;
    const color = alerta.activo ? '#ffc107' : '#28a745';

    Swal.fire({
      title: titulo,
      text: texto,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: color,
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;

        this.alertaService.cambiarEstado(alerta.id).subscribe({
          next: (response) => {
            // Cambiar el estado local
            alerta.activo = !alerta.activo;

            // Aplicar filtros nuevamente para reflejar cambios
            this.aplicarFiltros();

            // El contador se actualiza automáticamente gracias al tap() en el servicio

            Swal.fire({
              icon: 'success',
              title: 'Estado cambiado',
              text: response.message,
              timer: 1500,
              showConfirmButton: false
            });
          },
          error: (error) => {
            console.error('Error al cambiar estado:', error);

            let mensajeError = 'No se pudo cambiar el estado de la alerta';
            if (error.error?.message) {
              mensajeError = error.error.message;
            }

            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: mensajeError
            });
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      }
    });
  }

  // MÉTODOS AUXILIARES para el botón dinámico
  getTextoBotonEstado(alerta: Alerta): string {
    return alerta.activo ? 'Desactivar' : 'Activar';
  }

  getClaseBotonEstado(alerta: Alerta): string {
    return alerta.activo ? 'warn' : 'primary';
  }

  getIconoBotonEstado(alerta: Alerta): string {
    return alerta.activo ? 'pause' : 'play_arrow';
  }

  // MÉTODOS LEGACY - Mantener para compatibilidad (ahora usan cambiarEstado)
  desactivarAlerta(alerta: Alerta) {
    if (!alerta.activo) return;
    this.cambiarEstado(alerta);
  }

  activarAlerta(alerta: Alerta) {
    if (alerta.activo) return;
    this.cambiarEstado(alerta);
  }

  eliminarAlerta(alerta: Alerta) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres eliminar la alerta "${alerta.nombre}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;

        this.alertaService.eliminar(alerta.id).subscribe({
          next: () => {
            // Remover de la lista local
            this.alertas = this.alertas.filter(a => a.id !== alerta.id);
            this.dataSource.data = this.alertas;

            // Aplicar filtros para actualizar la vista
            this.aplicarFiltros();

            // El contador se actualiza automáticamente gracias al tap() en el servicio

            Swal.fire({
              icon: 'success',
              title: '¡Eliminada!',
              text: 'La alerta ha sido eliminada',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (error) => {
            console.error('Error al eliminar alerta:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar la alerta'
            });
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      }
    });
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';

    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Método para obtener estadísticas rápidas
  getEstadisticas() {
    const total = this.alertas.length;
    const activas = this.alertas.filter(a => a.activo).length;
    const criticas = this.alertas.filter(a => a.nivelUrgencia === NivelUrgencia.CRITICA && a.activo).length;

    return { total, activas, criticas };
  }

  // Método para refrescar la lista completa
  refrescarAlertas() {
    this.cargarAlertas();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Personalizar la función de filtro
    this.dataSource.filterPredicate = (data: Alerta, filter: string) => {
      const searchTerm = filter.toLowerCase();

      const searchableFields = [
        data.nombre?.toString().toLowerCase() || '',
        data.descripcion?.toString().toLowerCase() || '',
        data.productoCodigo?.toString().toLowerCase() || '',
        data.productoNombre?.toString().toLowerCase() || '',
        data.categoriaNombre?.toString().toLowerCase() || '',
        data.productoUbicacion?.toString().toLowerCase() || ''
      ];

      return searchableFields.some(field => field.includes(searchTerm));
    };

    // Configurar textos del paginador en español
    if (this.paginator) {
      this.paginator._intl.itemsPerPageLabel = 'Elementos por página:';
      this.paginator._intl.nextPageLabel = 'Página siguiente';
      this.paginator._intl.previousPageLabel = 'Página anterior';
      this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
        if (length === 0 || pageSize === 0) {
          return `0 de ${length}`;
        }
        const startIndex = page * pageSize;
        const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
        return `${startIndex + 1} - ${endIndex} de ${length}`;
      };
      this.paginator._intl.changes.next();
    }
  }
}