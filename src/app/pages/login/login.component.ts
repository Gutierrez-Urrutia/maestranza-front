import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginRequest } from '../../interfaces/LoginRequest';
import { AuthService } from '../../services/login/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  // Custom validator function
  static alphanumericValidator(control: AbstractControl): ValidationErrors | null {
    const valid = /^[a-zA-Z0-9]*$/.test(control.value);
    return valid ? null : { alphanumeric: true };
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, LoginComponent.alphanumericValidator]],
      password: ['', Validators.required]
    });
  }

  // Getter methods for easy access in template
  get usernameControl() {
    return this.loginForm.get('username');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      if (this.usernameControl?.errors?.['alphanumeric']) {
        this.errorMessage = 'El usuario solo puede contener letras y números';
      } else {
        this.errorMessage = 'Por favor complete todos los campos correctamente';
      }
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials: LoginRequest = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: () => {
        this.router.navigate(['/inventario']);
      },
      error: (error) => {
        console.error('Error completo en login:', error);
        console.error('Status:', error.status);
        console.error('Error body:', error.error);

        if (error.status === 401) {
          this.errorMessage = 'Credenciales incorrectas. Verifica tu usuario y contraseña.';
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