import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../../interfaces/Producto';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private readonly API_URL = 'http://localhost:8090/api/v1/productos';

  constructor(private http: HttpClient) { }

  // Obtener todos los productos
  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.API_URL);
  }

  // Obtener producto por ID
  obtenerProductoPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.API_URL}/${id}`);
  }

  // Crear un nuevo producto
  crearProducto(producto: Partial<Producto>): Observable<Producto> {
    return this.http.post<Producto>(this.API_URL, producto);
  }

  // Actualizar un producto existente
  actualizarProducto(id: number, producto: Partial<Producto>): Observable<Producto> {
    return this.http.put<Producto>(`${this.API_URL}/${id}`, producto);
  }

  // Eliminar un producto
  eliminarProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  // Método adicional: Buscar productos por código
  buscarProductoPorCodigo(codigo: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.API_URL}/codigo/${codigo}`);
  }

  // Método adicional: Obtener productos por categoría
  obtenerProductosPorCategoria(categoriaId: number): Observable<Producto[]> {
    const params = new HttpParams().set('categoria', categoriaId.toString());
    return this.http.get<Producto[]>(this.API_URL, { params });
  }

  // Método adicional: Obtener productos con stock bajo
  obtenerProductosStockBajo(limite: number = 10): Observable<Producto[]> {
    const params = new HttpParams().set('stockBajo', limite.toString());
    return this.http.get<Producto[]>(`${this.API_URL}/stock-bajo`, { params });
  }
}