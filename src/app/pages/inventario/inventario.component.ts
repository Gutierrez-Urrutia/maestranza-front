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

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  displayedColumns: string[] = ['imagen', 'codigo', 'nombre', 'categoria', 'stock', 'precio', 'acciones'];
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

  // Método para manejar el botón guardar del modal
  guardarProducto() {
    if (this.tipoModal === 'agregar') {
      this.onAgregarProducto({});
    } else if (this.tipoModal === 'editar') {
      this.onEditarProducto({});
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

  ngOnInit() {
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
        console.error('Error al cargar categorías:', error);
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
        console.error('Error al cargar productos:', error);
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
    this.productoService.crearProducto(formData).subscribe({
      next: (productoCreado) => {
        console.log('Producto agregado:', productoCreado);
        this.cargarProductos(); // Recargar la lista
        // Cerrar modal después de agregar
      },
      error: (error) => {
        console.error('Error al agregar producto:', error);
      }
    });
  }

  onEditarProducto(formData: any) {
    if (this.productoSeleccionado) {
      this.productoService.actualizarProducto(this.productoSeleccionado.id, formData).subscribe({
        next: (productoActualizado) => {
          console.log('Producto editado:', productoActualizado);
          this.cargarProductos(); // Recargar la lista
          // Cerrar modal después de editar
        },
        error: (error) => {
          console.error('Error al editar producto:', error);
        }
      });
    }
  }

  eliminarProducto(producto: any) {
    // Aquí podrías usar SweetAlert para confirmar la eliminación
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      this.productoService.eliminarProducto(producto.id).subscribe({
        next: () => {
          console.log('Producto eliminado:', producto);
          this.cargarProductos(); // Recargar la lista
        },
        error: (error) => {
          console.error('Error al eliminar producto:', error);
        }
      });
    }
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
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

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
      this.paginator._intl.changes.next();
    }
  }

}