import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ModalComponent {
  @Input() modalId: string = 'exampleModal';
  @Input() title: string = 'Modal title';
  @Input() icon: string = 'bi-info-circle';
  @Input() iconColor: string = 'text-primary';
  @Input() size: 'sm' | 'lg' | 'xl' | '' = '';
  
  @Output() onSave = new EventEmitter<void>();
  @Output() onClose = new EventEmitter<void>();

  onSaveClick() {
    this.onSave.emit();
  }

  onCloseClick() {
    this.onClose.emit();
  }
}