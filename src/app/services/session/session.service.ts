import { Injectable } from '@angular/core';
import { AuthService } from '../login/auth.service';


@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(private authService: AuthService) {
    this.initializeSessionHandlers();
  }

  private initializeSessionHandlers(): void {
    // Generar ID único de sesión
    const sessionId = this.generateSessionId();
    sessionStorage.setItem('sessionId', sessionId);

    // Detectar cuando se cierra la pestaña/navegador
    window.addEventListener('beforeunload', () => {
      console.log('🚪 Cerrando pestaña/navegador - Invalidando sesión');
      this.invalidateSession();
    });

    // Detectar cuando se recarga la página
    window.addEventListener('load', () => {
      this.checkSessionValidity();
    });

    // Opcional: Detectar inactividad prolongada
    this.setupInactivityTimer();
  }

  private generateSessionId(): string {
    return Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
  }

  private invalidateSession(): void {
    // Marcar sesión como cerrada
    localStorage.setItem('sessionClosed', 'true');
    sessionStorage.clear();
  }

  private checkSessionValidity(): void {
    const sessionClosed = localStorage.getItem('sessionClosed');
    const sessionId = sessionStorage.getItem('sessionId');

    if (sessionClosed === 'true' || !sessionId) {
      console.log('🚫 Sesión inválida detectada - Cerrando sesión');
      this.authService.logout();
      localStorage.removeItem('sessionClosed');
    }
  }

  private setupInactivityTimer(): void {
    let inactivityTimer: any;
    const INACTIVITY_TIME = 30 * 60 * 1000; // 30 minutos

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        console.log('⏰ Sesión expirada por inactividad');
        this.authService.logout();
      }, INACTIVITY_TIME);
    };

    // Eventos que resetean el timer
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    resetTimer(); // Iniciar timer
  }
}