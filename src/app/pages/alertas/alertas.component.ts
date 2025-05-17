import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-alertas',
  templateUrl: './alertas.component.html',
  styleUrl: './alertas.component.css',
  standalone: true,
  imports: [RouterModule, CommonModule],

})
export class AlertasComponent {

}
