import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-agregar-form',
  imports: [],
  templateUrl: './agregar-form.component.html',
  styleUrl: './agregar-form.component.css'
})
export class AgregarFormComponent {
  @Output() formSubmit = new EventEmitter<any>();

  onSubmit() {
    // Aquí recogerías los datos del formulario
    const formData = {
      // datos del formulario
    };
    this.formSubmit.emit(formData);
  }
  
}
