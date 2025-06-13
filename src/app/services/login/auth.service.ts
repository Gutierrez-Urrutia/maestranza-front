import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { LoginRequest } from '../../interfaces/LoginRequest';
import { LoginResponse } from '../../interfaces/LoginResponse';
import { RegistroUsuario } from '../../interfaces/RegistroUsuario';

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
    // Cambiar localStorage por sessionStorage
    const savedToken = sessionStorage.getItem('token');
    const savedUser = sessionStorage.getItem('user');

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

            // Usar sessionStorage en lugar de localStorage
            sessionStorage.setItem('token', fullToken);
            sessionStorage.setItem('user', JSON.stringify({
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

  isTokenValid(): Observable<boolean> {
    const token = this.getToken();

    if (!token) {
      console.log('❌ No hay token para validar');
      return of(false);
    }

    console.log('🔍 Validando token con el servidor...');

    const headers = new HttpHeaders({
      'Authorization': token,
      'Content-Type': 'application/json'
    });

    return this.http.get(`${this.baseUrl}/verify`, { headers }).pipe(
      map((response: any) => {
        console.log('✅ Token válido:', response);
        return true;
      }),
      catchError((error) => {
        console.error('❌ Token inválido:', error.status, error.message);

        if (error.status === 401 || error.status === 403) {
          console.log('🧹 Limpiando sesión por token inválido...');
          this.logout();
        }

        return of(false);
      })
    );
  }

  isAuthenticated(validateWithServer: boolean = false): Observable<boolean> | boolean {
    const hasToken = !!this.tokenSubject.value;

    if (!hasToken) {
      console.log('❌ No hay token local');
      return false;
    }

    if (!validateWithServer) {
      console.log('✅ Token local encontrado (sin validación de servidor)');
      return true;
    }

    console.log('🔍 Validando token con servidor...');
    return this.isTokenValid();
  }

  registro(usuario: RegistroUsuario): Observable<any> {
    return this.http.post(`${this.baseUrl}/registro`, usuario);
  }

  logoutFromServer(): Observable<any> {
    const token = this.getToken();

    if (!token) {
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
          this.logout();
          return of(null);
        })
      );
  }

  // Cambiar localStorage por sessionStorage
  logout(): void {
    console.log('Limpiando sesión local...');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    this.tokenSubject.next(null);
    this.userSubject.next(null);
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