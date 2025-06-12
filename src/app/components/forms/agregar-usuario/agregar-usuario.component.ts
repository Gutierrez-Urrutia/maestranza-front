import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Usuario } from '../../../interfaces/Usuario';
import { Rol } from '../../../interfaces/Rol';
import { RolService } from '../../../services/rol/rol.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/login/auth.service';

@Component({
  selector: 'app-agregar-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agregar-usuario.component.html',
  styleUrl: './agregar-usuario.component.css'
})
export class AgregarUsuarioComponent implements OnInit {
  @Output() usuarioCreado = new EventEmitter<Usuario>();
  @Output() cancelar = new EventEmitter<void>();

  roles: Rol[] = [];
  isSubmitting = false;
  mostrarPassword = false;
  mostrarConfirmPassword = false;

  // Errores de validación específicos
  usernameError: string | null = null;
  emailError: string | null = null;

  // Modelo del formulario
  formData = {
    username: '',
    email: '',
    nombre: '',
    apellido: '',
    password: '',
    confirmPassword: '',
    roles: [] as string[]
  };

  constructor(
    private authService: AuthService,
    private rolService: RolService
  ) { }

  ngOnInit() {
    this.cargarRoles();
  }

  private cargarRoles() {
    this.rolService.obtenerTodos().subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los roles disponibles'
        });
      }
    });
  }

  // Alternar visibilidad de contraseña
  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.mostrarPassword = !this.mostrarPassword;
    } else {
      this.mostrarConfirmPassword = !this.mostrarConfirmPassword;
    }
  }

  // Limpiar errores cuando se modifica un campo
  onUsernameChange() {
    this.usernameError = null;
  }

  onEmailChange() {
    this.emailError = null;
  }

  // Manejar selección de roles
  onRoleChange(rolNombre: string, event: any) {
    if (event.target.checked) {
      this.formData.roles.push(rolNombre);
    } else {
      this.formData.roles = this.formData.roles.filter(rol => rol !== rolNombre);
    }
  }

  // Verificar si un rol está seleccionado
  isRoleSelected(rolNombre: string): boolean {
    return this.formData.roles.includes(rolNombre);
  }

  // Obtener nombre legible del rol
  getRolDisplayName(rolNombre: string): string {
    switch (rolNombre) {
      case 'ROLE_ADMINISTRADOR': return 'Administrador';
      case 'ROLE_GERENCIA': return 'Gerencia';
      case 'ROLE_AUDITOR': return 'Auditor';
      case 'ROLE_INVENTARIO': return 'Inventario';
      case 'ROLE_COMPRAS': return 'Compras';
      case 'ROLE_LOGISTICA': return 'Logística';
      case 'ROLE_PRODUCCION': return 'Producción';
      case 'ROLE_TRABAJADOR': return 'Trabajador';
      default: return rolNombre.replace('ROLE_', '');
    }
  }

  // Obtener clase de badge para el rol
  getRolBadgeClass(rol: string): string {
    switch (rol) {
      case 'ROLE_ADMINISTRADOR': return 'admin';
      case 'ROLE_GERENCIA': return 'gerencia';
      case 'ROLE_AUDITOR': return 'auditor';
      case 'ROLE_INVENTARIO': return 'inventario';
      case 'ROLE_COMPRAS': return 'compras';
      case 'ROLE_LOGISTICA': return 'logistica';
      case 'ROLE_PRODUCCION': return 'prod';
      case 'ROLE_TRABAJADOR': return 'work';
      default: return 'bg-secondary';
    }
  }

  // Validaciones
  isFormValid(): boolean {
    return !!(
      this.formData.username.trim() &&
      !this.usernameError &&
      this.formData.email.trim() &&
      !this.emailError &&
      this.formData.nombre.trim() &&
      this.formData.apellido.trim() &&
      this.formData.password &&
      this.formData.confirmPassword &&
      this.formData.password === this.formData.confirmPassword &&
      this.formData.roles.length > 0
    );
  }

  passwordsMatch(): boolean {
    return this.formData.password === this.formData.confirmPassword;
  }

  onSubmit() {
    if (this.isFormValid()) {
      this.isSubmitting = true;
      // Limpiar errores previos
      this.usernameError = null;
      this.emailError = null;

      const nuevoUsuario = {
        username: this.formData.username.trim(),
        email: this.formData.email.trim().toLowerCase(),
        nombre: this.formData.nombre.trim(),
        apellido: this.formData.apellido.trim(),
        password: this.formData.password,
        roles: this.formData.roles
      };

      this.authService.registro(nuevoUsuario).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          Swal.fire({
            icon: 'success',
            title: '¡Usuario creado!',
            text: `El usuario "${nuevoUsuario.username}" ha sido creado exitosamente`,
            timer: 2000,
            showConfirmButton: false
          });

          // Emitir evento de usuario creado
          this.usuarioCreado.emit(response);

          // Resetear formulario
          this.resetForm();
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error al crear usuario:', error);

          // Manejar errores específicos de validación
          if (error.error && error.error.message) {
            const errorMsg = error.error.message;

            if (errorMsg.includes('nombre de usuario ya está en uso')) {
              this.usernameError = 'El nombre de usuario ya existe';
            } else if (errorMsg.includes('correo electrónico ya está en uso')) {
              this.emailError = 'El correo electrónico ya está registrado';
            } else {
              // Error genérico
              Swal.fire({
                icon: 'error',
                title: 'Error al crear usuario',
                text: errorMsg
              });
            }
          } else {
            // Error general
            Swal.fire({
              icon: 'error',
              title: 'Error al crear usuario',
              text: 'No se pudo crear el usuario'
            });
          }
        }
      });
    }
  }

  onCancel() {
    this.resetForm();
    this.cancelar.emit();
  }

  private resetForm() {
    this.formData = {
      username: '',
      email: '',
      nombre: '',
      apellido: '',
      password: '',
      confirmPassword: '',
      roles: []
    };
    this.usernameError = null;
    this.emailError = null;
  }
}