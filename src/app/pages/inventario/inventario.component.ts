import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BotonAccion } from '../../interfaces/BotonAccion';
import { FooterComponent } from '../../components/footer/footer.component';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ModalComponent } from '../../components/modal/modal.component';
import { AgregarFormComponent } from '../../components/forms/agregar-form/agregar-form.component';
import { EditarFormComponent } from '../../components/forms/editar-form/editar-form.component';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css'],
  standalone: true,
  imports: [CommonModule, FooterComponent, TableModule, TagModule, ModalComponent, AgregarFormComponent, EditarFormComponent]
})
export class InventarioComponent {

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
    { id: 1, codigo: 'A001', nombre: 'Martillo', categoria: 'Herramientas', stock: 25, precio: 45.99 },
    { id: 2, codigo: 'B002', nombre: 'Destornillador', categoria: 'Herramientas', stock: 3, precio: 12.50 },
    { id: 3, codigo: 'C003', nombre: 'Tornillos', categoria: 'Ferretería', stock: 0, precio: 8.75 },
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

  getEstado(stock: number): string {
    if (stock === 0) return 'Agotado';
    if (stock < 10) return 'Bajo Stock';
    return 'Disponible';
  }

  getSeverity(stock: number): string {
    if (stock === 0) return 'danger';
    if (stock < 10) return 'warning';
    return 'success';
  }
}