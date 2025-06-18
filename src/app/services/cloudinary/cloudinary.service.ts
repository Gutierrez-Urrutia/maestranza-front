import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface CloudinaryResponse {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  width: number;
  height: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private readonly cloudinaryUrl = `https://api.cloudinary.com/v1_1/${environment.cloudinary.cloudName}/image/upload`;

  constructor(private http: HttpClient) { }
  /**
   * Sube una imagen a Cloudinary con compresión automática y conversión a WebP
   * @param file - Archivo de imagen a subir
   * @returns Observable con la URL segura de la imagen subida
   */
  uploadImage(file: File): Observable<string> {
    // Validar que sea un archivo de imagen
    if (!file.type.startsWith('image/')) {
      return throwError(() => new Error('El archivo debe ser una imagen'));
    }

    // Crear FormData para la subida
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', environment.cloudinary.uploadPreset);
    
    // Configuraciones para optimización
    formData.append('quality', 'auto:good'); // Compresión automática
    formData.append('fetch_format', 'auto'); // Formato automático (incluyendo WebP)
    formData.append('flags', 'progressive'); // Carga progresiva
    formData.append('folder', 'movimientos'); // Carpeta específica para movimientos

    // Usar HttpClient sin headers adicionales para evitar CORS
    return this.http.post<CloudinaryResponse>(this.cloudinaryUrl, formData, {
      // No agregar headers de autorización para uploads unsigned
    })
      .pipe(
        map(response => response.secure_url),
        catchError(error => {
          console.error('Error al subir imagen a Cloudinary:', error);
          let errorMessage = 'Error al subir la imagen';
          
          if (error.error && error.error.error && error.error.error.message) {
            errorMessage = error.error.error.message;
          } else if (error.status === 400) {
            errorMessage = 'Formato de imagen no válido o archivo corrupto';
          } else if (error.status === 401) {
            errorMessage = 'Error de autenticación con Cloudinary - Verifica el upload preset';
          } else if (error.status === 413) {
            errorMessage = 'El archivo es demasiado grande';
          } else if (error.status === 0) {
            errorMessage = 'Error de conexión - Verifica tu conexión a internet';
          }
          
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  /**
   * Obtiene la URL optimizada de una imagen de Cloudinary
   * @param publicId - ID público de la imagen en Cloudinary
   * @param transformations - Transformaciones adicionales (opcional)
   * @returns URL optimizada
   */
  getOptimizedImageUrl(publicId: string, transformations: string = 'q_auto,f_auto'): string {
    return `https://res.cloudinary.com/${environment.cloudinary.cloudName}/image/upload/${transformations}/${publicId}`;
  }

  /**
   * Extrae el public_id de una URL de Cloudinary
   * @param url - URL de Cloudinary
   * @returns Public ID o null si no es una URL válida
   */
  extractPublicId(url: string): string | null {
    const match = url.match(/\/v\d+\/(.+)\./);
    return match ? match[1] : null;
  }
}
