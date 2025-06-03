import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-editar-form',
  imports: [],
  templateUrl: './editar-form.component.html',
  styleUrl: './editar-form.component.css'
})
export class EditarFormComponent {
  @Input() producto: any;
  @Output() formSubmit = new EventEmitter<any>();

  onSubmit() {
    const formData = {
      // datos del formulario editado
    };
    this.formSubmit.emit(formData);
  }
}
