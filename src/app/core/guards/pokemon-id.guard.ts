import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';

export const pokemonIdGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const toastController = inject(ToastController);
  const raw = route.paramMap.get('id');
  const id = Number(raw);

  if (!raw || !Number.isInteger(id) || id < 1 || id > 1025) {
    void toastController
      .create({
        message: 'Invalid Pokémon ID',
        duration: 2500,
        color: 'warning',
        position: 'bottom',
      })
      .then((toast) => toast.present());
    return router.createUrlTree(['/tabs/home']);
  }

  return true;
};
