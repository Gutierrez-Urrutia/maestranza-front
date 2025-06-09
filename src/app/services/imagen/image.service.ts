import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  static async saveImageFromCamera(): Promise<string> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      return new Promise((resolve, reject) => {
        video.addEventListener('loadedmetadata', () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(video, 0, 0);

          // Detener el stream
          stream.getTracks().forEach(track => track.stop());

          canvas.toBlob(async (blob) => {
            if (blob) {
              try {
                const filename = `product_${Date.now()}.jpg`;
                const imageUrl = await ImageService.saveImageLocally(blob, filename);
                resolve(imageUrl);
              } catch (error) {
                reject(error);
              }
            } else {
              reject(new Error('Error al capturar imagen'));
            }
          }, 'image/jpeg', 0.8);
        });
      });
    } catch (error) {
      throw new Error('Error al acceder a la cámara: ' + error);
    }
  }

  static async saveImageFromFile(file: File): Promise<string> {
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen');
    }

    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `product_${Date.now()}.${extension}`;
    return await ImageService.saveImageLocally(file, filename);
  }

  public static async saveImageLocally(blob: Blob, filename: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        try {
          // Guardar en localStorage con el nombre del archivo como clave
          localStorage.setItem(`image_${filename}`, reader.result as string);

          // Retornar el nombre del archivo como identificador
          resolve(filename);
        } catch (error) {
          reject(new Error('Error al guardar imagen localmente: ' + error));
        }
      };

      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsDataURL(blob);
    });
  }

  // Método para obtener imagen desde localStorage
  static getImageFromStorage(filename: string): string | null {
    try {
      return localStorage.getItem(`image_${filename}`);
    } catch {
      return null;
    }
  }

  // Método para verificar si una imagen existe
  static async checkImageExists(imageUrl: string): Promise<boolean> {
    // Si es un nombre de archivo, buscar en localStorage
    if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
      return !!ImageService.getImageFromStorage(imageUrl);
    }

    try {
      const response = await fetch(imageUrl, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Método para limpiar imágenes antiguas del localStorage (opcional)
  static cleanOldImages(daysOld: number = 7): void {
    const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);

    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('image_product_')) {
        const timestamp = key.match(/product_(\d+)/)?.[1];
        if (timestamp && parseInt(timestamp) < cutoffTime) {
          localStorage.removeItem(key);
        }
      }
    }
  }
}