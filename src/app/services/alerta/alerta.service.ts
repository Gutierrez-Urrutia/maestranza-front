import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Alerta, NivelUrgencia } from '../../interfaces/Alerta';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AlertaService {
  private apiUrl = `${environment.apiUrl}/alertas`;

  constructor(private http: HttpClient) { }

  obtenerTodas(): Observable<Alerta[]> {
    return this.http.get<Alerta[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Alerta> {
    return this.http.get<Alerta>(`${this.apiUrl}/${id}`);
  }

  obtenerActivas(): Observable<Alerta[]> {
    return this.http.get<Alerta[]>(`${this.apiUrl}/activas`);
  }

  obtenerPorNivelUrgencia(nivel: NivelUrgencia): Observable<Alerta[]> {
    return this.http.get<Alerta[]>(`${this.apiUrl}/urgencia/${nivel}`);
  }

  obtenerPorProducto(productoId: number): Observable<Alerta[]> {
    return this.http.get<Alerta[]>(`${this.apiUrl}/producto/${productoId}`);
  }

  desactivar(id: number): Observable<Alerta> {
    return this.http.patch<Alerta>(`${this.apiUrl}/${id}/desactivar`, {});
  }

  activar(id: number): Observable<Alerta> {
    return this.http.patch<Alerta>(`${this.apiUrl}/${id}/activar`, {});
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}