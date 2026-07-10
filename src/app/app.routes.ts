import { Routes } from '@angular/router';
import { pokemonIdGuard } from './core/guards/pokemon-id.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full',
  },
  {
    path: 'splash',
    loadComponent: () =>
      import('./features/splash/splash.page').then((m) => m.SplashPage),
    data: { title: 'Loading' },
  },
  {
    path: 'tabs',
    loadComponent: () =>
      import('./features/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./features/pokemon-list/pokemon-list.page').then(
            (m) => m.PokemonListPage,
          ),
        data: { title: 'Home' },
      },
      {
        path: 'browse',
        loadComponent: () =>
          import('./features/browse/browse.page').then((m) => m.BrowsePage),
        data: { title: 'Browse' },
      },
      {
        path: 'favorites',
        loadComponent: () =>
          import('./features/favorites/favorites.page').then(
            (m) => m.FavoritesPage,
          ),
        data: { title: 'Favorites' },
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings.page').then(
            (m) => m.SettingsPage,
          ),
        data: { title: 'Settings' },
      },
      {
        path: 'compare',
        loadComponent: () =>
          import('./features/compare/compare.page').then((m) => m.ComparePage),
        data: { title: 'Compare' },
      },
      {
        path: 'pokemon/:id',
        canActivate: [pokemonIdGuard],
        loadComponent: () =>
          import('./features/pokemon-detail/pokemon-detail.page').then(
            (m) => m.PokemonDetailPage,
          ),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'compare',
    redirectTo: 'tabs/compare',
    pathMatch: 'full',
  },
  {
    path: 'pokemon/:id',
    redirectTo: 'tabs/pokemon/:id',
  },
];
