import { Component, OnInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-debug-info',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="debug-info" [ngClass]="{'dev-mode': !isProduction, 'prod-mode': isProduction}">
      <small>
        <i class="bi" [ngClass]="isProduction ? 'bi-rocket' : 'bi-wrench'"></i>
        <strong>{{environmentName}}</strong>
        <br>
        <span>API: {{getHostFromUrl(apiUrl)}}</span>
        <br>
        <span>DB: {{databaseInfo}}</span>
        <br>
        <button (click)="debugModal()" class="btn btn-warning btn-sm mt-1">Debug Modal</button>
        <button (click)="testSweetAlert()" class="btn btn-success btn-sm mt-1">Test SWAL</button>
        <button (click)="showZIndexInfo()" class="btn btn-info btn-sm mt-1">Z-Index Info</button>
      </small>
    </div>
  `,
  styles: [`
    .debug-info {
      position: fixed;
      bottom: 10px;
      right: 10px;
      padding: 5px 10px;
      border-radius: 5px;
      font-size: 0.75rem;
      z-index: 9999;
    }
    .dev-mode {
      background-color: #fff3cd;
      color: #856404;
      border: 1px solid #ffeaa7;
    }
    .prod-mode {
      background-color: #d1ecf1;
      color: #0c5460;
      border: 1px solid #74c0fc;
    }
  `]
})
export class DebugInfoComponent implements OnInit {
  isProduction = environment.production;
  apiUrl = environment.apiUrl;
  environmentName = (environment as any).name || (environment.production ? 'PRODUCTION' : 'DEVELOPMENT');
  databaseInfo = this.getDatabaseInfo();

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {}

  debugModal() {
    console.clear();
    console.log('=== VERIFICACIÓN COMPLETA DE MODAL STACKING ===');
    
    // Buscar elementos del modal activo
    const modal = document.querySelector('.modal.show') as HTMLElement;
    const backdrop = document.querySelector('.modal-backdrop.show') as HTMLElement;
    
    if (!modal || !backdrop) {
      console.log('❌ Modal o backdrop no encontrado');
      console.log('Modal encontrado:', !!modal);
      console.log('Backdrop encontrado:', !!backdrop);
      return;
    }
    
    const modalStyles = window.getComputedStyle(modal);
    const backdropStyles = window.getComputedStyle(backdrop);
    
    console.log('=== MODAL ===');
    console.log('Element:', modal);
    console.log('z-index:', modalStyles.zIndex);
    console.log('position:', modalStyles.position);
    console.log('display:', modalStyles.display);
    console.log('isolation:', modalStyles.isolation);
    console.log('transform:', modalStyles.transform);
    console.log('filter:', modalStyles.filter);
    console.log('perspective:', modalStyles.perspective);
    console.log('contain:', modalStyles.contain);
    console.log('will-change:', modalStyles.willChange);
    
    console.log('\n=== BACKDROP ===');
    console.log('Element:', backdrop);
    console.log('z-index:', backdropStyles.zIndex);
    console.log('position:', backdropStyles.position);
    console.log('display:', backdropStyles.display);
    
    // Buscar elementos con stacking contexts que pueden interferir
    console.log('\n=== ELEMENTOS CON STACKING CONTEXT ===');
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      const styles = window.getComputedStyle(el);
      const hasStackingContext = 
        styles.isolation !== 'auto' ||
        styles.transform !== 'none' ||
        styles.filter !== 'none' ||
        styles.perspective !== 'none' ||
        styles.willChange !== 'auto' ||
        (styles.position !== 'static' && styles.zIndex !== 'auto' && styles.zIndex !== '0') ||
        styles.contain !== 'none';
        
      if (hasStackingContext && el.tagName && !el.classList.contains('mat-ripple-element')) {
        console.log(`🔍 ${el.tagName}${el.className ? '.' + Array.from(el.classList).join('.') : ''}:`);
        console.log(`  - z-index: ${styles.zIndex}`);
        console.log(`  - position: ${styles.position}`);
        console.log(`  - isolation: ${styles.isolation}`);
        console.log(`  - transform: ${styles.transform}`);
        console.log(`  - filter: ${styles.filter}`);
        console.log(`  - perspective: ${styles.perspective}`);
        console.log(`  - contain: ${styles.contain}`);
        console.log(`  - will-change: ${styles.willChange}`);
        console.log('---');
      }
    });
    
    // Comparar z-index
    const modalZIndex = parseInt(modalStyles.zIndex) || 0;
    const backdropZIndex = parseInt(backdropStyles.zIndex) || 0;
    
    console.log('\n=== COMPARACIÓN Z-INDEX ===');
    console.log(`Modal z-index: ${modalZIndex}`);
    console.log(`Backdrop z-index: ${backdropZIndex}`);
    console.log(`Modal está por encima: ${modalZIndex > backdropZIndex ? '✅' : '❌'}`);
    
    // Verificar interactividad
    const modalDialog = modal.querySelector('.modal-dialog') as HTMLElement;
    if (modalDialog) {
      console.log('\n=== INTERACTIVIDAD ===');
      console.log('Modal dialog encontrado:', !!modalDialog);
      console.log('Pointer events modal:', modalStyles.pointerEvents);
      console.log('Pointer events backdrop:', backdropStyles.pointerEvents);
      
      const rect = modalDialog.getBoundingClientRect();
      console.log('Posición modal dialog:', {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        visible: rect.width > 0 && rect.height > 0
      });
      
      // Verificar qué elemento está en el centro del modal
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const elementAtPoint = document.elementFromPoint(centerX, centerY);
      console.log('Elemento en centro del modal:', elementAtPoint);
      console.log('Es parte del modal:', modalDialog.contains(elementAtPoint));
      console.log('Es el backdrop:', elementAtPoint === backdrop);
    }
  }

  showZIndexInfo() {
    console.log('=== Z-INDEX INFO ===');
    const elements = document.querySelectorAll('*');
    const zIndexElements: Array<{element: Element, zIndex: string, tagName: string, id: string, classes: string}> = [];
    
    elements.forEach(el => {
      const zIndex = getComputedStyle(el as HTMLElement).zIndex;
      if (zIndex !== 'auto') {
        zIndexElements.push({
          element: el,
          zIndex: zIndex,
          tagName: el.tagName,
          id: el.id || '',
          classes: el.className || ''
        });
      }
    });
    
    // Ordenar por z-index
    zIndexElements.sort((a, b) => parseInt(b.zIndex) - parseInt(a.zIndex));
    
    console.log('Elementos con z-index (ordenados de mayor a menor):');
    zIndexElements.forEach(item => {
      console.log(`${item.zIndex}: ${item.tagName}${item.id ? '#' + item.id : ''}${item.classes ? '.' + item.classes.replace(/\s+/g, '.') : ''}`);
    });
  }

  testSweetAlert() {
    console.log('🧪 Probando SweetAlert2 con z-index máximo');
    
    // Importar SweetAlert dinámicamente para la prueba
    import('sweetalert2').then(({ default: Swal }) => {
      Swal.fire({
        title: 'Prueba de Z-Index',
        text: '¿SweetAlert aparece por encima del modal?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, funciona',
        cancelButtonText: 'No, sigue tapado'
      }).then((result) => {
        if (result.isConfirmed) {
          console.log('✅ SweetAlert funciona correctamente');
        } else {
          console.log('❌ SweetAlert sigue tapado por el modal');
        }
      });
    });
  }

  getDatabaseInfo(): string {
    const db = (environment as any).database;
    if (db) {
      return `${db.type} (${db.host === 'localhost' ? 'Local' : db.provider || 'Remote'})`;
    }
    return environment.production ? 'Remote DB' : 'Local DB';
  }

  getHostFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + (urlObj.port ? ':' + urlObj.port : '');
    } catch {
      return url;
    }
  }
}
