import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../../components/footer/footer.component';
import { MovimientoFormComponent } from '../../components/forms/movimiento-form/movimiento-form.component';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Movimiento, TipoMovimiento } from '../../interfaces/Movimiento';
import { Usuario } from '../../interfaces/Usuario';
import { AuthService } from '../../services/login/auth.service';
import { MovimientoService } from '../../services/movimiento/movimiento.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-movimientos',
  templateUrl: './movimientos.component.html',
  styleUrls: ['./movimientos.component.css'],
  standalone: true,  imports: [
    CommonModule,
    FormsModule,
    FooterComponent,
    MovimientoFormComponent,
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
export class MovimientosComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  displayedColumns: string[] = ['fecha', 'usuario', 'codigoProducto', 'nombreProducto', 'cantidad', 'tipo', 'comprobante'];
  dataSource = new MatTableDataSource<Movimiento>();
  movimientos: Movimiento[] = [];
  isLoading = false;

  // Opciones de filtro
  opcionesTipo: string[] = [
    'Todos',
    'ENTRADA',
    'SALIDA'
  ];
  tipoSeleccionado: string = 'Todos';
  constructor(
    private authService: AuthService,
    private movimientoService: MovimientoService,
    private cdr: ChangeDetectorRef
  ) { }ngOnInit() {
    this.cargarMovimientos();
  }

  // Método que se ejecuta cuando se crea un movimiento desde el formulario
  onMovimientoCreado() {
    this.cargarMovimientos();
  }private cargarMovimientos() {
    this.isLoading = true;

    this.movimientoService.obtenerTodos().subscribe({
      next: (movimientos) => {
        // Ordenar movimientos por fecha desde el más nuevo al más antiguo
        this.movimientos = movimientos.sort((a, b) => {
          const fechaA = new Date(a.fecha);
          const fechaB = new Date(b.fecha);
          return fechaB.getTime() - fechaA.getTime(); // Orden descendente (más nuevo primero)
        });
        
        this.dataSource.data = this.movimientos;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar movimientos:', error);
        this.isLoading = false;
        
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar movimientos',
          text: 'No se pudieron cargar los movimientos. Verifique que el servidor esté ejecutándose.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 4000
        });

        // En caso de error, usar datos vacíos
        this.movimientos = [];
        this.dataSource.data = [];
      }
    });
  }

  // Método helper para obtener la clase CSS del badge según el tipo
  getTipoBadgeClass(tipo: TipoMovimiento): string {
    switch (tipo) {
      case TipoMovimiento.ENTRADA:
        return 'bg-success';
      case TipoMovimiento.SALIDA:
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  // Método helper para obtener icono según el tipo
  getTipoIcon(tipo: TipoMovimiento): string {
    switch (tipo) {
      case TipoMovimiento.ENTRADA:
        return 'arrow_downward';
      case TipoMovimiento.SALIDA:
        return 'arrow_upward';
      default:
        return 'swap_horiz';
    }
  }

  seleccionarTipo(tipo: string): void {
    this.tipoSeleccionado = tipo;
    this.aplicarFiltros();
  }

  private aplicarFiltros() {
    let movimientosFiltrados = [...this.movimientos];

    // Filtrar por tipo
    if (this.tipoSeleccionado !== 'Todos') {
      movimientosFiltrados = movimientosFiltrados.filter(movimiento =>
        movimiento.tipo === this.tipoSeleccionado
      );
    }

    this.dataSource.data = movimientosFiltrados;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    
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
    const total = this.movimientos.length;
    const entradas = this.movimientos.filter(m => m.tipo === TipoMovimiento.ENTRADA).length;
    const salidas = this.movimientos.filter(m => m.tipo === TipoMovimiento.SALIDA).length;

    return { total, entradas, salidas };
  }
  // Método para obtener el usuario actual
  getCurrentUser(): Usuario | null {
    return this.authService.getUser();
  }

  // Método para refrescar la lista completa
  refrescarMovimientos() {
    this.cargarMovimientos();
  }
  // Método para ver detalles del movimiento
  verDetalles(movimiento: Movimiento) {
    // Verificar si hay imagen de comprobante
    if (movimiento.imagePath && movimiento.imagePath.trim() !== '') {      // Mostrar modal con la imagen
      Swal.fire({
        title: `Comprobante del Movimiento`,
        html: `
          <div class="comprobante-details">
            <div class="mb-3">
              <p><strong>Fecha:</strong> ${this.formatearFecha(movimiento.fecha)}</p>
              <p><strong>Tipo:</strong> ${movimiento.tipo}</p>
              <p><strong>Producto:</strong> ${movimiento.productoNombre} (${movimiento.productoCodigo})</p>
              <p><strong>Cantidad:</strong> ${movimiento.cantidad}</p>
              <p><strong>Usuario:</strong> ${movimiento.usuario.nombre} ${movimiento.usuario.apellido}</p>
              ${movimiento.descripcion ? `<p><strong>Descripción:</strong> ${movimiento.descripcion}</p>` : ''}
            </div>
            <div class="text-center">
              <img src="${movimiento.imagePath}" 
                   alt="Comprobante del movimiento" 
                   class="img-fluid rounded shadow-sm"
                   style="max-width: 100%; max-height: 60vh; object-fit: contain; border: 2px solid #dee2e6;"
                   onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjYWFhIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2VuIG5vIGRpc3BvbmlibGU8L3RleHQ+PC9zdmc+'; this.alt='Imagen no disponible';">
            </div>
          </div>
        `,
        width: '80%',
        showCloseButton: true,
        showConfirmButton: false,
        customClass: {
          htmlContainer: 'text-start'
        },
        didOpen: () => {
          // Agregar estilos adicionales si es necesario
          const container = document.querySelector('.comprobante-details');
          if (container) {
            (container as HTMLElement).style.fontFamily = 'inherit';
          }
        }
      });
    } else {
      // No hay imagen de comprobante
      Swal.fire({
        title: 'Detalles del Movimiento',
        html: `
          <div class="movimiento-details text-start">
            <p><strong>Fecha:</strong> ${this.formatearFecha(movimiento.fecha)}</p>
            <p><strong>Tipo:</strong> ${movimiento.tipo}</p>
            <p><strong>Producto:</strong> ${movimiento.productoNombre} (${movimiento.productoCodigo})</p>
            <p><strong>Cantidad:</strong> ${movimiento.cantidad}</p>
            <p><strong>Usuario:</strong> ${movimiento.usuario.nombre} ${movimiento.usuario.apellido}</p>
            ${movimiento.descripcion ? `<p><strong>Descripción:</strong> ${movimiento.descripcion}</p>` : ''}
            <div class="alert alert-info mt-3">
              <i class="bi bi-info-circle me-2"></i>
              Este movimiento no tiene comprobante de imagen adjunto.
            </div>
          </div>
        `,
        icon: 'info',
        width: '500px',
        showCloseButton: true,
        confirmButtonText: 'Cerrar'
      });
    }
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Configurar ordenamiento por defecto por fecha (más nuevo primero) usando setTimeout para evitar ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      if (this.sort) {
        this.sort.sort({ id: 'fecha', start: 'desc', disableClear: false });
      }
    });

    // Personalizar la función de filtro
    this.dataSource.filterPredicate = (data: Movimiento, filter: string) => {
      const searchString = filter.toLowerCase();
      return data.productoCodigo?.toLowerCase().includes(searchString) ||
             data.productoNombre?.toLowerCase().includes(searchString) ||
             data.usuario.nombre.toLowerCase().includes(searchString) ||
             data.usuario.apellido.toLowerCase().includes(searchString) ||
             data.tipo.toLowerCase().includes(searchString) ||
             data.descripcion?.toLowerCase().includes(searchString) || false;
    };

    // Configurar textos del paginador en español
    if (this.paginator) {
      this.paginator._intl.itemsPerPageLabel = 'Elementos por página:';
      this.paginator._intl.nextPageLabel = 'Página siguiente';
      this.paginator._intl.previousPageLabel = 'Página anterior';
      this.paginator._intl.firstPageLabel = 'Primera página';
      this.paginator._intl.lastPageLabel = 'Última página';
      this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
        if (length === 0 || pageSize === 0) {
          return `0 de ${length}`;
        }
        const startIndex = page * pageSize;
        const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
        return `${startIndex + 1} - ${endIndex} de ${length}`;
      };
    }
  }

  // Método para formatear el texto de los tipos
  formatearTipoTexto(tipo: string): string {
    if (tipo === 'Todos') return 'Todos';
    return tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase();
  }
}