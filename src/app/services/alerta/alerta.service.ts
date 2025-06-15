import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Alerta, NivelUrgencia } from '../../interfaces/Alerta';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AlertaService {
  private apiUrl = `${environment.apiUrl}/alertas`;

  // Subject para notificar cambios en el contador de alertas activas
  private alertasActivasCountSubject = new BehaviorSubject<number>(0);
  public alertasActivasCount$ = this.alertasActivasCountSubject.asObservable();

  constructor(private http: HttpClient) { }

  obtenerTodas(): Observable<Alerta[]> {
    return this.http.get<Alerta[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Alerta> {
    return this.http.get<Alerta>(`${this.apiUrl}/${id}`);
  }

  obtenerActivas(): Observable<Alerta[]> {
    return this.http.get<Alerta[]>(`${this.apiUrl}/activas`).pipe(
      tap(alertas => {
        // Actualizar contador automáticamente cuando obtenemos alertas activas
        this.alertasActivasCountSubject.next(alertas.length);
      })
    );
  }

  obtenerPorNivelUrgencia(nivel: NivelUrgencia): Observable<Alerta[]> {
    return this.http.get<Alerta[]>(`${this.apiUrl}/urgencia/${nivel}`);
  }

  obtenerPorProducto(productoId: number): Observable<Alerta[]> {
    return this.http.get<Alerta[]>(`${this.apiUrl}/producto/${productoId}`);
  }

  desactivar(id: number): Observable<Alerta> {
    return this.http.patch<Alerta>(`${this.apiUrl}/${id}/desactivar`, {}).pipe(
      tap(() => this.actualizarContadorAlertas())
    );
  }

  activar(id: number): Observable<Alerta> {
    return this.http.patch<Alerta>(`${this.apiUrl}/${id}/activar`, {}).pipe(
      tap(() => this.actualizarContadorAlertas())
    );
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.actualizarContadorAlertas())
    );
  }

  cambiarEstado(id: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/cambiar-estado/${id}`, {}).pipe(
      tap(() => this.actualizarContadorAlertas())
    );
  }

  // Método para actualizar el contador manualmente
  actualizarContadorAlertas(): void {
    this.obtenerActivas().subscribe({
      next: () => {
        console.log('✅ Contador de alertas actualizado');
      },
      error: (error) => {
        console.error('❌ Error al actualizar contador:', error);
        this.alertasActivasCountSubject.next(0);
      }
    });
  }

  // Método para obtener el valor actual del contador
  getContadorActual(): number {
    return this.alertasActivasCountSubject.value;
  }
}