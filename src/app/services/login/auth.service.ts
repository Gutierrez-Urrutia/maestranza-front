import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
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
    // Solo cargar desde sessionStorage, sin eventos adicionales
    this.loadFromSessionStorage();
  }

  private loadFromSessionStorage() {
    const savedToken = sessionStorage.getItem('token');
    const savedUser = sessionStorage.getItem('user');

    if (savedToken && savedUser) {      try {
        const userData = JSON.parse(savedUser);
        this.tokenSubject.next(savedToken);
        this.userSubject.next(userData);
      } catch (error) {
        console.error('❌ Error al parsear usuario guardado:', error);
        this.logout();
      }
    }
  }
  login(credentials: LoginRequest): Observable<LoginResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials, { headers })      .pipe(
        tap(response => {
          if (response.token) {
            const fullToken = `${response.type} ${response.token}`;

            if (!fullToken.startsWith('Bearer ')) {
              console.error('❌ Token no tiene formato Bearer:', fullToken);
            }
            // Crear objeto de usuario verificando cada campo
            const userData = {
              id: response.id,
              username: response.username,
              email: response.email,
              roles: response.roles,
              nombre: response.nombre,
              apellido: response.apellido
            };

            // Guardar en sessionStorage
            sessionStorage.setItem('token', fullToken);
            sessionStorage.setItem('user', JSON.stringify(userData));

            // Verificar que se guardó correctamente
            const savedUserString = sessionStorage.getItem('user');
            const savedUserParsed = JSON.parse(savedUserString!);

            // Actualizar BehaviorSubjects
            this.tokenSubject.next(fullToken);
            this.userSubject.next(userData);

            // Verificar inmediatamente después de establecer
            setTimeout(() => {
              const currentUser = this.userSubject.value;
            }, 100);
          }
        }),
        catchError(error => {
          console.error('❌ Error en login:', error);
          return throwError(error);
        })
      );
  }
  isTokenValid(): Observable<boolean> {
    const token = this.getToken();

    if (!token) {
      return of(false);
    }

    const headers = new HttpHeaders({
      'Authorization': token,
      'Content-Type': 'application/json'
    });

    return this.http.get(`${this.baseUrl}/verify`, { headers }).pipe(
      map((response: any) => {
        return true;
      }),
      catchError((error) => {
        console.error('❌ Token inválido:', error.status, error.message);

        if (error.status === 401 || error.status === 403) {
          this.logout();
        }

        return of(false);
      })
    );
  }

  isAuthenticated(validateWithServer: boolean = false): Observable<boolean> | boolean {
    const hasToken = !!this.tokenSubject.value;

    if (!hasToken) {
      return false;
    }

    if (!validateWithServer) {
      return true;
    }

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


    return this.http.post(`${this.baseUrl}/logout`, {}, { headers })
      .pipe(
        tap(() => {
          this.logout();
        }),
        catchError(error => {
          console.error('Error en logout del servidor:', error);
          this.logout();
          return of(null);
        })
      );
  }

  logout(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    this.tokenSubject.next(null);
    this.userSubject.next(null);
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  getUser(): any {
    const user = this.userSubject.value;
    return user;
  }

  hasRole(role: string): boolean {
    const user = this.userSubject.value;
    return user?.roles?.includes(role) || false;
  }

  // Método helper para obtener el nombre completo
  getNombreCompleto(): string {
    const user = this.getUser();

    if (!user) {
      return '';
    }


    if (user.nombre && user.apellido) {
      const nombreCompleto = `${user.nombre} ${user.apellido}`;
      return nombreCompleto;
    }

    if (user.nombre) {
      return user.nombre;
    }

    return user.username || '';
  }
}