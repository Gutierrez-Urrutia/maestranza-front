import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../../interfaces/Producto';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private readonly apiUrl = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient) { }

  // Obtener todos los productos
  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  // Obtener producto por ID
  obtenerProductoPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  // Crear un nuevo producto
  crearProducto(producto: Partial<Producto>): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto);
  }

  // Actualizar un producto existente
  actualizarProducto(id: number, producto: Partial<Producto>): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto);
  }

  // Eliminar un producto
  eliminarProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Método adicional: Buscar productos por código
  buscarProductoPorCodigo(codigo: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/codigo/${codigo}`);
  }

  // Método adicional: Obtener productos por categoría
  obtenerProductosPorCategoria(categoriaId: number): Observable<Producto[]> {
    const params = new HttpParams().set('categoria', categoriaId.toString());
    return this.http.get<Producto[]>(this.apiUrl, { params });
  }

  // Método adicional: Obtener productos con stock bajo
  obtenerProductosStockBajo(limite: number = 10): Observable<Producto[]> {
    const params = new HttpParams().set('stockBajo', limite.toString());
    return this.http.get<Producto[]>(`${this.apiUrl}/stock-bajo`, { params });
  }
}