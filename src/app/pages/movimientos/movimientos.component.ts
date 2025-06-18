import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { FooterComponent } from '../../components/footer/footer.component';
import { ModalComponent } from '../../components/modal/modal.component';
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
import { Producto } from '../../interfaces/Producto';
import { ProductoService } from '../../services/producto/producto.service';
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
    ModalComponent,
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
  @ViewChild(MatSort) sort!: MatSort;
  displayedColumns: string[] = ['fecha', 'usuario', 'codigoProducto', 'nombreProducto', 'cantidad', 'tipo', 'comprobante'];
  dataSource = new MatTableDataSource<Movimiento>();
  movimientos: Movimiento[] = [];
  isLoading = false;
    // Propiedades para el modal
  isSubmitting = false;
  imagenPreview: string | null = null;
  archivoSeleccionado: File | null = null;
  productosDisponibles: Producto[] = [];
  productoSeleccionado: Producto | null = null;
  // Opciones de filtro
  opcionesTipo: string[] = [
    'Todos',
    'Entrada',
    'Salida'
  ];
  tipoSeleccionado: string = 'Todos';
  constructor(
    private productoService: ProductoService,
    private authService: AuthService,
    private movimientoService: MovimientoService
  ) { }
  ngOnInit() {
    this.cargarMovimientos();
    this.cargarProductos();
  }

  private cargarProductos() {
    this.productoService.obtenerProductos().subscribe({
      next: (productos) => {
        this.productosDisponibles = productos;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        Swal.fire({
          icon: 'warning',
          title: 'Error al cargar productos',
          text: 'No se pudieron cargar los productos disponibles',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
    });
  }
  private cargarMovimientos() {
    this.isLoading = true;

    this.movimientoService.obtenerTodos().subscribe({
      next: (movimientos) => {
        this.movimientos = movimientos;
        this.dataSource.data = movimientos;
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

  // Método para obtener el nombre completo del usuario actual
  getCurrentUserName(): string {
    return this.authService.getNombreCompleto();
  }
  // Método para refrescar la lista completa
  refrescarMovimientos() {
    this.cargarMovimientos();
  }

  // Método para manejar la selección de producto por código
  onProductoSeleccionado(codigoProducto: string) {
    if (!codigoProducto) {
      this.productoSeleccionado = null;
      return;
    }

    const producto = this.productosDisponibles.find(p => p.codigo === codigoProducto);
    if (producto) {
      this.productoSeleccionado = producto;
    } else {
      this.productoSeleccionado = null;
    }
  }
  // Método para ver detalles del movimiento
  verDetalles(movimiento: Movimiento) {
    // Aquí se podría abrir un modal con más detalles
  }

  // Método para manejar la selección de archivo
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          icon: 'warning',
          title: 'Archivo no válido',
          text: 'Por favor seleccione solo archivos de imagen (JPG, PNG, etc.)'
        });
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'warning',
          title: 'Archivo muy grande',
          text: 'El archivo debe ser menor a 5MB'
        });
        return;
      }

      this.archivoSeleccionado = file;

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagenPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Método para eliminar la imagen seleccionada
  eliminarImagen() {
    this.archivoSeleccionado = null;
    this.imagenPreview = null;
    
    // Limpiar el input file
    const fileInput = document.getElementById('comprobante') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  // Método para crear nuevo movimiento
  onCrearMovimiento(form: NgForm) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      return;
    }

    // Validar que se haya seleccionado un producto
    if (!this.productoSeleccionado) {
      Swal.fire({
        icon: 'warning',
        title: 'Producto requerido',
        text: 'Debe seleccionar un producto para crear el movimiento'
      });
      return;
    }

    this.isSubmitting = true;

    const formData = form.value;

    // Obtener el usuario logueado
    const usuarioLogueado = this.authService.getUser();
    
    if (!usuarioLogueado) {
      Swal.fire({
        icon: 'error',
        title: 'Sesión requerida',
        text: 'Debe iniciar sesión para crear movimientos'
      });
      this.isSubmitting = false;
      return;
    }

    // Crear objeto para enviar al backend (solo los datos necesarios)
    const movimientoData = {
      usuarioId: usuarioLogueado.id, // Agregar el usuarioId
      productoId: this.productoSeleccionado.id,
      cantidad: formData.cantidad,
      tipo: formData.tipo as TipoMovimiento,
      descripcion: formData.descripcion || ''
    };

    // Llamar al servicio para crear el movimiento
    this.movimientoService.registrarMovimiento(movimientoData).subscribe({
      next: (movimientoCreado) => {
        // Recargar la lista de movimientos para reflejar el cambio
        this.cargarMovimientos();
        
        // Limpiar formulario
        form.resetForm();
        this.eliminarImagen();
        this.productoSeleccionado = null;
        this.isSubmitting = false;

        // Cerrar modal
        const modalElement = document.getElementById('modalMovimiento');
        if (modalElement) {
          const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          }
        }

        // Mostrar mensaje de éxito
        Swal.fire({
          icon: 'success',
          title: '¡Movimiento creado!',
          text: `El movimiento de ${formData.tipo.toLowerCase()} se registró exitosamente`,
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (error) => {
        console.error('Error al crear movimiento:', error);
        this.isSubmitting = false;
        
        let mensajeError = 'Ocurrió un error al crear el movimiento';
        if (error.error && error.error.message) {
          mensajeError = error.error.message;
        } else if (error.status === 401) {
          mensajeError = 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.';
        } else if (error.status === 403) {
          mensajeError = 'No tiene permisos para realizar esta acción.';
        } else if (error.status === 400) {
          mensajeError = 'Los datos enviados no son válidos.';
        }

        Swal.fire({
          icon: 'error',
          title: 'Error al crear movimiento',
          text: mensajeError,
          confirmButtonText: 'Entendido'
        });
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

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
}