import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rol } from '../../interfaces/Rol';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private apiUrl = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) { }

  obtenerTodos(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Rol> {
    return this.http.get<Rol>(`${this.apiUrl}/${id}`);
  }
}