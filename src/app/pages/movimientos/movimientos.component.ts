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
    // Aquí se podría abrir un modal con más detalles
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