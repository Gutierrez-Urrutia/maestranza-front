export interface Alerta {
  id: number;
  nombre: string;
  descripcion: string;
  fecha: string; // Viene como ISO string del backend
  activo: boolean;
  productoId: number;
  productoCodigo: string;
  productoNombre: string;
  productoStock: number;
  productoUmbralStock: number;
  productoUbicacion: string;
  categoriaNombre: string;
  tiempoTranscurrido: string;
  nivelUrgencia: NivelUrgencia;
  resumenCorto: string;
}

export enum NivelUrgencia {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  CRITICA = 'CRITICA'
}

export enum TipoAlerta {
  STOCK_BAJO = 'STOCK_BAJO',
  STOCK_AGOTADO = 'STOCK_AGOTADO',
  PRODUCTO_VENCIDO = 'PRODUCTO_VENCIDO'
}