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

    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        this.tokenSubject.next(savedToken);
        this.userSubject.next(userData);
        console.log('✅ Sesión cargada desde sessionStorage:', userData);
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

    console.log('URL:', `${this.baseUrl}/login`);
    console.log('Credenciales enviadas:', credentials);

    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials, { headers })
      .pipe(
        tap(response => {
          console.log('🔍 RESPUESTA COMPLETA DEL SERVIDOR:', response);
          console.log('🔍 response.nombre:', response.nombre);
          console.log('🔍 response.apellido:', response.apellido);
          console.log('🔍 Tipo de response.nombre:', typeof response.nombre);
          console.log('🔍 Tipo de response.apellido:', typeof response.apellido);

          // Verificar todas las propiedades del objeto response
          console.log('🔍 Todas las propiedades de response:', Object.keys(response));

          if (response.token) {
            const fullToken = `${response.type} ${response.token}`;

            // Crear objeto de usuario verificando cada campo
            const userData = {
              id: response.id,
              username: response.username,
              email: response.email,
              roles: response.roles,
              nombre: response.nombre,
              apellido: response.apellido
            };

            console.log('📝 OBJETO userData ANTES DE GUARDAR:', userData);
            console.log('📝 userData.nombre:', userData.nombre);
            console.log('📝 userData.apellido:', userData.apellido);

            // Guardar en sessionStorage
            sessionStorage.setItem('token', fullToken);
            sessionStorage.setItem('user', JSON.stringify(userData));

            // Verificar que se guardó correctamente
            const savedUserString = sessionStorage.getItem('user');
            const savedUserParsed = JSON.parse(savedUserString!);
            console.log('🔍 USUARIO GUARDADO EN SESSIONSTORAGE (string):', savedUserString);
            console.log('🔍 USUARIO GUARDADO EN SESSIONSTORAGE (parsed):', savedUserParsed);

            // Actualizar BehaviorSubjects
            this.tokenSubject.next(fullToken);
            this.userSubject.next(userData);

            console.log('✅ BehaviorSubject actualizado con:', userData);

            // Verificar inmediatamente después de establecer
            setTimeout(() => {
              const currentUser = this.userSubject.value;
              console.log('🔍 VERIFICACIÓN INMEDIATA - Usuario actual:', currentUser);
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
    const user = this.userSubject.value;
    console.log('🔍 getUser() devuelve:', user);
    return user;
  }

  hasRole(role: string): boolean {
    const user = this.userSubject.value;
    return user?.roles?.includes(role) || false;
  }

  // Método helper para obtener el nombre completo
  getNombreCompleto(): string {
    const user = this.getUser();
    console.log('🔍 getNombreCompleto() - Usuario:', user);

    if (!user) {
      console.log('❌ No hay usuario para obtener nombre completo');
      return '';
    }

    console.log('📝 Nombre:', user.nombre);
    console.log('📝 Apellido:', user.apellido);

    if (user.nombre && user.apellido) {
      const nombreCompleto = `${user.nombre} ${user.apellido}`;
      console.log('✅ Nombre completo generado:', nombreCompleto);
      return nombreCompleto;
    }

    if (user.nombre) {
      console.log('✅ Solo nombre disponible:', user.nombre);
      return user.nombre;
    }

    console.log('⚠️ Usando username como fallback:', user.username);
    return user.username || '';
  }
}