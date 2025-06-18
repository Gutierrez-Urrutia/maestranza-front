import { Producto } from './Producto';
import { Usuario } from './Usuario';

export enum TipoMovimiento {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA'
}

export interface Movimiento {
  id: number;
  fecha: string;
  usuario: Usuario;
  producto: Producto;
  cantidad: number;
  tipo: TipoMovimiento;
  descripcion?: string;
  productoCodigo?: string;
  productoNombre?: string;
  imagePath?: string; // Cambiar a camelCase para coincidir con el backend
}

