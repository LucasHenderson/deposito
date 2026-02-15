import { Routes } from '@angular/router';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { MainLayout } from './layouts/main-layout/main-layout';
import { authGuard, loginGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },

        // Rotas de Autenticação
    {
        path: '',
        component: AuthLayout,
        children: [
        {
            path: 'login',
            loadComponent: () => import('./pages/login/login').then((m) => m.Login),
            canActivate: [loginGuard],
        },
        ],
    },

      // Rotas Principais
    {
        path: '',
        component: MainLayout,
        children: [
        {
            path: 'painel-principal',
            loadComponent: () => import('./pages/painel-principal/painel-principal').then((m) => m.PainelPrincipal),
            canActivate: [authGuard],
        },
        {
            path: 'vendas',
            loadComponent: () => import('./pages/vendas/vendas').then((m) => m.Vendas),
            canActivate: [authGuard],
        },
        {
            path: 'adiantamento-salarial',
            loadComponent: () => import('./pages/adiantamento-salarial/adiantamento-salarial').then((m) => m.AdiantamentoSalarial),
            canActivate: [authGuard],
        },
        {
            path: 'clientes',
            loadComponent: () => import('./pages/clientes/clientes').then((m) => m.Clientes),
            canActivate: [authGuard],
        },
        {
            path: 'enderecos',
            loadComponent: () => import('./pages/enderecos/enderecos').then((m) => m.Enderecos),
            canActivate: [authGuard],
        },
        {
            path: 'produtos',
            loadComponent: () => import('./pages/produtos/produtos').then((m) => m.Produtos),
            canActivate: [authGuard],
        },
        {
            path: 'entregadores',
            loadComponent: () => import('./pages/entregadores/entregadores').then((m) => m.Entregadores),
            canActivate: [authGuard],
        }
    ]
    },

    { path: '**', redirectTo: 'login' }
];
