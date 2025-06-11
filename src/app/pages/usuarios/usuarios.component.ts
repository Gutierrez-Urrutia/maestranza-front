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
import { Usuario } from '../../interfaces/Usuario'
import Swal from 'sweetalert2';

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
    MatTooltipModule
  ]
})
export class UsuariosComponent implements AfterViewInit, OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  displayedColumns: string[] = ['nombre', 'email', 'rol', 'estado', 'fechaCreacion', 'ultimoAcceso', 'acciones'];
  dataSource = new MatTableDataSource<Usuario>();

  tipoModal: 'agregar' | 'editar' = 'agregar';
  usuarioSeleccionado: Usuario | null = null;

  modalConfig = {
    title: 'Agregar Usuario',
    icon: 'bi-person-plus',
    iconColor: 'text-primary'
  };

  usuarios: Usuario[] = [];

  opcionesRol: string[] = [
    'Todos',
    'Administrador',
    'Usuario',
    'Supervisor'
  ];

  opcionesEstado: string[] = [
    'Todos',
    'Activos',
    'Inactivos'
  ];

  rolSeleccionado: string = 'Todos';
  estadoSeleccionado: string = 'Todos';

  ngOnInit() {
    this.cargarUsuarios();
  }

  private cargarUsuarios() {
    // Aquí deberías llamar a tu servicio de usuarios
    // this.usuarioService.obtenerUsuarios().subscribe({...})
    
    // Datos de ejemplo mientras implementas el servicio
    this.usuarios = [
      {
        id: 1,
        nombre: 'Juan Pérez',
        email: 'juan.perez@empresa.com',
        rol: 'Administrador',
        activo: true,
        fechaCreacion: new Date('2024-01-15'),
        ultimoAcceso: new Date('2024-06-10')
      },
      {
        id: 2,
        nombre: 'María González',
        email: 'maria.gonzalez@empresa.com',
        rol: 'Usuario',
        activo: true,
        fechaCreacion: new Date('2024-02-20'),
        ultimoAcceso: new Date('2024-06-09')
      },
      {
        id: 3,
        nombre: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@empresa.com',
        rol: 'Supervisor',
        activo: false,
        fechaCreacion: new Date('2024-03-10'),
        ultimoAcceso: new Date('2024-05-28')
      },
      {
        id: 4,
        nombre: 'Ana Martínez',
        email: 'ana.martinez@empresa.com',
        rol: 'Usuario',
        activo: true,
        fechaCreacion: new Date('2024-04-05'),
        ultimoAcceso: new Date('2024-06-11')
      }
    ];

    this.dataSource.data = this.usuarios;
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
        usuario.rol === this.rolSeleccionado
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

  editarUsuario(usuario: Usuario) {
    this.abrirModal('editar', usuario);
  }

  toggleEstadoUsuario(usuario: Usuario) {
    const accion = usuario.activo ? 'desactivar' : 'activar';
    const nuevoEstado = !usuario.activo;

    Swal.fire({
      title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} usuario?`,
      text: `¿Estás seguro de que quieres ${accion} a "${usuario.nombre}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: nuevoEstado ? '#28a745' : '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Aquí llamarías a tu servicio para cambiar el estado
        usuario.activo = nuevoEstado;
        
        Swal.fire({
          icon: 'success',
          title: '¡Estado actualizado!',
          text: `El usuario "${usuario.nombre}" ha sido ${accion}do`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  eliminarUsuario(usuario: Usuario) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres eliminar al usuario "${usuario.nombre}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        // Aquí llamarías a tu servicio para eliminar el usuario
        this.usuarios = this.usuarios.filter(u => u.id !== usuario.id);
        this.dataSource.data = this.usuarios;

        Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: `El usuario "${usuario.nombre}" ha sido eliminado`,
          timer: 2000,
          showConfirmButton: false
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
        data.email?.toString().toLowerCase() || '',
        data.rol?.toString().toLowerCase() || ''
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
}