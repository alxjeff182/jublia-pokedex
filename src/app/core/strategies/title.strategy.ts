import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { formatPokemonName } from '../models/pokemon.model';

@Injectable({ providedIn: 'root' })
export class AppTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly baseTitle = 'JUBLIA Dex';

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.resolveTitle(snapshot) ?? this.baseTitle;
    this.title.setTitle(title.includes(this.baseTitle) ? title : `${this.baseTitle} — ${title}`);
  }

  private resolveTitle(snapshot: RouterStateSnapshot): string | undefined {
    let route = snapshot.root;
    while (route.firstChild) {
      route = route.firstChild;
    }

    const dataTitle = route.data['title'] as string | undefined;
    if (dataTitle) {
      return dataTitle;
    }

    const path = route.routeConfig?.path ?? '';
    if (path === 'pokemon/:id') {
      const id = route.paramMap.get('id');
      return id ? `Pokémon #${id}` : 'Pokémon';
    }

    const titles: Record<string, string> = {
      home: 'Home',
      browse: 'Browse',
      favorites: 'Favorites',
      settings: 'Settings',
      compare: 'Compare',
      splash: 'Loading',
    };

    return titles[path];
  }
}
