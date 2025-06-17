import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FooterComponent } from '../../components/footer/footer.component';
import { NotificationService, NotificacionAlerta } from '../../services/notification/notification.service';

@Component({
  selector: 'app-movimientos',
  templateUrl: './movimientos.component.html',
  styleUrls: ['./movimientos.component.css'],
  standalone: true,
  imports: [CommonModule, FooterComponent]
})
export class MovimientosComponent {
  
  movimientos: any[] = [
    {
      id: 1,
      tipoMovimiento: 'Entrada',
      cantidad: 50,
      fechaMovimiento: new Date('2024-01-15'),
      observacion: 'Compra de inventario inicial',
      usuario: { nombre: 'Juan Pérez' },
      producto: {
        nombre: 'Martillo Profesional',
        serie: 12345,
        categoria: { nombre: 'Herramientas' }
      }
    },
    {
      id: 2,
      tipoMovimiento: 'Salida',
      cantidad: 10,
      fechaMovimiento: new Date('2024-01-16'),
      observacion: 'Venta a cliente regular',
      usuario: { nombre: 'María García' },
      producto: {
        nombre: 'Destornillador Set',
        serie: 12346,
        categoria: { nombre: 'Herramientas' }
      }
    },
  ];

  // Método para obtener el estilo del tag según el tipo de movimiento
  getTipoSeverity(tipoMovimiento: string): string {
    switch (tipoMovimiento.toLowerCase()) {
      case 'entrada':
        return 'success';
      case 'salida':
        return 'danger';
      case 'ajuste':
        return 'warning';
      default:
        return 'info';
    }
  }

  // Método para obtener el ícono según el tipo de movimiento
  getTipoIcon(tipoMovimiento: string): string {
    switch (tipoMovimiento.toLowerCase()) {
      case 'entrada':
        return 'bi-arrow-down-circle';
      case 'salida':
        return 'bi-arrow-up-circle';
      case 'ajuste':
        return 'bi-arrow-repeat';
      default:
        return 'bi-circle';
    }
  }
}