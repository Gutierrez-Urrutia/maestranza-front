import { Injectable } from '@angular/core';
import { AuthService } from '../login/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor(private authService: AuthService) { }

  /**
   * Verifica si el usuario tiene permisos para crear elementos
   */
  canCreate(): boolean {
    const user = this.authService.getUser();
    if (!user || !user.roles) return false;
    
    // Admin, Inventario y Logistica pueden crear
    return user.roles.includes('ADMIN') || 
           user.roles.includes('ROLE_ADMINISTRADOR') ||
           user.roles.includes('INVENTARIO') ||
           user.roles.includes('ROLE_INVENTARIO') ||
           user.roles.includes('LOGISTICA') ||
           user.roles.includes('ROLE_LOGISTICA');
  }

  /**
   * Verifica si el usuario tiene permisos para editar elementos
   */
  canEdit(): boolean {
    const user = this.authService.getUser();
    if (!user || !user.roles) return false;
    
    // Admin, Inventario y Logistica pueden editar
    return user.roles.includes('ADMIN') || 
           user.roles.includes('ROLE_ADMINISTRADOR') ||
           user.roles.includes('INVENTARIO') ||
           user.roles.includes('ROLE_INVENTARIO') ||
           user.roles.includes('LOGISTICA') ||
           user.roles.includes('ROLE_LOGISTICA');
  }

  /**
   * Verifica si el usuario tiene permisos para eliminar elementos
   */
  canDelete(): boolean {
    const user = this.authService.getUser();
    if (!user || !user.roles) return false;
    
    // Admin, Inventario y Logistica pueden eliminar
    return user.roles.includes('ADMIN') || 
           user.roles.includes('ROLE_ADMINISTRADOR') ||
           user.roles.includes('INVENTARIO') ||
           user.roles.includes('ROLE_INVENTARIO') ||
           user.roles.includes('LOGISTICA') ||
           user.roles.includes('ROLE_LOGISTICA');
  }

  /**
   * Verifica si el usuario puede ver elementos (lectura)
   */
  canView(): boolean {
    const user = this.authService.getUser();
    if (!user || !user.roles) return false;
    
    // Admin, Gerencia, Auditor, Inventario y Logistica pueden ver
    return user.roles.includes('ADMIN') || 
           user.roles.includes('ROLE_ADMINISTRADOR') || 
           user.roles.includes('GERENCIA') || 
           user.roles.includes('ROLE_GERENCIA') ||
           user.roles.includes('AUDITOR') ||
           user.roles.includes('ROLE_AUDITOR') ||
           user.roles.includes('INVENTARIO') ||
           user.roles.includes('ROLE_INVENTARIO') ||
           user.roles.includes('LOGISTICA') ||
           user.roles.includes('ROLE_LOGISTICA');
  }

  // ===== PERMISOS ESPECÍFICOS POR MÓDULO =====

  /**
   * Permisos para INVENTARIO
   */
  canCreateInventario(): boolean {
    const user = this.authService.getUser();
    if (!user || !user.roles) return false;
    
    // Admin, Inventario y Logistica pueden crear productos
    return user.roles.includes('ADMIN') || 
           user.roles.includes('ROLE_ADMINISTRADOR') ||
           user.roles.includes('INVENTARIO') ||
           user.roles.includes('ROLE_INVENTARIO') ||
           user.roles.includes('LOGISTICA') ||
           user.roles.includes('ROLE_LOGISTICA');
  }

  canEditInventario(): boolean {
    const user = this.authService.getUser();
    if (!user || !user.roles) return false;
    
    // Admin, Inventario y Logistica pueden editar productos
    return user.roles.includes('ADMIN') || 
           user.roles.includes('ROLE_ADMINISTRADOR') ||
           user.roles.includes('INVENTARIO') ||
           user.roles.includes('ROLE_INVENTARIO') ||
           user.roles.includes('LOGISTICA') ||
           user.roles.includes('ROLE_LOGISTICA');
  }

  canDeleteInventario(): boolean {
    const user = this.authService.getUser();
    if (!user || !user.roles) return false;
    
    // Admin, Inventario y Logistica pueden eliminar productos
    return user.roles.includes('ADMIN') || 
           user.roles.includes('ROLE_ADMINISTRADOR') ||
           user.roles.includes('INVENTARIO') ||
           user.roles.includes('ROLE_INVENTARIO') ||
           user.roles.includes('LOGISTICA') ||
           user.roles.includes('ROLE_LOGISTICA');
  }

  /**
   * Permisos para ALERTAS
   */
  canCreateAlertas(): boolean {
    const user = this.authService.getUser();
    if (!user || !user.roles) return false;
    
    // Admin e Inventario pueden crear alertas
    return user.roles.includes('ADMIN') || 
           user.roles.includes('ROLE_ADMINISTRADOR') ||
           user.roles.includes('INVENTARIO') ||
           user.roles.includes('ROLE_INVENTARIO');
  }

  canEditAlertas(): boolean {
    const user = this.authService.getUser();
    if (!user || !user.roles) return false;
    
    // Admin e Inventario pueden editar alertas
    return user.roles.includes('ADMIN') || 
           user.roles.includes('ROLE_ADMINISTRADOR') ||
           user.roles.includes('INVENTARIO') ||
           user.roles.includes('ROLE_INVENTARIO');
  }

  canDeleteAlertas(): boolean {
    const user = this.authService.getUser();
    if (!user || !user.roles) return false;
    
    // Admin e Inventario pueden eliminar alertas
    return user.roles.includes('ADMIN') || 
           user.roles.includes('ROLE_ADMINISTRADOR') ||
           user.roles.includes('INVENTARIO') ||
           user.roles.includes('ROLE_INVENTARIO');
  }

  canManageAlertas(): boolean {
    const user = this.authService.getUser();
    if (!user || !user.roles) return false;
    
    // Admin e Inventario pueden gestionar alertas
    return user.roles.includes('ADMIN') || 
           user.roles.includes('ROLE_ADMINISTRADOR') ||
           user.roles.includes('INVENTARIO') ||
           user.roles.includes('ROLE_INVENTARIO');
  }

  /**
   * Permisos para MOVIMIENTOS
   */
  canCreateMovimientos(): boolean {
    const user = this.authService.getUser();
    if (!user || !user.roles) return false;
    
    // Admin y Logistica pueden crear movimientos, Inventario NO
    return user.roles.includes('ADMIN') || 
           user.roles.includes('ROLE_ADMINISTRADOR') ||
           user.roles.includes('LOGISTICA') ||
           user.roles.includes('ROLE_LOGISTICA');
  }

  canEditMovimientos(): boolean {
    const user = this.authService.getUser();
    if (!user || !user.roles) return false;
    
    // Admin y Logistica pueden editar movimientos, Inventario NO
    return user.roles.includes('ADMIN') || 
           user.roles.includes('ROLE_ADMINISTRADOR') ||
           user.roles.includes('LOGISTICA') ||
           user.roles.includes('ROLE_LOGISTICA');
  }

  canDeleteMovimientos(): boolean {
    const user = this.authService.getUser();
    if (!user || !user.roles) return false;
    
    // Admin y Logistica pueden eliminar movimientos, Inventario NO
    return user.roles.includes('ADMIN') || 
           user.roles.includes('ROLE_ADMINISTRADOR') ||
           user.roles.includes('LOGISTICA') ||
           user.roles.includes('ROLE_LOGISTICA');
  }

  canManageMovimientos(): boolean {
    const user = this.authService.getUser();
    if (!user || !user.roles) return false;
    
    // Admin y Logistica pueden gestionar movimientos, Inventario NO
    return user.roles.includes('ADMIN') || 
           user.roles.includes('ROLE_ADMINISTRADOR') ||
           user.roles.includes('LOGISTICA') ||
           user.roles.includes('ROLE_LOGISTICA');
  }

  /**
   * Verifica si el usuario puede realizar acciones de gestión (crear, editar, eliminar)
   */
  canManage(): boolean {
    return this.canCreate() || this.canEdit() || this.canDelete();
  }

  /**
   * Obtiene el rol principal del usuario (para mostrar en UI)
   */
  getUserMainRole(): string {
    const user = this.authService.getUser();
    if (!user || !user.roles || user.roles.length === 0) return 'SIN_ROL';
    
    // Priorizar Admin sobre otros roles
    if (user.roles.includes('ADMIN') || user.roles.includes('ROLE_ADMINISTRADOR')) return 'ADMIN';
    if (user.roles.includes('GERENCIA') || user.roles.includes('ROLE_GERENCIA')) return 'GERENCIA';
    if (user.roles.includes('AUDITOR') || user.roles.includes('ROLE_AUDITOR')) return 'AUDITOR';
    if (user.roles.includes('INVENTARIO') || user.roles.includes('ROLE_INVENTARIO')) return 'INVENTARIO';
    if (user.roles.includes('LOGISTICA') || user.roles.includes('ROLE_LOGISTICA')) return 'LOGISTICA';
    
    // Retornar el primer rol encontrado
    return user.roles[0];
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }

  /**
   * Verifica si el usuario puede acceder a la gestión de usuarios
   * Solo Admin y Gerencia pueden acceder, Auditor NO
   */
  canAccessUsuarios(): boolean {
    const user = this.authService.getUser();
    if (!user || !user.roles) return false;
    
    // Solo Admin y Gerencia pueden acceder a usuarios
    return user.roles.includes('ADMIN') || 
           user.roles.includes('ROLE_ADMINISTRADOR') || 
           user.roles.includes('GERENCIA') || 
           user.roles.includes('ROLE_GERENCIA');
  }

  /**
   * Obtiene un mensaje descriptivo del nivel de acceso del usuario
   */
  getAccessLevelDescription(): string {
    const mainRole = this.getUserMainRole();
    
    switch (mainRole) {
      case 'ADMIN':
        return 'Acceso completo - Puede ver, crear, editar y eliminar';
      case 'GERENCIA':
        return 'Solo lectura - Puede ver toda la información sin realizar cambios';
      case 'AUDITOR':
        return 'Solo lectura - Puede ver información de inventario, movimientos y alertas';
      case 'INVENTARIO':
        return 'Gestión de inventario - Puede gestionar inventario y alertas, solo ver movimientos';
      case 'LOGISTICA':
        return 'Gestión logística - Puede gestionar inventario y movimientos, sin acceso a alertas ni usuarios';
      default:
        return 'Sin acceso definido';
    }
  }
}
