import { Routes } from '@angular/router';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { MainLayout } from './layouts/main-layout/main-layout';

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
        },
        {
            path: 'recebimentos-pendentes',
            loadComponent: () => import('./pages/recebimentos-pendentes/recebimentos-pendentes').then((m) => m.RecebimentosPendentes),
        },
        {
            path: 'adiantamento-salarial',
            loadComponent: () => import('./pages/adiantamento-salarial/adiantamento-salarial').then((m) => m.AdiantamentoSalarial),
        },
        {
            path: 'clientes',
            loadComponent: () => import('./pages/clientes/clientes').then((m) => m.Clientes),
        },
        {
            path: 'produtos',
            loadComponent: () => import('./pages/produtos/produtos').then((m) => m.Produtos),
        },
        {
            path: 'entregadores',
            loadComponent: () => import('./pages/entregadores/entregadores').then((m) => m.Entregadores),
        }
    ]
    }, 

    { path: '**', redirectTo: 'login' }
];
