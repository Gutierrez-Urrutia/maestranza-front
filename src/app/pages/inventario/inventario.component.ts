import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BotonAccion } from '../../interfaces/BotonAccion';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class InventarioComponent {

  categorias: string[] = [
    'Todos',
    'Herramientas', 
    'Materiales Básicos', 
    'Equipos de Seguridad', 
    'Tornillos y Anclajes', 
    'Fijaciones y Adhesión', 
    'Equipos de Medición'
  ];
  
  opcionesStock: string[] = [
    'Todos',
    'En Stock',
    'Agotados'
  ];

  botonesAcciones: BotonAccion[] = [
    { texto: 'Agregar', color: 'btn-outline-secondary', icono: 'bi-plus-circle', accion: 'agregar' },
    { texto: 'Editar', color: 'btn-outline-secondary', icono: 'bi-pencil-square', accion: 'editar' },
    { texto: 'Eliminar', color: 'btn-outline-secondary', icono: 'bi-trash', accion: 'eliminar' }
  ];
  
  categoriaSeleccionada: string = 'Todos';
  stockSeleccionado: string = 'Todos';
  
  seleccionarCategoria(categoria: string): void {
    this.categoriaSeleccionada = categoria;
    // Aquí implementarías la lógica de filtrado real
  }
  
  seleccionarStock(stock: string): void {
    this.stockSeleccionado = stock;
    // Aquí implementarías la lógica de filtrado real
  }
}