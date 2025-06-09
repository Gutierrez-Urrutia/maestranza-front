import { Component, EventEmitter, Output, Input, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageService } from '../../../services/imagen/image.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-agregar-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agregar-form.component.html',
  styleUrl: './agregar-form.component.css'
})
export class AgregarFormComponent {
  @Output() formSubmit = new EventEmitter<any>();
  @Output() formCancel = new EventEmitter<void>();
  @Input() categorias: any[] = [];

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // Modelo del formulario
  formData = {
    codigo: '',
    nombre: '',
    categoriaId: '',
    stock: 0,
    precio: 0,
    imageUrl: ''
  };

  imagePreview: string | null = null;
  isProcessingImage = false;

  async onSubmit() {
    // Validar que los campos requeridos estén llenos
    if (this.formData.codigo && this.formData.nombre && this.formData.categoriaId) {
      // Convertir categoriaId a número antes de enviar
      const formDataToSubmit = {
        ...this.formData,
        categoriaId: parseInt(this.formData.categoriaId, 10)
      };
      this.formSubmit.emit(formDataToSubmit);
      this.resetForm();
    } else {
      console.error('Por favor complete todos los campos requeridos');
    }
  }

  selectFile() {
    this.fileInput.nativeElement.click();
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar que es una imagen
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          icon: 'error',
          title: 'Archivo inválido',
          text: 'Por favor seleccione un archivo de imagen válido',
          confirmButtonText: 'Entendido'
        });
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'Archivo muy grande',
          text: 'La imagen no puede ser mayor a 5MB',
          confirmButtonText: 'Entendido'
        });
        return;
      }

      await this.processImage(file);
    }
  }

  // ...existing code...

  async openCamera() {
    try {
      this.isProcessingImage = true;

      // Mostrar la interfaz de cámara con SweetAlert
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      Swal.fire({
        title: 'Tomar Fotografía',
        html: `
          <div style="position: relative;">
            <video id="cameraVideo" autoplay playsinline style="width: 100%; max-width: 400px; border-radius: 8px;"></video>
            <canvas id="cameraCanvas" style="display: none;"></canvas>
          </div>
          <div style="margin-top: 15px;">
            <button type="button" id="captureBtn" class="btn btn-primary me-2">
              <i class="bi bi-camera"></i> Capturar
            </button>
            <button type="button" id="retakeBtn" class="btn btn-warning me-2" style="display: none;">
              <i class="bi bi-arrow-clockwise"></i> Tomar otra
            </button>
            <button type="button" id="switchCameraBtn" class="btn btn-secondary">
              <i class="bi bi-arrow-repeat"></i> Cambiar cámara
            </button>
          </div>
        `,
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: '<i class="bi bi-check"></i> Usar esta foto',
        cancelButtonText: '<i class="bi bi-x"></i> Cancelar',
        width: '500px',
        allowOutsideClick: false,
        allowEscapeKey: true,
        customClass: {
          popup: 'camera-modal'
        },
        didOpen: () => {
          this.setupCameraInterface(stream);
        },
        willClose: () => {
          // Detener la cámara al cerrar
          stream.getTracks().forEach(track => track.stop());
        }
      }).then(async (result) => {
        if (result.isConfirmed) {
          // El usuario confirmó usar la foto
          const canvas = document.getElementById('cameraCanvas') as HTMLCanvasElement;
          if (canvas) {
            canvas.toBlob(async (blob) => {
              if (blob) {
                try {
                  // Crear un File object desde el blob para usar saveImageFromFile
                  const filename = `product_${Date.now()}.jpg`;
                  const file = new File([blob], filename, { type: 'image/jpeg' });

                  // Usar el método público saveImageFromFile
                  const savedFilename = await ImageService.saveImageFromFile(file);

                  this.formData.imageUrl = savedFilename;
                  const imageData = ImageService.getImageFromStorage(savedFilename);
                  this.imagePreview = imageData;

                  Swal.fire({
                    icon: 'success',
                    title: '¡Imagen guardada!',
                    text: 'La fotografía se ha guardado correctamente',
                    timer: 2000,
                    showConfirmButton: false
                  });
                } catch (error) {
                  console.error('Error al guardar imagen:', error);
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo guardar la imagen',
                    confirmButtonText: 'Entendido'
                  });
                }
              }
            }, 'image/jpeg', 0.8);
          }
        } else {
          // El usuario canceló - limpiar cualquier imagen temporal
          this.removeImage();
        }
        // Detener todos los tracks de la cámara
        stream.getTracks().forEach(track => track.stop());
      });

    } catch (error) {
      console.error('Error al acceder a la cámara:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error al acceder a la cámara',
        text: 'No se pudo acceder a la cámara. Verifique los permisos.',
        confirmButtonText: 'Entendido'
      });
    } finally {
      this.isProcessingImage = false;
    }
  }

  private setupCameraInterface(stream: MediaStream) {
    const video = document.getElementById('cameraVideo') as HTMLVideoElement;
    const canvas = document.getElementById('cameraCanvas') as HTMLCanvasElement;
    const captureBtn = document.getElementById('captureBtn') as HTMLButtonElement;
    const retakeBtn = document.getElementById('retakeBtn') as HTMLButtonElement;
    const switchCameraBtn = document.getElementById('switchCameraBtn') as HTMLButtonElement;

    if (!video || !canvas || !captureBtn) return;

    // Configurar video
    video.srcObject = stream;
    video.play();

    let currentFacingMode = 'environment';
    let capturedPhoto = false;

    // Configurar canvas cuando el video esté listo
    video.addEventListener('loadedmetadata', () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    });

    // Evento para capturar foto
    captureBtn.addEventListener('click', async () => {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Añadir efecto flash
        video.classList.add('camera-flash');
        setTimeout(() => video.classList.remove('camera-flash'), 300);

        // Dibujar el frame actual del video en el canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Crear imagen desde el canvas y mostrarla
        const imageData = canvas.toDataURL('image/jpeg', 0.8);

        // Reemplazar el video con la imagen capturada
        video.style.display = 'none';

        // Crear elemento img para mostrar la foto capturada
        const capturedImg = document.createElement('img');
        capturedImg.id = 'capturedImage';
        capturedImg.src = imageData;
        capturedImg.style.cssText = 'width: 100%; max-width: 400px; border-radius: 8px;';

        // Insertar la imagen después del video
        video.parentNode?.insertBefore(capturedImg, video.nextSibling);

        // Mostrar botón de retomar y ocultar capturar
        captureBtn.style.display = 'none';
        retakeBtn.style.display = 'inline-block';
        switchCameraBtn.style.display = 'none';

        capturedPhoto = true;

        // Habilitar el botón de confirmar de SweetAlert
        const confirmBtn = document.querySelector('.swal2-confirm') as HTMLButtonElement;
        if (confirmBtn) {
          confirmBtn.disabled = false;
          confirmBtn.style.opacity = '1';
        }

        // *** AQUÍ ESTÁ LA CORRECCIÓN PRINCIPAL ***
        // Guardar temporalmente la imagen para mostrarla inmediatamente
        try {
          canvas.toBlob(async (blob) => {
            if (blob) {
              const tempFilename = `temp_${Date.now()}.jpg`;
              const file = new File([blob], tempFilename, { type: 'image/jpeg' });
              await ImageService.saveImageFromFile(file);

              // Actualizar la previsualización inmediatamente
              this.formData.imageUrl = tempFilename;
              const tempImageData = ImageService.getImageFromStorage(tempFilename);
              this.imagePreview = tempImageData;
            }
          }, 'image/jpeg', 0.8);
        } catch (error) {
          console.error('Error al procesar imagen temporal:', error);
        }
      }
    });

    // Evento para retomar foto
    retakeBtn?.addEventListener('click', () => {
      // Remover imagen capturada si existe
      const capturedImg = document.getElementById('capturedImage');
      if (capturedImg) {
        capturedImg.remove();
      }

      // Limpiar imagen temporal
      this.removeImage();

      // Mostrar video nuevamente
      video.style.display = 'block';

      // Restaurar botones
      captureBtn.style.display = 'inline-block';
      retakeBtn.style.display = 'none';
      switchCameraBtn.style.display = 'inline-block';

      capturedPhoto = false;

      // Deshabilitar botón de confirmar
      const confirmBtn = document.querySelector('.swal2-confirm') as HTMLButtonElement;
      if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.style.opacity = '0.5';
      }
    });

    // Evento para cambiar cámara (frontal/trasera)
    switchCameraBtn?.addEventListener('click', async () => {
      try {
        // Detener stream actual
        stream.getTracks().forEach(track => track.stop());

        // Cambiar modo de cámara
        currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';

        // Obtener nuevo stream
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: currentFacingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        // Actualizar video con nuevo stream
        video.srcObject = newStream;

      } catch (error) {
        console.error('Error al cambiar cámara:', error);
        Swal.showValidationMessage('No se pudo cambiar la cámara');
      }
    });

    // Deshabilitar botón de confirmar inicialmente
    const confirmBtn = document.querySelector('.swal2-confirm') as HTMLButtonElement;
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.style.opacity = '0.5';
    }
  }

  // *** MÉTODO CORREGIDO PARA LIMPIAR IMÁGENES ***
  removeImage() {
    // Limpiar imagen de localStorage si existe
    if (this.formData.imageUrl) {
      try {
        localStorage.removeItem(`image_${this.formData.imageUrl}`);
      } catch (error) {
        console.warn('No se pudo limpiar imagen del localStorage:', error);
      }
    }

    this.imagePreview = null;
    this.formData.imageUrl = '';

    // Limpiar el input file
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // *** MÉTODO CORREGIDO PARA LIMPIAR AL CANCELAR ***
  onCancel() {
    this.resetForm();
    this.formCancel.emit();
  }

  private resetForm() {
    // Limpiar imagen de localStorage antes de resetear
    if (this.formData.imageUrl) {
      try {
        localStorage.removeItem(`image_${this.formData.imageUrl}`);
      } catch (error) {
        console.warn('No se pudo limpiar imagen del localStorage:', error);
      }
    }

    this.formData = {
      codigo: '',
      nombre: '',
      categoriaId: '',
      stock: 0,
      precio: 0,
      imageUrl: ''
    };
    this.imagePreview = null;
    this.isProcessingImage = false;

    // Limpiar el input file
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  private async processImage(file: File) {
    try {
      this.isProcessingImage = true;

      Swal.fire({
        title: 'Guardando imagen...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const filename = await ImageService.saveImageFromFile(file);
      this.formData.imageUrl = filename;

      // Obtener la imagen para previsualización
      const imageData = ImageService.getImageFromStorage(filename);
      this.imagePreview = imageData;

      Swal.fire({
        icon: 'success',
        title: '¡Imagen guardada!',
        text: 'La imagen se ha guardado correctamente',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error al procesar imagen:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error al guardar imagen',
        text: 'No se pudo guardar la imagen. Intente nuevamente.',
        confirmButtonText: 'Entendido'
      });
    } finally {
      this.isProcessingImage = false;
    }
  }
}