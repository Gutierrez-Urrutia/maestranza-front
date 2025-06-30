import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
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

  // ViewChild para acceder a elementos del DOM
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fileInput') fileInputElement!: ElementRef<HTMLInputElement>;

  // Propiedades para el formulario
  isSubmitting = false;
  imagenPreview: string | null = null;
  archivoSeleccionado: File | null = null;
  productosDisponibles: Producto[] = [];
  productoSeleccionado: Producto | null = null;

  // Propiedades para la cámara
  mostrarCamara = false;
  stream: MediaStream | null = null;

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
    // Cerrar cámara si está abierta
    this.cerrarCamara();
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
    
    // Cerrar cámara si está abierta
    this.cerrarCamara();
    
    // Limpiar el input file
    if (this.fileInputElement?.nativeElement) {
      this.fileInputElement.nativeElement.value = '';
    }
  }

  // ========== MÉTODOS PARA CÁMARA ==========

  // Método para abrir selector de archivo
  abrirSelectorArchivo() {
    this.cerrarCamara(); // Cerrar cámara si está abierta
    if (this.fileInputElement?.nativeElement) {
      this.fileInputElement.nativeElement.click();
    }
  }

  // Método para abrir la cámara
  async abrirCamara() {
    try {
      // Verificar si el navegador soporta getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        Swal.fire({
          icon: 'error',
          title: 'Cámara no soportada',
          text: 'Su navegador no soporta el acceso a la cámara'
        });
        return;
      }

      // Solicitar acceso a la cámara
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Preferir cámara trasera en móviles
        },
        audio: false
      });

      // Mostrar el video
      this.mostrarCamara = true;
      this.cdr.detectChanges();

      // Asignar stream al elemento video
      if (this.videoElement?.nativeElement) {
        this.videoElement.nativeElement.srcObject = this.stream;
      }

    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      
      let mensaje = 'No se pudo acceder a la cámara';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          mensaje = 'Acceso a la cámara denegado. Por favor, permite el acceso en tu navegador.';
        } else if (error.name === 'NotFoundError') {
          mensaje = 'No se encontró ninguna cámara en el dispositivo.';
        } else if (error.name === 'NotReadableError') {
          mensaje = 'La cámara está siendo usada por otra aplicación.';
        }
      }

      Swal.fire({
        icon: 'error',
        title: 'Error de cámara',
        text: mensaje
      });
    }
  }

  // Método para capturar foto
  capturarFoto() {
    if (!this.videoElement?.nativeElement || !this.canvasElement?.nativeElement) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se puede acceder a los elementos de video o canvas'
      });
      return;
    }

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    if (!context) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se puede obtener el contexto del canvas'
      });
      return;
    }

    // Configurar tamaño del canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Dibujar frame actual del video en el canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convertir canvas a blob
    canvas.toBlob((blob) => {
      if (blob) {
        // Crear archivo desde blob
        const timestamp = new Date().getTime();
        const file = new File([blob], `camera-photo-${timestamp}.jpg`, {
          type: 'image/jpeg',
          lastModified: timestamp
        });

        // Asignar archivo y crear preview
        this.archivoSeleccionado = file;
        this.imagenPreview = canvas.toDataURL('image/jpeg', 0.8);

        // Cerrar cámara
        this.cerrarCamara();

        // Mostrar mensaje de éxito
        Swal.fire({
          icon: 'success',
          title: '¡Foto capturada!',
          text: 'La foto se ha capturado correctamente',
          timer: 1500,
          showConfirmButton: false
        });

      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo procesar la imagen capturada'
        });
      }
    }, 'image/jpeg', 0.8); // Calidad del 80%
  }

  // Método para cerrar la cámara
  cerrarCamara() {
    if (this.stream) {
      // Detener todos los tracks del stream
      this.stream.getTracks().forEach(track => {
        track.stop();
      });
      this.stream = null;
    }

    this.mostrarCamara = false;
    this.cdr.detectChanges();
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

    // Validar stock suficiente para movimientos de salida
    if (formData.tipo === 'SALIDA') {
      const cantidadSolicitada = Number(formData.cantidad);
      const stockDisponible = this.productoSeleccionado?.stock ?? 0;

      if (cantidadSolicitada > stockDisponible) {
        Swal.fire({
          icon: 'warning',
          title: 'Stock insuficiente',
          text: `Solo hay ${stockDisponible} unidades disponibles. No puede retirar ${cantidadSolicitada}.`
        });
        this.isSubmitting = false;
        return; // Cancelar creación del movimiento
      }
    }

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
