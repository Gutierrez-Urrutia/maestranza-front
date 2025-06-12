import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Usuario } from '../../../interfaces/Usuario';
import { Rol } from '../../../interfaces/Rol';
import { RolService } from '../../../services/rol/rol.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/login/auth.service';
import { RegistroUsuario } from '../../../interfaces/RegistroUsuario';


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
      case 'ROLE_INVENTARIO': return 'Inventario';
      case 'ROLE_COMPRAS': return 'Compras';
      case 'ROLE_LOGISTICA': return 'Logística';
      case 'ROLE_PRODUCCION': return 'Producción';
      case 'ROLE_AUDITOR': return 'Auditor';
      case 'ROLE_GERENCIA': return 'Gerencia';
      case 'ROLE_TRABAJADOR': return 'Trabajador';
      default: return rolNombre.replace('ROLE_', '');
    }
  }

  // Validaciones
  isFormValid(): boolean {
    return !!(
      this.formData.username.trim() &&
      this.formData.email.trim() &&
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
    // Validar que los campos requeridos estén llenos
    if (this.isFormValid()) {
      this.isSubmitting = true;

      const nuevoUsuario: RegistroUsuario = {
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

          let errorMessage = 'No se pudo crear el usuario';

          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }

          Swal.fire({
            icon: 'error',
            title: 'Error al crear usuario',
            text: errorMessage
          });
        }
      });
    } else {
      console.error('Por favor complete todos los campos requeridos correctamente');
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
  }
}