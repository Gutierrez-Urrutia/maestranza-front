import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { LoginRequest } from '../../interfaces/LoginRequest';
import { LoginResponse } from '../../interfaces/LoginResponse';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8090/api/auth';
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private userSubject = new BehaviorSubject<any>(null);

  public token$ = this.tokenSubject.asObservable();
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken) {
      this.tokenSubject.next(savedToken);
    }
    if (savedUser) {
      this.userSubject.next(JSON.parse(savedUser));
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('URL:', `${this.baseUrl}/login`);
    console.log('Credenciales enviadas:', credentials);
    console.log('Headers:', headers);

    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials, { headers })
      .pipe(
        tap(response => {
          console.log('Respuesta del servidor:', response);
          if (response.token) {
            const fullToken = `${response.type} ${response.token}`;
            localStorage.setItem('token', fullToken);
            localStorage.setItem('user', JSON.stringify({
              id: response.id,
              username: response.username,
              email: response.email,
              roles: response.roles
            }));

            this.tokenSubject.next(fullToken);
            this.userSubject.next({
              id: response.id,
              username: response.username,
              email: response.email,
              roles: response.roles
            });
          }
        })
      );
  }

  // Logout con petición HTTP al servidor
  logoutFromServer(): Observable<any> {
    const token = this.getToken();

    if (!token) {
      // Si no hay token, hacer logout local
      this.logout();
      return of(null);
    }

    const headers = new HttpHeaders({
      'Authorization': token,
      'Content-Type': 'application/json'
    });

    console.log('Enviando logout a:', `${this.baseUrl}/logout`);
    console.log('Con token:', token);

    return this.http.post(`${this.baseUrl}/logout`, {}, { headers })
      .pipe(
        tap(() => {
          console.log('Logout exitoso en el servidor');
          this.logout();
        }),
        catchError(error => {
          console.error('Error en logout del servidor:', error);
          // Aunque falle el logout en el servidor, limpiar sesión local
          this.logout();
          return of(null);
        })
      );
  }

  // Logout solo local (sin petición al servidor)
  logout(): void {
    console.log('Limpiando sesión local...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.tokenSubject.next(null);
    this.userSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  getUser(): any {
    return this.userSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.userSubject.value;
    return user?.roles?.includes(role) || false;
  }
}