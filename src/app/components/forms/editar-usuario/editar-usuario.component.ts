import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Usuario } from '../../../interfaces/Usuario';
import { Rol } from '../../../interfaces/Rol';
import { UsuarioService } from '../../../services/usuario/usuario.service';
import { RolService } from '../../../services/rol/rol.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editar-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-usuario.component.html',
  styleUrl: './editar-usuario.component.css'
})
export class EditarUsuarioComponent implements OnInit {
  @Input() usuario: Usuario | null = null;
  @Output() usuarioActualizado = new EventEmitter<Usuario>();
  @Output() cancelar = new EventEmitter<void>();

  roles: Rol[] = [];
  isSubmitting = false;

  // Error específico para el email
  emailError: string | null = null;

  // Modelo del formulario
  formData = {
    nombre: '',
    apellido: '',
    email: '',
    roles: [] as string[]
  };

  constructor(
    private usuarioService: UsuarioService,
    private rolService: RolService
  ) { }

  ngOnInit() {
    this.cargarRoles();
    this.cargarDatosUsuario();
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

  private cargarDatosUsuario() {
    if (this.usuario) {
      this.formData = {
        nombre: this.usuario.nombre,
        apellido: this.usuario.apellido,
        email: this.usuario.email,
        roles: [...this.usuario.roles] // Copia del array
      };
      // Limpiar cualquier error previo
      this.emailError = null;
    }
  }

  // Método para limpiar el error de email cuando se modifica el campo
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

  // Añadir este método al editar-usuario.component.ts
  getRolBadgeClass(rol: string): string {
    switch (rol) {
      case 'ROLE_ADMINISTRADOR':
        return 'admin';
      case 'ROLE_GERENCIA':
        return 'gerencia';
      case 'ROLE_AUDITOR':
        return 'auditor';
      case 'ROLE_INVENTARIO':
        return 'inventario';
      case 'ROLE_COMPRAS':
        return 'compras';
      case 'ROLE_LOGISTICA':
        return 'logistica';
      case 'ROLE_PRODUCCION':
        return 'prod';
      case 'ROLE_TRABAJADOR':
        return 'work';
      default:
        return 'bg-secondary';
    }
  }

  // Validaciones - Actualizado para verificar también emailError
  isFormValid(): boolean {
    return !!(
      this.formData.nombre.trim() &&
      this.formData.apellido.trim() &&
      this.formData.email.trim() &&
      this.formData.roles.length > 0 &&
      !this.emailError
    );
  }

  // Verificar si hubo cambios
  hasChanges(): boolean {
    if (!this.usuario) return false;

    return (
      this.formData.nombre !== this.usuario.nombre ||
      this.formData.apellido !== this.usuario.apellido ||
      this.formData.email !== this.usuario.email ||
      !this.arraysEqual(this.formData.roles, this.usuario.roles)
    );
  }

  private arraysEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;
    return a.every(val => b.includes(val)) && b.every(val => a.includes(val));
  }

  onSubmit() {
    if (!this.usuario) return;

    if (this.isFormValid()) {
      this.isSubmitting = true;
      // Limpiar errores previos
      this.emailError = null;

      const usuarioActualizado = {
        ...this.usuario,
        nombre: this.formData.nombre.trim(),
        apellido: this.formData.apellido.trim(),
        email: this.formData.email.trim().toLowerCase(),
        roles: this.formData.roles
      };

      this.usuarioService.actualizar(this.usuario.id, usuarioActualizado).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          Swal.fire({
            icon: 'success',
            title: '¡Usuario actualizado!',
            text: `El usuario "${usuarioActualizado.username}" ha sido actualizado exitosamente`,
            timer: 2000,
            showConfirmButton: false
          });

          // Emitir evento de usuario actualizado
          this.usuarioActualizado.emit(response);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error al actualizar usuario:', error);

          // Manejar error específico de email duplicado
          if (error.error && error.error.message) {
            const errorMsg = error.error.message;

            if (errorMsg.includes('correo electrónico ya está en uso')) {
              this.emailError = 'El correo electrónico ya está registrado';
            } else {
              // Otros errores
              Swal.fire({
                icon: 'error',
                title: 'Error al actualizar usuario',
                text: errorMsg
              });
            }
          } else {
            // Error genérico
            Swal.fire({
              icon: 'error',
              title: 'Error al actualizar usuario',
              text: 'No se pudo actualizar el usuario'
            });
          }
        }
      });
    } else {
      console.error('Por favor complete todos los campos requeridos correctamente');
    }
  }

  onCancel() {
    this.cancelar.emit();
  }

  // Obtener nombre completo para mostrar
  getNombreCompleto(): string {
    if (!this.usuario) return '';
    return `${this.usuario.nombre} ${this.usuario.apellido}`.trim();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Si el usuario cambia, actualizar los datos
    if (changes['usuario'] && this.usuario) {
      this.cargarDatosUsuario();
    }
  }
}