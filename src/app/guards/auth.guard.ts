import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const rota = route.routeConfig?.path ?? '';

  if (!authService.temAcesso(rota)) {
    router.navigate([authService.getRotaInicial()]);
    return false;
  }

  return true;
};

export const loginGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    router.navigate([authService.getRotaInicial()]);
    return false;
  }

  return true;
};
