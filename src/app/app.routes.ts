import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent),
  },
  {
    path: 'menu',
    loadComponent: () => import('./pages/menu/menu').then(m => m.MenuComponent),
    canActivate: [authGuard],
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then(m => m.AboutComponent),
  },
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth').then(m => m.AuthComponent),
  },
  { path: '**', redirectTo: 'home' },
];