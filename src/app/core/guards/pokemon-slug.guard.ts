import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';
import { isValidPokemonSlug, toPokemonSlug } from '../models/pokemon.model';

export const pokemonSlugGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const toastController = inject(ToastController);
  const raw = route.paramMap.get('slug') ?? '';
  const slug = toPokemonSlug(raw);

  if (!slug || !isValidPokemonSlug(slug)) {
    void toastController
      .create({
        message: 'Invalid Pokémon name',
        duration: 2500,
        color: 'warning',
        position: 'bottom',
      })
      .then((toast) => toast.present());
    return router.createUrlTree(['/']);
  }

  return true;
};
