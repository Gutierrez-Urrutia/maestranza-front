import { Injectable } from '@angular/core';
import { AuthService } from '../login/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(private authService: AuthService) {
    // Solo configurar timer de inactividad, sin eventos de cierre
    this.setupInactivityTimer();
  }

  private setupInactivityTimer(): void {
    let inactivityTimer: any;
    const INACTIVITY_TIME = 30 * 60 * 1000; // 30 minutos

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        console.log('⏰ Sesión expirada por inactividad');
        this.authService.logout();
        // Redirigir al login si es necesario
        window.location.href = '/login';
      }, INACTIVITY_TIME);
    };

    // Eventos que resetean el timer
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    resetTimer(); // Iniciar timer
  }

  // Método público para limpiar la sesión manualmente
  public clearSession(): void {
    console.log('🧹 Limpiando sesión manualmente');
    this.authService.logout();
  }

  // Método para obtener información de la sesión
  public getSessionInfo(): any {
    return {
      hasToken: !!sessionStorage.getItem('token'),
      user: sessionStorage.getItem('user')
    };
  }
}