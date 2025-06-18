import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Movimiento, TipoMovimiento } from '../../interfaces/Movimiento';

@Injectable({
  providedIn: 'root'
})
export class MovimientoService {
  private apiUrl = `${environment.apiUrl}/movimientos`;

  constructor(private http: HttpClient) { }

  obtenerTodos(): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Movimiento> {
    return this.http.get<Movimiento>(`${this.apiUrl}/${id}`);
  }

  registrarMovimiento(movimiento: Partial<Movimiento>): Observable<Movimiento> {
    return this.http.post<Movimiento>(this.apiUrl, movimiento);
  }

  registrarEntrada(productoId: number, cantidad: number, descripcion?: string): Observable<Movimiento> {
    return this.http.post<Movimiento>(`${this.apiUrl}/entrada`, {
      productoId,
      cantidad,
      descripcion
    });
  }

  registrarSalida(productoId: number, cantidad: number, descripcion?: string): Observable<Movimiento> {
    return this.http.post<Movimiento>(`${this.apiUrl}/salida`, {
      productoId,
      cantidad,
      descripcion
    });
  }

  // Métodos para filtrado
  obtenerPorTipo(tipo: TipoMovimiento): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(`${this.apiUrl}/tipo/${tipo}`);
  }

  obtenerPorProducto(productoId: number): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(`${this.apiUrl}/producto/${productoId}`);
  }

  obtenerPorFecha(fechaInicio: string, fechaFin: string): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(`${this.apiUrl}/fecha`, {
      params: { fechaInicio, fechaFin }
    });
  }
}
