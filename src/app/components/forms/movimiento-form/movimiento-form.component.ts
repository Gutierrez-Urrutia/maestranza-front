import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ModalComponent } from '../../modal/modal.component';
import { Producto } from '../../../interfaces/Producto';
import { TipoMovimiento } from '../../../interfaces/Movimiento';
import { ProductoService } from '../../../services/producto/producto.service';
import { AuthService } from '../../../services/login/auth.service';
import { MovimientoService } from '../../../services/movimiento/movimiento.service';
import { CloudinaryServiceSimple } from '../../../services/cloudinary/cloudinary-simple.service';
import { Subject, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-movimiento-form',
  templateUrl: './movimiento-form.component.html',
  styleUrls: ['./movimiento-form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent
  ]
})
export class MovimientoFormComponent implements OnInit, OnDestroy {
  @Input() modalId: string = 'modalMovimiento';
  @Output() movimientoCreado = new EventEmitter<void>();

  // Propiedades para el formulario
  isSubmitting = false;
  imagenPreview: string | null = null;
  archivoSeleccionado: File | null = null;
  productosDisponibles: Producto[] = [];
  productoSeleccionado: Producto | null = null;

  // Subject para manejar la limpieza de subscripciones
  private destroy$ = new Subject<void>();
  constructor(
    private productoService: ProductoService,
    private authService: AuthService,
    private movimientoService: MovimientoService,
    private cloudinaryService: CloudinaryServiceSimple,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.cargarProductos();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  private cargarProductos() {
    this.productoService.obtenerProductos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (productos) => {
          this.productosDisponibles = productos;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al cargar productos:', error);
          Swal.fire({
            icon: 'warning',
            title: 'Error al cargar productos',
            text: 'No se pudieron cargar los productos disponibles',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
          });
        }
      });
  }

  // Método para obtener el nombre completo del usuario actual
  getCurrentUserName(): string {
    return this.authService.getNombreCompleto();
  }

  // Método para manejar la selección de producto por código
  onProductoSeleccionado(codigoProducto: string) {
    if (!codigoProducto) {
      this.productoSeleccionado = null;
      return;
    }

    const producto = this.productosDisponibles.find(p => p.codigo === codigoProducto);
    if (producto) {
      this.productoSeleccionado = producto;
    } else {
      this.productoSeleccionado = null;
    }
  }

  // Método para manejar la selección de archivo
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          icon: 'warning',
          title: 'Archivo no válido',
          text: 'Por favor seleccione solo archivos de imagen (JPG, PNG, etc.)'
        });
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'warning',
          title: 'Archivo muy grande',
          text: 'El archivo debe ser menor a 5MB'
        });
        return;
      }

      this.archivoSeleccionado = file;

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagenPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Método para eliminar la imagen seleccionada
  eliminarImagen() {
    this.archivoSeleccionado = null;
    this.imagenPreview = null;
    
    // Limpiar el input file
    const fileInput = document.getElementById('comprobante') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
  // Método para crear nuevo movimiento
  async onCrearMovimiento(form: NgForm) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      return;
    }

    // Validar que se haya seleccionado un producto
    if (!this.productoSeleccionado) {
      Swal.fire({
        icon: 'warning',
        title: 'Producto requerido',
        text: 'Debe seleccionar un producto para crear el movimiento'
      });
      return;
    }

    this.isSubmitting = true;

    const formData = form.value;

    // Obtener el usuario logueado
    const usuarioLogueado = this.authService.getUser();
    
    if (!usuarioLogueado) {
      Swal.fire({
        icon: 'error',
        title: 'Sesión requerida',
        text: 'Debe iniciar sesión para crear movimientos'
      });
      this.isSubmitting = false;
      return;
    }

    try {
      // 1. Subir imagen a Cloudinary si hay una seleccionada
      let imagePath: string | undefined = undefined;
      
      if (this.archivoSeleccionado) {
        console.log('📤 Subiendo imagen de comprobante...');
        
        // Mostrar progreso de subida
        Swal.fire({
          title: 'Subiendo imagen...',
          text: 'Por favor espere mientras se procesa el comprobante',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });        try {
          imagePath = await this.cloudinaryService.uploadImageOptimized(this.archivoSeleccionado);
          console.log('✅ Imagen subida exitosamente a Cloudinary:', imagePath);
          console.log('🔗 URL que se enviará en image_path:', imagePath);
          Swal.close(); // Cerrar el loading
        } catch (imageError) {
          console.error('❌ Error al subir imagen:', imageError);
          Swal.close();
          
          // Preguntar si continuar sin imagen
          const result = await Swal.fire({
            icon: 'warning',
            title: 'Error al subir imagen',
            text: 'No se pudo subir la imagen del comprobante. ¿Desea continuar sin imagen?',
            showCancelButton: true,
            confirmButtonText: 'Continuar sin imagen',
            cancelButtonText: 'Cancelar'
          });

          if (!result.isConfirmed) {
            this.isSubmitting = false;
            return;
          }
        }
      }      // 2. Crear objeto para enviar al backend
      const movimientoData = {
        usuarioId: usuarioLogueado.id,
        productoId: this.productoSeleccionado.id,
        cantidad: formData.cantidad,
        tipo: formData.tipo as TipoMovimiento,
        descripcion: formData.descripcion || '',
        imagePath: imagePath // Usar camelCase que espera el DTO
      };      console.log('📝 Creando movimiento con datos:', movimientoData);
      console.log('🖼️ imagePath que se enviará:', imagePath);
      console.log('📦 Datos completos del movimiento:', JSON.stringify(movimientoData, null, 2));
      
      // Verificar que la URL no sea undefined
      if (!imagePath) {
        console.warn('⚠️ imagePath es undefined, se creará movimiento sin imagen');
      } else {
        console.log('✅ imagePath válido - URL de Cloudinary confirmada');
      }

      // 3. Llamar al servicio para crear el movimiento
      this.movimientoService.registrarMovimiento(movimientoData)
        .pipe(takeUntil(this.destroy$))        .subscribe({
          next: (movimientoCreado) => {
            console.log('✅ Respuesta del backend:', movimientoCreado);
            console.log('🔍 imagePath en la respuesta:', (movimientoCreado as any).imagePath);
            
            // Limpiar formulario
            form.resetForm();
            this.eliminarImagen();
            this.productoSeleccionado = null;
            this.isSubmitting = false;

            // Cerrar modal
            this.cerrarModal();

            // Emitir evento para notificar al componente padre
            this.movimientoCreado.emit();

            // Mostrar mensaje de éxito
            Swal.fire({
              icon: 'success',
              title: '¡Movimiento creado!',
              text: `El movimiento de ${formData.tipo.toLowerCase()} se registró exitosamente${imagePath ? ' con comprobante' : ''}`,
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (error) => {
            console.error('Error al crear movimiento:', error);
            this.isSubmitting = false;
            
            let mensajeError = 'Ocurrió un error al crear el movimiento';
            if (error.error && error.error.message) {
              mensajeError = error.error.message;
            } else if (error.status === 401) {
              mensajeError = 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.';
            } else if (error.status === 403) {
              mensajeError = 'No tiene permisos para realizar esta acción.';
            } else if (error.status === 400) {
              mensajeError = 'Los datos enviados no son válidos.';
            }

            Swal.fire({
              icon: 'error',
              title: 'Error al crear movimiento',
              text: mensajeError,
              confirmButtonText: 'Entendido'
            });
          }
        });

    } catch (error) {
      console.error('Error general:', error);
      this.isSubmitting = false;
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error inesperado',
        confirmButtonText: 'Entendido'
      });
    }
  }

  // Método helper para cerrar el modal
  private cerrarModal() {
    const modalElement = document.getElementById(this.modalId);
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }
  // Método para resetear el formulario completamente
  resetearFormulario() {
    this.eliminarImagen();
    this.productoSeleccionado = null;
    this.isSubmitting = false;
  }
}
