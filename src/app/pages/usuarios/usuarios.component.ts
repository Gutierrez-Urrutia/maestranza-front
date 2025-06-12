import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FooterComponent } from '../../components/footer/footer.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Usuario } from '../../interfaces/Usuario';
import { Rol } from '../../interfaces/Rol';
import Swal from 'sweetalert2';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { RolService } from '../../services/rol/rol.service';
import { forkJoin } from 'rxjs';
import { AgregarUsuarioComponent } from '../../components/forms/agregar-usuario/agregar-usuario.component';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FooterComponent,
    ModalComponent,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    AgregarUsuarioComponent
  ]
})
export class UsuariosComponent implements AfterViewInit, OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  displayedColumns: string[] = ['nombre', 'username', 'email', 'roles', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<Usuario>();

  tipoModal: 'agregar' | 'editar' = 'agregar';
  usuarioSeleccionado: Usuario | null = null;

  modalConfig = {
    title: 'Agregar Usuario',
    icon: 'bi-person-plus',
    iconColor: 'text-primary'
  };

  usuarios: Usuario[] = [];
  roles: Rol[] = [];
  isLoading = false;

  // Opciones de rol dinámicas desde el backend
  opcionesRol: string[] = ['Todos'];

  opcionesEstado: string[] = [
    'Todos',
    'Activos',
    'Inactivos'
  ];

  rolSeleccionado: string = 'Todos';
  estadoSeleccionado: string = 'Todos';

  constructor(
    private usuarioService: UsuarioService,
    private rolService: RolService
  ) { }

  ngOnInit() {
    this.cargarDatos();
  }

  private cargarDatos() {
    this.isLoading = true;

    // Cargar usuarios y roles en paralelo
    forkJoin({
      usuarios: this.usuarioService.obtenerTodos(),
      roles: this.rolService.obtenerTodos()
    }).subscribe({
      next: ({ usuarios, roles }) => {
        console.log('Usuarios cargados:', usuarios);
        console.log('Roles cargados:', roles);

        this.usuarios = usuarios;
        this.roles = roles;
        this.dataSource.data = usuarios;

        // Actualizar opciones de rol con los datos del backend
        this.opcionesRol = ['Todos', ...roles.map(rol => rol.nombre)];

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar datos:', error);
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los datos'
        });
      }
    });
  }

  // Método helper para obtener iniciales
  getIniciales(usuario: Usuario): string {
    const primeraNombre = usuario.nombre.charAt(0).toUpperCase();
    const primeraApellido = usuario.apellido.charAt(0).toUpperCase();
    return primeraNombre + primeraApellido;
  }

  // Método helper para obtener nombres completos
  getNombreCompleto(usuario: Usuario): string {
    return `${usuario.nombre} ${usuario.apellido}`.trim();
  }

  // Método helper para obtener roles como string
  getRolesString(usuario: Usuario): string {
    return usuario.roles.join(', ');
  }

  // Método helper para filtrar por rol
  private usuarioTieneRol(usuario: Usuario, rolBuscado: string): boolean {
    return usuario.roles.includes(rolBuscado);
  }

  // Método helper para obtener la clase CSS del badge según el rol
  getRolBadgeClass(rol: string): string {
    switch (rol) {
      case 'ROLE_ADMINISTRADOR':
        return 'bg-danger';
      case 'ROLE_GERENCIA':
        return 'bg-dark';
      case 'ROLE_AUDITOR':
        return 'bg-warning text-dark';
      case 'ROLE_INVENTARIO':
        return 'bg-primary';
      case 'ROLE_COMPRAS':
        return 'bg-success';
      case 'ROLE_LOGISTICA':
        return 'bg-info';
      case 'ROLE_PRODUCCION':
        return 'bg-secondary';
      case 'ROLE_TRABAJADOR':
        return 'bg-light text-dark';
      default:
        return 'bg-secondary';
    }
  }

  // Método helper para obtener nombre de rol más legible
  getRolDisplayName(rol: string): string {
    switch (rol) {
      case 'Todos':
        return 'Todos';
      case 'ROLE_ADMINISTRADOR':
        return 'Administrador';
      case 'ROLE_INVENTARIO':
        return 'Inventario';
      case 'ROLE_COMPRAS':
        return 'Compras';
      case 'ROLE_LOGISTICA':
        return 'Logística';
      case 'ROLE_PRODUCCION':
        return 'Producción';
      case 'ROLE_AUDITOR':
        return 'Auditor';
      case 'ROLE_GERENCIA':
        return 'Gerencia';
      case 'ROLE_TRABAJADOR':
        return 'Trabajador';
      default:
        return rol.replace('ROLE_', '');
    }
  }

  seleccionarRol(rol: string): void {
    this.rolSeleccionado = rol;
    this.aplicarFiltros();
  }

  seleccionarEstado(estado: string): void {
    this.estadoSeleccionado = estado;
    this.aplicarFiltros();
  }

  private aplicarFiltros() {
    let usuariosFiltrados = [...this.usuarios];

    // Filtrar por rol
    if (this.rolSeleccionado !== 'Todos') {
      usuariosFiltrados = usuariosFiltrados.filter(usuario =>
        this.usuarioTieneRol(usuario, this.rolSeleccionado)
      );
    }

    // Filtrar por estado
    if (this.estadoSeleccionado === 'Activos') {
      usuariosFiltrados = usuariosFiltrados.filter(usuario => usuario.activo);
    } else if (this.estadoSeleccionado === 'Inactivos') {
      usuariosFiltrados = usuariosFiltrados.filter(usuario => !usuario.activo);
    }

    this.dataSource.data = usuariosFiltrados;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  abrirModal(tipo: 'agregar' | 'editar', usuario?: Usuario) {
    this.tipoModal = tipo;
    this.usuarioSeleccionado = usuario || null;
    this.configurarModal(tipo);
  }

  private configurarModal(tipo: 'agregar' | 'editar') {
    switch (tipo) {
      case 'agregar':
        this.modalConfig = {
          title: 'Agregar Usuario',
          icon: 'bi-person-plus',
          iconColor: 'text-primary'
        };
        break;
      case 'editar':
        this.modalConfig = {
          title: 'Editar Usuario',
          icon: 'bi-person-gear',
          iconColor: 'text-warning'
        };
        break;
    }
  }

  editarUsuario(usuario: Usuario) {
    this.abrirModal('editar', usuario);
  }

  toggleEstadoUsuario(usuario: Usuario) {
    const accion = usuario.activo ? 'desactivar' : 'activar';

    Swal.fire({
      title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} usuario?`,
      text: `¿Estás seguro de que quieres ${accion} a "${this.getNombreCompleto(usuario)}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: !usuario.activo ? '#28a745' : '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        if (usuario.activo) {
          // Desactivar usuario
          this.usuarioService.desactivar(usuario.id).subscribe({
            next: (usuarioActualizado) => {
              usuario.activo = false;
              Swal.fire({
                icon: 'success',
                title: '¡Usuario desactivado!',
                text: `El usuario "${this.getNombreCompleto(usuario)}" ha sido desactivado`,
                timer: 2000,
                showConfirmButton: false
              });
            },
            error: (error) => {
              console.error('Error al desactivar usuario:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo desactivar el usuario'
              });
            }
          });
        } else {
          // Activar usuario
          this.usuarioService.activar(usuario.id).subscribe({
            next: (usuarioActualizado) => {
              usuario.activo = true;
              Swal.fire({
                icon: 'success',
                title: '¡Usuario activado!',
                text: `El usuario "${this.getNombreCompleto(usuario)}" ha sido activado`,
                timer: 2000,
                showConfirmButton: false
              });
            },
            error: (error) => {
              console.error('Error al activar usuario:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo activar el usuario'
              });
            }
          });
        }
      }
    });
  }

  eliminarUsuario(usuario: Usuario) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres eliminar al usuario "${this.getNombreCompleto(usuario)}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuarioService.eliminar(usuario.id).subscribe({
          next: () => {
            this.usuarios = this.usuarios.filter(u => u.id !== usuario.id);
            this.dataSource.data = this.usuarios;

            Swal.fire({
              icon: 'success',
              title: '¡Eliminado!',
              text: `El usuario "${this.getNombreCompleto(usuario)}" ha sido eliminado`,
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (error) => {
            console.error('Error al eliminar usuario:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar el usuario'
            });
          }
        });
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Personalizar la función de filtro
    this.dataSource.filterPredicate = (data: Usuario, filter: string) => {
      const searchTerm = filter.toLowerCase();

      const searchableFields = [
        data.nombre?.toString().toLowerCase() || '',
        data.apellido?.toString().toLowerCase() || '',
        data.username?.toString().toLowerCase() || '',
        data.email?.toString().toLowerCase() || '',
        this.getRolesString(data).toLowerCase() || ''
      ];

      return searchableFields.some(field => field.includes(searchTerm));
    };

    // Configurar textos del paginador en español
    if (this.paginator) {
      this.paginator._intl.itemsPerPageLabel = 'Elementos por página:';
      this.paginator._intl.nextPageLabel = 'Página siguiente';
      this.paginator._intl.previousPageLabel = 'Página anterior';
      this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
        if (length === 0 || pageSize === 0) {
          return `0 de ${length}`;
        }
        const startIndex = page * pageSize;
        const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
        return `${startIndex + 1} - ${endIndex} de ${length}`;
      };
      this.paginator._intl.changes.next();
    }
  }

  onUsuarioCreado(usuario: Usuario) {
    // Recargar la lista de usuarios
    this.cargarDatos();

    // Cerrar el modal
    const modalElement = document.getElementById('modalUsuario');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  onCancelarModal() {
    // Cerrar el modal
    const modalElement = document.getElementById('modalUsuario');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }
}