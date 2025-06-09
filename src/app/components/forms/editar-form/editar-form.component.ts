import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Categoria } from '../../../interfaces/Categoria';
import { Producto } from '../../../interfaces/Producto';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-editar-form',
  standalone: true,
  imports: [
    CommonModule, // Agregar CommonModule
    FormsModule
  ],
  templateUrl: './editar-form.component.html',
  styleUrl: './editar-form.component.css'
})
export class EditarFormComponent implements OnInit { // Implementar OnInit
  @Input() categorias: Categoria[] = []; // Recibir categorías como input
  @Input() producto: Producto | null = null; // Recibir producto a editar como input
  @Output() formSubmit = new EventEmitter<any>();

  formData = {
    codigo: '',
    nombre: '',
    categoriaId: '', // Mantener como string
    stock: 0,
    precio: 0
  };

  ngOnInit() {
    if (this.producto) {
      this.formData = {
        codigo: this.producto.codigo || '',
        nombre: this.producto.nombre || '',
        categoriaId: this.producto.categoria?.id?.toString() || '', // Convertir a string
        stock: this.producto.stock || 0,
        precio: this.obtenerPrecioActual(this.producto) || 0
      };
    }
  }

  onSubmit() {
    if (this.formData.codigo && this.formData.nombre && this.formData.categoriaId) {
      // Convertir categoriaId a número antes de enviar
      const formDataToSubmit = {
        ...this.formData,
        categoriaId: parseInt(this.formData.categoriaId, 10)
      };
      this.formSubmit.emit(formDataToSubmit);
    } else {
      console.error('Por favor complete todos los campos requeridos');
    }
  }

  private obtenerPrecioActual(producto: Producto): number {
    if (!producto || !producto.historialPrecios || producto.historialPrecios.length === 0) {
      return 0;
    }
    // Obtener el precio más reciente
    return producto.historialPrecios[0].precio / 100; // Si está en centavos
  }
}