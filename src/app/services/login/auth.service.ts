import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginRequest } from '../../interfaces/LoginRequest';
import { LoginResponse } from '../../interfaces/LoginResponse';

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

  logout(): void {
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