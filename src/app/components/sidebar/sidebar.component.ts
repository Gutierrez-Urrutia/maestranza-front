import { Component, Input } from '@angular/core';
import { MenuItem } from '../../interfaces/MenuItem';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: true,
  imports: [
    CommonModule, RouterModule // Add any other components or modules you need here
  ]
})
export class SidebarComponent {
  @Input() visible = false;

  menuItems: MenuItem[] = [
    {
      name: 'Inventario',
      icon: 'bi-box',
      route: '/inventario',
    },
    {
      name: 'Movimientos',
      icon: 'bi-arrow-left-right',
      route: '/movimientos',
    },
    {
      name: 'Alertas',
      icon: 'bi-exclamation-triangle',
      route: '/alertas',
    },
    {
      name: 'Usuarios',
      icon: 'bi-people',
      route: '/usuarios'
    },
  ]
}