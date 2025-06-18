import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CloudinaryService } from '../../services/cloudinary/cloudinary.service';
import { CloudinaryServiceSimple } from '../../services/cloudinary/cloudinary-simple.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cloudinary-test',
  template: `
    <div class="container mt-4">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h5>🧪 Prueba de Cloudinary</h5>
            </div>
            <div class="card-body">
              <!-- Selector de archivo -->
              <div class="mb-3">
                <label for="testFile" class="form-label">Seleccionar imagen de prueba:</label>
                <input 
                  type="file" 
                  class="form-control" 
                  id="testFile"
                  accept="image/*"
                  (change)="onFileSelected($event)"
                  [disabled]="isUploading">
              </div>

              <!-- Preview de imagen -->
              <div class="mb-3" *ngIf="previewUrl">
                <label class="form-label">Vista previa:</label>
                <div class="text-center">
                  <img [src]="previewUrl" alt="Preview" class="img-thumbnail" style="max-height: 200px;">
                </div>
              </div>              <!-- Botones de subida -->
              <div class="mb-3">
                <button 
                  class="btn btn-primary w-100 mb-2"
                  [disabled]="!selectedFile || isUploading"
                  (click)="uploadToCloudinary()">
                  <span *ngIf="isUploading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isUploading ? 'Subiendo...' : 'Subir con Preset' }}
                </button>
                
                <button 
                  class="btn btn-secondary w-100"
                  [disabled]="!selectedFile || isUploading"
                  (click)="uploadWithoutPreset()">
                  <span *ngIf="isUploading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isUploading ? 'Subiendo...' : 'Probar Sin Preset' }}
                </button>
              </div>

              <!-- Resultado -->
              <div *ngIf="uploadedUrl" class="alert alert-success">
                <h6>✅ ¡Imagen subida exitosamente!</h6>
                <p class="mb-1"><strong>URL:</strong></p>
                <a [href]="uploadedUrl" target="_blank" class="text-break">{{ uploadedUrl }}</a>
              </div>

              <!-- Error -->
              <div *ngIf="errorMessage" class="alert alert-danger">
                <h6>❌ Error al subir imagen</h6>
                <p class="mb-0">{{ errorMessage }}</p>
              </div>

              <!-- Imagen subida -->
              <div *ngIf="uploadedUrl" class="text-center mt-3">
                <label class="form-label">Imagen en Cloudinary:</label>
                <div>
                  <img [src]="uploadedUrl" alt="Uploaded" class="img-thumbnail" style="max-height: 200px;">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CloudinaryTestComponent {
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isUploading = false;
  uploadedUrl: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private cloudinaryService: CloudinaryService,
    private cloudinaryServiceSimple: CloudinaryServiceSimple
  ) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.uploadedUrl = null;
      this.errorMessage = null;

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }
  async uploadToCloudinary() {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.errorMessage = null;
    this.uploadedUrl = null;

    try {
      // Usar el servicio simplificado primero
      const url = await this.cloudinaryServiceSimple.uploadImageSimple(this.selectedFile);
      console.log('✅ Imagen subida exitosamente:', url);
      this.uploadedUrl = url;
      this.isUploading = false;
    } catch (error: any) {
      console.error('❌ Error al subir imagen:', error);
      this.errorMessage = error.message || 'Error desconocido al subir imagen';
      this.isUploading = false;
    }
  }

  async uploadWithoutPreset() {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.errorMessage = null;
    this.uploadedUrl = null;

    try {
      // Probar sin preset
      const url = await this.cloudinaryServiceSimple.uploadImageWithoutPreset(this.selectedFile);
      console.log('✅ Imagen subida exitosamente (sin preset):', url);
      this.uploadedUrl = url;
      this.isUploading = false;
    } catch (error: any) {
      console.error('❌ Error al subir imagen (sin preset):', error);
      this.errorMessage = error.message || 'Error desconocido al subir imagen';
      this.isUploading = false;
    }
  }
}
