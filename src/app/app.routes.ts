import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { UsuariosGuard } from './guards/usuarios.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'inventario', loadComponent: () => import('./pages/inventario/inventario.component').then(m => m.InventarioComponent), canActivate: [AuthGuard] },
    { path: 'movimientos', loadComponent: () => import('./pages/movimientos/movimientos.component').then(m => m.MovimientosComponent), canActivate: [AuthGuard] },
    { path: 'alertas', loadComponent: () => import('./pages/alertas/alertas.component').then(m => m.AlertasComponent), canActivate: [AuthGuard] },
    { path: 'usuarios', loadComponent: () => import('./pages/usuarios/usuarios.component').then(m => m.UsuariosComponent), canActivate: [AuthGuard, UsuariosGuard] },
    { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
    { path: '**', redirectTo: '/login' }
]