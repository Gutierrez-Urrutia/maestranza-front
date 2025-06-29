import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-agregar-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './agregar-form.component.html',
  styleUrl: './agregar-form.component.css'
})
export class AgregarFormComponent {
  @Output() formSubmit = new EventEmitter<any>();
  @Output() formCancel = new EventEmitter<void>();
  @Input() categorias: any[] = [];

  productForm: FormGroup;

  // Custom validator for código field
  static codigoValidator(control: AbstractControl): ValidationErrors | null {
    const valid = /^[a-zA-Z0-9-]*$/.test(control.value);
    return valid ? null : { invalidCodigo: true };
  }

  constructor(private fb: FormBuilder) {
    this.productForm = this.fb.group({
      codigo: ['', [Validators.required, AgregarFormComponent.codigoValidator]],
      nombre: ['', Validators.required],
      descripcion: [''],
      categoriaId: ['', Validators.required],
      stock: [0, [Validators.required, Validators.min(0)]],
      precio: [0, [Validators.required, Validators.min(0)]]
    });
  }

  // Getters for easy access in template
  get codigoControl() {
    return this.productForm.get('codigo');
  }

  get nombreControl() {
    return this.productForm.get('nombre');
  }

  get categoriaIdControl() {
    return this.productForm.get('categoriaId');
  }

  get stockControl() {
    return this.productForm.get('stock');
  }

  get precioControl() {
    return this.productForm.get('precio');
  }

  onSubmit() {
    if (this.productForm.valid) {
      const formValue = this.productForm.value;
      // Convertir categoriaId a número
      const formDataToSubmit = {
        ...formValue,
        categoriaId: parseInt(formValue.categoriaId, 10)
      };
      this.formSubmit.emit(formDataToSubmit);
      this.resetForm();
    } else {
      console.error('Por favor complete todos los campos requeridos correctamente');
      // Marcar todos los campos como touched para mostrar los errores
      Object.keys(this.productForm.controls).forEach(key => {
        const control = this.productForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  onCancel() {
    this.resetForm();
    this.formCancel.emit();
  }

  private resetForm() {
    this.productForm.reset({
      codigo: '',
      nombre: '',
      descripcion: '',
      categoriaId: '',
      stock: 0,
      precio: 0
    });
  }
}