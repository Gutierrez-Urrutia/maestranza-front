import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CloudinaryServiceSimple {
  /**
   * Versión más básica - solo file y preset
   */
  async uploadImageBasic(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', environment.cloudinary.uploadPreset);
    
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${environment.cloudinary.cloudName}/image/upload`;
    
    try {
      console.log('🚀 Enviando archivo a Cloudinary...');
      console.log('Cloud Name:', environment.cloudinary.cloudName);
      console.log('Upload Preset:', environment.cloudinary.uploadPreset);
      console.log('File:', file.name, file.type, file.size);
      
      const response = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData
      });
      
      console.log('📡 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
        } catch {
          throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }
      }
      
      const data = await response.json();
      console.log('✅ Cloudinary response:', data);
      return data.secure_url;
    } catch (error) {
      console.error('💥 Error en upload:', error);
      throw error;
    }
  }

  /**
   * Versión simplificada usando fetch para evitar interceptores
   */
  async uploadImageSimple(file: File): Promise<string> {
    // Usar la versión más básica primero
    return this.uploadImageBasic(file);
  }

  /**
   * Método de prueba sin preset - para debugging
   */
  async uploadImageWithoutPreset(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Sin preset, usar configuración básica
    formData.append('folder', 'movimientos');
    
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${environment.cloudinary.cloudName}/image/upload`;
    
    try {
      console.log('🚀 Probando subida SIN preset...');
      console.log('Cloud Name:', environment.cloudinary.cloudName);
      console.log('File:', file.name, file.type, file.size);
      
      const response = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData
      });
      
      console.log('📡 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Cloudinary response:', data);
      return data.secure_url;
    } catch (error) {
      console.error('💥 Error en upload:', error);
      throw error;
    }
  }

  /**
   * Versión optimizada para producción con compresión y WebP
   */
  async uploadImageOptimized(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', environment.cloudinary.uploadPreset);
    
    // Configuraciones para optimización
    formData.append('folder', 'movimientos');
    formData.append('quality', 'auto:good'); // Compresión automática
    formData.append('format', 'webp'); // Convertir a WebP para mejor compresión
    
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${environment.cloudinary.cloudName}/image/upload`;
    
    try {
      console.log('🚀 Subiendo imagen optimizada...');
      
      const response = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Error al subir imagen: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Imagen subida y optimizada:', data.secure_url);
      return data.secure_url;
    } catch (error) {
      console.error('💥 Error en upload optimizado:', error);
      // Fallback a versión básica si falla la optimizada
      return this.uploadImageBasic(file);
    }
  }
}
