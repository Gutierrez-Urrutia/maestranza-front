import { AfterViewInit, Component, ViewChild } from '@angular/core';
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
export class InventarioComponent implements AfterViewInit {

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

  eliminarProducto(producto: any) {
    console.log('Eliminar producto:', producto);
    // Aquí implementaremos SweetAlert
  }

  onAgregarProducto(formData: any) {
    console.log('Agregando producto:', formData);
    // Lógica para agregar producto
    // Cerrar modal después de agregar
  }

  // Agregar este método que falta:
  onEditarProducto(formData: any) {
    console.log('Editando producto:', formData);
    // Lógica para editar producto
    // Cerrar modal después de editar
  }

  // Método para manejar el botón guardar del modal
  guardarProducto() {
    if (this.tipoModal === 'agregar') {
      this.onAgregarProducto({});
    } else if (this.tipoModal === 'editar') {
      this.onEditarProducto({});
    }
  }

  categorias: string[] = [
    'Todos',
    'Herramientas',
    'Materiales Básicos',
    'Equipos de Seguridad',
    'Tornillos y Anclajes',
    'Fijaciones y Adhesión',
    'Equipos de Medición'
  ];

  productos: any = [
    { id: 1, codigo: 'A001', nombre: 'Martillo', categoria: 'Herramientas', stock: 25, precio: 45.99, image_url: '/image.png' },
    { id: 2, codigo: 'B002', nombre: 'Destornillador', categoria: 'Herramientas', stock: 3, precio: 12.50, image_url: '/image.png' },
    { id: 3, codigo: 'C003', nombre: 'Tornillos', categoria: 'Ferretería', stock: 0, precio: 8.75, image_url: '/image.png' },
    { id: 4, codigo: 'D004', nombre: 'Taladro', categoria: 'Herramientas', stock: 15, precio: 89.99, image_url: '/image.png' },
    { id: 5, codigo: 'E005', nombre: 'Sierra', categoria: 'Herramientas', stock: 8, precio: 67.50, image_url: '/image.png' },
    { id: 6, codigo: 'F006', nombre: 'Nivel', categoria: 'Equipos de Medición', stock: 12, precio: 23.75, image_url: '/image.png' },
    { id: 7, codigo: 'G007', nombre: 'Casco', categoria: 'Equipos de Seguridad', stock: 20, precio: 35.00, image_url: '/image.png' },
    { id: 8, codigo: 'H008', nombre: 'Guantes', categoria: 'Equipos de Seguridad', stock: 0, precio: 15.99, image_url: '/image.png' },
    { id: 9, codigo: 'I009', nombre: 'Gafas', categoria: 'Equipos de Seguridad', stock: 5, precio: 18.50, image_url: '/image.png' },
    { id: 10, codigo: 'J010', nombre: 'Llave Inglesa', categoria: 'Herramientas', stock: 7, precio: 28.75, image_url: '/image.png' },
    { id: 11, codigo: 'K011', nombre: 'Alicate', categoria: 'Herramientas', stock: 14, precio: 19.99, image_url: '/image.png' },
    { id: 12, codigo: 'L012', nombre: 'Cemento', categoria: 'Materiales Básicos', stock: 50, precio: 12.00, image_url: '/image.png' }
  ];

  opcionesStock: string[] = [
    'Todos',
    'En Stock',
    'Agotados'
  ];

  botonesAcciones: BotonAccion[] = [
    { texto: 'Agregar', color: 'btn-outline-secondary', icono: 'bi-plus-circle', accion: 'agregar' },
  ];

  botonesProducto: BotonAccion[] = [
    { texto: '', color: 'btn-outline-secondary', icono: 'bi-pencil-square', accion: 'editar' },
    { texto: '', color: 'btn-outline-secondary', icono: 'bi-trash', accion: 'eliminar' }
  ];

  categoriaSeleccionada: string = 'Todos';
  stockSeleccionado: string = 'Todos';

  seleccionarCategoria(categoria: string): void {
    this.categoriaSeleccionada = categoria;
    // Aquí implementarías la lógica de filtrado real
  }

  seleccionarStock(stock: string): void {
    this.stockSeleccionado = stock;
    // Aquí implementarías la lógica de filtrado real
  }

  ngOnInit() {
    this.dataSource.data = this.productos;
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