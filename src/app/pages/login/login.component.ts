import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginRequest } from '../../interfaces/LoginRequest';
import { AuthService } from '../../services/login/auth.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  credentials: LoginRequest = {
    username: '',
    password: ''
  };

  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onSubmit(): void {
    if (!this.credentials.username || !this.credentials.password) {
      this.errorMessage = 'Por favor complete todos los campos';
      return;
    }

    console.log('Enviando credenciales:', this.credentials);

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        console.log('Login exitoso', response);
        // Redirigir a la página principal - ajusta según tu estructura de rutas
        this.router.navigate(['/inventario']); // o la ruta que corresponda
      },
      error: (error) => {
        console.error('Error completo en login:', error);
        console.error('Status:', error.status);
        console.error('Error body:', error.error);

        if (error.status === 401) {
          this.errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
        } else if (error.status === 0) {
          this.errorMessage = 'Error de conexión. Verifica que el servidor esté funcionando.';
        } else {
          this.errorMessage = 'Error del servidor. Inténtelo más tarde.';
        }
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}