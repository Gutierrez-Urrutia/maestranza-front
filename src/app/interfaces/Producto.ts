import { Categoria } from './Categoria';
import { HistorialPrecios } from './HistorialPrecios';

export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: Categoria;
  stock: number;
  image_url: string;
  historialPrecios: HistorialPrecios[];
}