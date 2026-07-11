import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const splashEntryGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const navigation = router.getCurrentNavigation();

  if (navigation?.extras?.state?.['fromSplash']) {
    return true;
  }

  if (state.url === '/' || state.url === '') {
    return router.createUrlTree(['/splash']);
  }

  return true;
};
