import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-agregar-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agregar-form.component.html',
  styleUrl: './agregar-form.component.css'
})
export class AgregarFormComponent {
  @Output() formSubmit = new EventEmitter<any>();
  @Output() formCancel = new EventEmitter<void>(); // Agregar evento para cancelar
  @Input() categorias: any[] = [];

  // Modelo del formulario
  formData = {
    codigo: '',
    nombre: '',
    categoriaId: '',
    stock: 0,
    precio: 0
  };

  onSubmit() {
    // Validar que los campos requeridos estén llenos
    if (this.formData.codigo && this.formData.nombre && this.formData.categoriaId) {
      // Convertir categoriaId a número antes de enviar
      const formDataToSubmit = {
        ...this.formData,
        categoriaId: parseInt(this.formData.categoriaId, 10)
      };
      this.formSubmit.emit(formDataToSubmit);
      this.resetForm();
    } else {
      console.error('Por favor complete todos los campos requeridos');
    }
  }

  onCancel() {
    this.resetForm();
    this.formCancel.emit();
  }

  private resetForm() {
    this.formData = {
      codigo: '',
      nombre: '',
      categoriaId: '',
      stock: 0,
      precio: 0
    };
  }
}