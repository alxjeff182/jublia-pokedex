import { Routes } from '@angular/router';
import { pokemonSlugGuard } from './core/guards/pokemon-slug.guard';
import { splashEntryGuard } from './core/guards/splash-entry.guard';

const tabChildren: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/pokemon-list/pokemon-list.page').then(
        (m) => m.PokemonListPage,
      ),
    data: { title: 'Home' },
  },
  {
    path: 'compare',
    loadComponent: () =>
      import('./features/compare/compare.page').then((m) => m.ComparePage),
    data: { title: 'Compare' },
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
    path: 'pokemon/:slug',
    canActivate: [pokemonSlugGuard],
    loadComponent: () =>
      import('./features/pokemon-detail/pokemon-detail.page').then(
        (m) => m.PokemonDetailPage,
      ),
  },
];

export const routes: Routes = [
  {
    path: 'splash',
    loadComponent: () =>
      import('./features/splash/splash.page').then((m) => m.SplashPage),
    data: { title: 'Loading' },
  },
  {
    path: 'tabs',
    children: [
      { path: '', redirectTo: '/', pathMatch: 'full' },
      { path: 'home', redirectTo: '/', pathMatch: 'full' },
      { path: 'browse', redirectTo: '/browse', pathMatch: 'full' },
      { path: 'favorites', redirectTo: '/favorites', pathMatch: 'full' },
      { path: 'settings', redirectTo: '/settings', pathMatch: 'full' },
      { path: 'compare', redirectTo: '/compare', pathMatch: 'full' },
      {
        path: 'pokemon/:slug',
        redirectTo: '/pokemon/:slug',
      },
    ],
  },
  {
    path: '',
    canActivate: [splashEntryGuard],
    loadComponent: () =>
      import('./features/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      ...tabChildren,
      { path: 'home', redirectTo: '', pathMatch: 'full' },
    ],
  },
];
