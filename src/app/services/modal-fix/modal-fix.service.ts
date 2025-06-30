import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModalFixService {
  
  constructor() {}

  /**
   * Solución simple: solo ajustar z-index básico
   */
  fixModalZIndex(modalId: string = ''): void {
    setTimeout(() => {
      // Buscar el modal
      const modal = modalId ? document.querySelector(`#${modalId}`) : document.querySelector('.modal');
      if (modal) {
        (modal as HTMLElement).style.zIndex = '1050';
      }
      
      // Buscar el backdrop
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        (backdrop as HTMLElement).style.zIndex = '1040';
      }
    }, 50);
  }

  /**
   * Reduce el z-index de todos los overlays de Angular Material
   */
  private resetAngularMaterialOverlays(): void {
    // No hacer nada complejo, solo ajustes mínimos si es necesario
  }

  /**
   * Fuerza que el modal de Bootstrap esté por encima de todo
   */
  private forceBootstrapModalAbove(modalId: string): void {
    // No hacer nada complejo, ya se maneja con CSS
  }

  /**
   * Limpia las modificaciones cuando se cierra el modal
   */
  cleanupModalFix(): void {
    // Limpieza mínima
  }
}
