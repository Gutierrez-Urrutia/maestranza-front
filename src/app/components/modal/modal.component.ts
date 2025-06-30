import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, ElementRef, Renderer2, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() modalId: string = 'exampleModal';
  @Input() title: string = 'Modal title';
  @Input() icon: string = 'bi-info-circle';
  @Input() iconColor: string = 'text-primary';
  @Input() size: 'sm' | 'lg' | 'xl' | '' = '';
  
  @Output() onSave = new EventEmitter<void>();
  @Output() onClose = new EventEmitter<void>();

  private originalParent: Node | null = null;
  private modalElement: HTMLElement | null = null;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    // Mover el modal al body para evitar stacking context issues
    this.moveModalToBody();
  }

  ngOnDestroy() {
    // Restaurar la posición original del modal si es necesario
    this.restoreModalPosition();
  }

  private moveModalToBody() {
    this.modalElement = this.elementRef.nativeElement.querySelector('.modal');
    if (this.modalElement) {
      // Guardar el padre original
      this.originalParent = this.modalElement.parentNode;
      
      // Mover al body
      this.renderer.appendChild(document.body, this.modalElement);
      
      console.log('✅ Modal movido al body para evitar stacking context issues');
    }
  }

  private restoreModalPosition() {
    if (this.modalElement && this.originalParent) {
      // Restaurar al padre original
      this.renderer.appendChild(this.originalParent, this.modalElement);
    }
  }

  onSaveClick() {
    this.onSave.emit();
  }

  onCloseClick() {
    this.onClose.emit();
  }
}