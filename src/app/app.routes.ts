import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
    },
    { path: 'inventario', loadComponent: () => import('./pages/inventario/inventario.component').then(m => m.InventarioComponent) },
    { path: 'movimientos', loadComponent: () => import('./pages/movimientos/movimientos.component').then(m => m.MovimientosComponent) },
    { path: 'alertas', loadComponent: () => import('./pages/alertas/alertas.component').then(m => m.AlertasComponent) },
    { path: 'usuarios', loadComponent: () => import('./pages/usuarios/usuarios.component').then(m => m.UsuariosComponent) },
    { path: '', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
    {
        path: '**',
        redirectTo: '/login'
    }
]