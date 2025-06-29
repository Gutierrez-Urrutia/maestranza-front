import { Component, EventEmitter, Input, Output, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Categoria } from '../../../interfaces/Categoria';
import { Producto } from '../../../interfaces/Producto';

@Component({
  selector: 'app-editar-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-form.component.html',
  styleUrl: './editar-form.component.css'
})
export class EditarFormComponent implements OnInit {
  @Input() categorias: Categoria[] = [];
  @Input() producto: Producto | null = null;
  @Output() formSubmit = new EventEmitter<any>();

  formData = {
    codigo: '',
    nombre: '',
    descripcion: '',
    categoriaId: '',
    stock: 0,
    precio: 0
  };

  codigoError: string | null = null;

  ngOnInit() {
    if (this.producto) {
      this.cargarDatosProducto();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['producto'] && this.producto) {
      this.cargarDatosProducto();
    }
  }

  private cargarDatosProducto() {
    if (this.producto) {
      this.formData = {
        codigo: this.producto.codigo || '',
        nombre: this.producto.nombre || '',
        descripcion: this.producto.descripcion || '',
        categoriaId: this.producto.categoria?.id?.toString() || '',
        stock: this.producto.stock || 0,
        precio: this.obtenerPrecioActual(this.producto) || 0
      };
    } else {
      this.formData = {
        codigo: '',
        nombre: '',
        descripcion: '',
        categoriaId: '',
        stock: 0,
        precio: 0
      };
    }
  }

  onCodigoChange() {
    const codigoPattern = /^[a-zA-Z0-9-]*$/;
    if (!codigoPattern.test(this.formData.codigo)) {
      this.codigoError = 'El código solo puede contener letras, números y guiones';
    } else {
      this.codigoError = null;
    }
  }

  onSubmit() {
    if (this.formData.codigo && this.formData.nombre && this.formData.categoriaId && !this.codigoError) {
      const formDataToSubmit = {
        ...this.formData,
        categoriaId: parseInt(this.formData.categoriaId, 10)
      };
      this.formSubmit.emit(formDataToSubmit);
    } else {
      console.error('Por favor complete todos los campos requeridos correctamente');
    }
  }

  private obtenerPrecioActual(producto: Producto): number {
    if (!producto || !producto.historialPrecios || producto.historialPrecios.length === 0) {
      return 0;
    }
    return producto.historialPrecios[0].precio;
  }
}