import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { BotonAccion } from '../../interfaces/BotonAccion';
import { FooterComponent } from '../../components/footer/footer.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { AgregarFormComponent } from '../../components/forms/agregar-form/agregar-form.component';
import { EditarFormComponent } from '../../components/forms/editar-form/editar-form.component';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ProductoService } from '../../services/producto/producto.service';
import { CategoriaService } from '../../services/categoria/categoria.service';
import { MovimientoService } from '../../services/movimiento/movimiento.service';
import { AuthService } from '../../services/login/auth.service';
import { PermissionService } from '../../services/permission/permission.service';
import { TipoMovimiento } from '../../interfaces/Movimiento';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FooterComponent,
    ModalComponent,
    AgregarFormComponent,
    EditarFormComponent,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ]
})
export class InventarioComponent implements AfterViewInit, OnInit {
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private movimientoService = inject(MovimientoService);
  private authService = inject(AuthService);
  private permissionService = inject(PermissionService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  displayedColumns: string[] = ['codigo', 'nombre', 'categoria', 'stock', 'precio'];
  dataSource = new MatTableDataSource<any>();
  productoParaImagen: any = null;

  tipoModal: 'agregar' | 'editar' = 'agregar';
  productoSeleccionado: any = null;

  modalConfig = {
    title: 'Agregar Producto',
    icon: 'bi-plus-circle',
    iconColor: 'text-primary'
  };

  categorias: any[] = [];
  productos: any[] = [];

  opcionesStock: string[] = [
    'Todos',
    'En Stock',
    'Agotados'
  ];

  constructor() {
    // Inicializar columnas inmediatamente en el constructor
    this.setupDisplayedColumns();
  }

  // Métodos de permisos - definidos temprano para evitar problemas de inicialización
  canManageInventario(): boolean {
    return this.permissionService.canCreateInventario() || 
           this.permissionService.canEditInventario() || 
           this.permissionService.canDeleteInventario();
  }

  ngOnInit() {
    // Asegurar que las columnas estén configuradas
    this.setupDisplayedColumns();
    this.cargarDatos();
  }

  private setupDisplayedColumns() {
    // Columnas base que todos pueden ver
    const baseColumns = ['codigo', 'nombre', 'categoria', 'stock', 'precio'];
    
    // Verificar si los servicios están disponibles
    try {
      // Solo agregar columna de acciones si el usuario puede gestionar
      if (this.canManageInventario()) {
        this.displayedColumns = [...baseColumns, 'acciones'];
      } else {
        this.displayedColumns = [...baseColumns];
      }
    } catch (error) {
      // Si hay error con los permisos, usar solo columnas base
      console.warn('Error al verificar permisos, usando columnas base:', error);
      this.displayedColumns = [...baseColumns];
    }
    
    console.log('Columnas configuradas:', this.displayedColumns);
  }

  abrirModal(tipo: 'agregar' | 'editar', producto?: any) {
    this.tipoModal = tipo;
    this.productoSeleccionado = producto || null;

    // Configurar el modal según el tipo
    this.configurarModal(tipo);
  }

  abrirModalImagen(producto: any) {
    this.productoParaImagen = producto;
  }

  private configurarModal(tipo: 'agregar' | 'editar') {
    switch (tipo) {
      case 'agregar':
        this.modalConfig = {
          title: 'Agregar Producto',
          icon: 'bi-plus-circle',
          iconColor: 'text-primary'
        };
        break;
      case 'editar':
        this.modalConfig = {
          title: 'Editar Producto',
          icon: 'bi-pencil-square',
          iconColor: 'text-warning'
        };
        break;
    }
  }

  botonesAcciones: BotonAccion[] = [
    { texto: 'Agregar', color: 'btn-outline-secondary', icono: 'bi-plus-circle', accion: 'agregar' },
  ];

  botonesProducto: BotonAccion[] = [
    { texto: '', color: 'btn-outline-secondary', icono: 'bi-pencil-square', accion: 'editar' },
    { texto: '', color: 'btn-outline-secondary', icono: 'bi-trash', accion: 'eliminar' }
  ];

  categoriaSeleccionada: string = 'Todos';
  stockSeleccionado: string = 'Todos';

  private cargarDatos() {
    this.cargarCategorias();
    this.cargarProductos();
  }

  private cargarCategorias() {
    this.categoriaService.obtenerCategorias().subscribe({
      next: (categorias) => {
        // Agregar la opción "Todos" al inicio
        this.categorias = [
          { id: 0, nombre: 'Todos' },
          ...categorias
        ];
      },
      error: (error) => {
        // console.error('Error al cargar categorías:', error);

        Swal.fire({
          icon: 'warning',
          title: 'Error al cargar categorías',
          text: 'Se usarán las categorías por defecto',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });

        // Mantener categorías por defecto en caso de error
        this.categorias = [
          { id: 0, nombre: 'Todos' },
          { id: 1, nombre: 'Herramientas' },
          { id: 2, nombre: 'Ferretería' },
          { id: 3, nombre: 'Materiales Básicos' },
          { id: 4, nombre: 'Equipos de Seguridad' },
          { id: 5, nombre: 'Tornillos y Anclajes' },
          { id: 6, nombre: 'Fijaciones y Adhesión' },
          { id: 7, nombre: 'Equipos de Medición' }
        ];
      }
    });
  }

  private cargarProductos() {
    this.productoService.obtenerProductos().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.dataSource.data = productos;
      },
      error: (error) => {
        // console.error('Error al cargar productos:', error);

        Swal.fire({
          icon: 'error',
          title: 'Error al cargar productos',
          text: 'No se pudieron cargar los productos. Intente nuevamente.',
          confirmButtonText: 'Reintentar',
          showCancelButton: true,
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            this.cargarProductos();
          }
        });

        // Mantener productos por defecto en caso de error o mostrar mensaje
        this.productos = [];
        this.dataSource.data = [];
      }
    });
  }

  refrescarDatos() {
    this.cargarCategorias();
    this.cargarProductos();
  }

  seleccionarCategoria(categoria: any): void {
    this.categoriaSeleccionada = categoria.nombre || categoria;
    this.aplicarFiltros();
  }

  seleccionarStock(stock: string): void {
    this.stockSeleccionado = stock;
    this.aplicarFiltros();
  }

  private aplicarFiltros() {
    let productosFiltrados = [...this.productos];

    // Filtrar por categoría
    if (this.categoriaSeleccionada !== 'Todos') {
      productosFiltrados = productosFiltrados.filter(producto =>
        producto.categoria.nombre === this.categoriaSeleccionada
      );
    }

    // Filtrar por stock
    if (this.stockSeleccionado === 'En Stock') {
      productosFiltrados = productosFiltrados.filter(producto => producto.stock > 0);
    } else if (this.stockSeleccionado === 'Agotados') {
      productosFiltrados = productosFiltrados.filter(producto => producto.stock === 0);
    }

    this.dataSource.data = productosFiltrados;
  }
  onAgregarProducto(formData: any) {
    // Validar que los datos están completos
    if (!formData || !formData.codigo || !formData.nombre || !formData.categoriaId) {

      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Por favor complete todos los campos requeridos',
        confirmButtonText: 'Entendido'
      });

      return;
    }

    // Mostrar loading
    Swal.fire({
      title: 'Agregando producto...',
      text: 'Por favor espere',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Construir el objeto producto según lo que espera el backend
    const productoData = {
      codigo: formData.codigo,
      nombre: formData.nombre,
      stock: formData.stock || 0,
      categoriaId: formData.categoriaId, // Ya viene como número del formulario
      // El precio se maneja como parte del historial de precios
      precio: formData.precio || 0 // Convertir a centavos si es necesario
    };
    this.productoService.crearProducto(productoData).subscribe({
      next: (productoCreado) => {
        // Si el producto tiene stock inicial, registrar movimiento de entrada
        if (productoCreado.stock > 0) {
          this.registrarMovimientoInicialProducto(productoCreado);
        } else {
          // Si no tiene stock inicial, solo mostrar éxito y recargar
          this.finalizarCreacionProducto(productoCreado);
        }
      },
      error: (error) => {
        // console.error('Error completo:', error);
        // console.error('Error al agregar producto:', error.error);

        // Mostrar error específico del backend si está disponible
        let errorMessage = 'Error al agregar producto';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }        Swal.fire({
          icon: 'error',
          title: 'Error al agregar producto',
          text: errorMessage,
          confirmButtonText: 'Intentar de nuevo'
        });
      }
    });
  }  // Método auxiliar para registrar movimiento inicial del producto
  private registrarMovimientoInicialProducto(producto: any) {
    const currentUser = this.authService.getUser();
    
    if (!currentUser) {
      console.error('No se pudo obtener el usuario logueado');
      Swal.fire({
        icon: 'warning',
        title: 'Producto creado con advertencia',
        text: `El producto "${producto.nombre}" se creó correctamente, pero no se pudo registrar el movimiento inicial porque no se encontró el usuario logueado.`,
        confirmButtonText: 'Entendido'
      });
      this.finalizarCreacionProducto(producto);
      return;
    }    // Crear el objeto de movimiento con los campos necesarios
    const movimientoData = {
      usuarioId: currentUser.id,
      productoId: producto.id,
      cantidad: producto.stock,
      tipo: TipoMovimiento.ENTRADA,
      descripcion: `Stock inicial del producto ${producto.codigo} - ${producto.nombre}`
    };

    console.log('Enviando movimiento:', movimientoData);

    this.movimientoService.registrarMovimiento(movimientoData).subscribe({
      next: (movimiento) => {
        console.log('Movimiento inicial registrado:', movimiento);
        this.finalizarCreacionProducto(producto);
      },
      error: (error) => {
        console.error('Error al registrar movimiento inicial:', error);
        console.error('Detalles del error:', error.error);
        
        // Aun así, completamos la creación del producto y mostramos un warning
        Swal.fire({
          icon: 'warning',
          title: 'Producto creado con advertencia',
          text: `El producto "${producto.nombre}" se creó correctamente, pero no se pudo registrar el movimiento inicial de stock. Error: ${error.error?.message || error.message || 'Error desconocido'}`,
          confirmButtonText: 'Entendido'
        });
        this.finalizarCreacionProducto(producto);
      }
    });
  }

  // Método auxiliar para finalizar la creación del producto
  private finalizarCreacionProducto(productoCreado: any) {
    this.cargarProductos(); // Recargar la lista

    // Cerrar modal programáticamente
    const modalElement = document.getElementById('modalProducto');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }

    // Mostrar mensaje de éxito
    Swal.fire({
      icon: 'success',
      title: '¡Producto agregado!',
      text: `El producto "${productoCreado.nombre}" se agregó exitosamente${productoCreado.stock > 0 ? ' y se registró su stock inicial' : ''}`,
      timer: 3000,
      showConfirmButton: false
    });
  }

  onEditarProducto(formData: any) {

    if (!this.productoSeleccionado) {
      // console.error('No hay producto seleccionado para editar');

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No hay producto seleccionado para editar'
      });

      return;
    }

    // Validar que los datos están completos
    if (!formData || !formData.codigo || !formData.nombre || !formData.categoriaId) {
      // console.error('Datos del formulario incompletos:', formData);

      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Por favor complete todos los campos requeridos',
        confirmButtonText: 'Entendido'
      });

      return;
    }

    // Mostrar loading
    Swal.fire({
      title: 'Editando producto...',
      text: 'Por favor espere',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Construir el objeto producto para actualizar
    const productoData = {
      codigo: formData.codigo,
      nombre: formData.nombre,
      stock: formData.stock || 0,
      categoriaId: formData.categoriaId,
      precio: formData.precio || 0 // Convertir a centavos si es necesario
    };


    this.productoService.actualizarProducto(this.productoSeleccionado.id, productoData).subscribe({
      next: (productoActualizado) => {
        this.cargarProductos(); // Recargar la lista

        // Cerrar modal programáticamente
        const modalElement = document.getElementById('modalProducto');
        if (modalElement) {
          const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          }
        }

        Swal.fire({
          icon: 'success',
          title: '¡Producto editado!',
          text: `El producto "${productoActualizado.nombre}" se editó exitosamente`,
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (error) => {
        // console.error('Error completo:', error);
        // console.error('Error al editar producto:', error.error);

        // Mostrar error específico del backend si está disponible
        let errorMessage = 'Error al editar producto';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        Swal.fire({
          icon: 'error',
          title: 'Error al editar producto',
          text: errorMessage,
          confirmButtonText: 'Intentar de nuevo'
        });
      }
    });
  }

  eliminarProducto(producto: any) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres eliminar el producto "${producto.nombre}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        // Mostrar loading durante la eliminación
        Swal.fire({
          title: 'Eliminando producto...',
          text: 'Por favor espere',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        this.productoService.eliminarProducto(producto.id).subscribe({
          next: () => {
            this.cargarProductos();

            Swal.fire({
              icon: 'success',
              title: '¡Eliminado!',
              text: `El producto "${producto.nombre}" ha sido eliminado`,
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (error) => {
            // console.error('Error al eliminar producto:', error);

            let errorMessage = 'Error al eliminar el producto';
            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            } else if (error.message) {
              errorMessage = error.message;
            }

            Swal.fire({
              icon: 'error',
              title: 'Error al eliminar',
              text: errorMessage,
              confirmButtonText: 'Entendido'
            });
          }
        });
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  editarProducto(producto: any) {
    this.abrirModal('editar', producto);
  }

  ngAfterViewInit() {
    // Asegurar que las columnas estén configuradas antes de configurar la tabla
    if (this.displayedColumns.length === 0) {
      console.warn('Columnas no configuradas en ngAfterViewInit, reconfigurando...');
      this.setupDisplayedColumns();
    }
    
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const searchTerm = filter.toLowerCase();

      // Definir los campos en los que queremos buscar (excluyendo descripción)
      const searchableFields = [
        data.codigo?.toString().toLowerCase() || '',
        data.nombre?.toString().toLowerCase() || '',
        data.categoria?.nombre?.toString().toLowerCase() || '',
        data.stock?.toString().toLowerCase() || '',
        // Puedes agregar más campos aquí si necesitas
        // data.precio?.toString().toLowerCase() || ''
      ];

      // Buscar el término en cualquiera de los campos permitidos
      return searchableFields.some(field => field.includes(searchTerm));
    };

    // Forzar actualización del paginador
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
      this.paginator._intl.changes.next();    }
  }

  canCreateInventario(): boolean {
    return this.permissionService.canCreateInventario();
  }

  canEditInventario(): boolean {
    return this.permissionService.canEditInventario();
  }

  canDeleteInventario(): boolean {
    return this.permissionService.canDeleteInventario();
  }

  canViewInventario(): boolean {
    return this.permissionService.canView();
  }

  getUserRole(): string {
    return this.permissionService.getUserMainRole();
  }

  getAccessLevelDescription(): string {
    return this.permissionService.getAccessLevelDescription();
  }
}