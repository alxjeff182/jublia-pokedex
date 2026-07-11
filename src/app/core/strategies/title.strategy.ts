import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { formatPokemonName } from '../models/pokemon.model';
import { LanguageService } from '../services/language.service';
import { SeoService } from '../services/seo.service';

@Injectable({ providedIn: 'root' })
export class AppTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly lang = inject(LanguageService);
  private readonly seo = inject(SeoService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.lang.locale();

    const route = this.getLeafRoute(snapshot);
    const path = route.routeConfig?.path ?? '';
    const slug = route.paramMap.get('slug') ?? undefined;

    const pageTitle = this.resolveTitle(path, route.data['title'] as string | undefined, slug)
      ?? this.lang.t('titles.app');
    const baseTitle = this.lang.t('titles.app');
    const fullTitle = pageTitle.includes(baseTitle)
      ? pageTitle
      : `${baseTitle} — ${pageTitle}`;

    this.title.setTitle(fullTitle);
    this.seo.setJsonLd(null);
    this.seo.updateTags({
      title: fullTitle,
      description: this.lang.translateDescription(path, slug),
      url: this.resolveCanonicalUrl(path, slug),
    });
    this.seo.updateCanonical(this.resolveCanonicalUrl(path, slug));
  }

  private getLeafRoute(snapshot: RouterStateSnapshot) {
    let route = snapshot.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }

  private resolveTitle(
    path: string,
    dataTitle: string | undefined,
    slug?: string,
  ): string | undefined {
    if (dataTitle) {
      return this.translateRouteTitle(dataTitle);
    }

    if (path === 'pokemon/:slug') {
      return slug ? formatPokemonName(slug) : this.lang.t('titles.pokemon');
    }

    return this.lang.translateTitle(path, slug);
  }

  private resolveCanonicalUrl(path: string, slug?: string): string {
    if (path === 'pokemon/:slug' && slug) {
      return this.seo.buildUrl(`/pokemon/${slug}`);
    }

    const routePaths: Record<string, string> = {
      '': '/',
      browse: '/browse',
      favorites: '/favorites',
      settings: '/settings',
      compare: '/compare',
      splash: '/splash',
    };

    return this.seo.buildUrl(routePaths[path] ?? '/');
  }

  private translateRouteTitle(title: string): string {
    const map: Record<string, string> = {
      Loading: 'titles.splash',
      Home: 'titles.home',
      Browse: 'titles.browse',
      Favorites: 'titles.favorites',
      Settings: 'titles.settings',
      Compare: 'titles.compare',
    };
    const key = map[title];
    return key ? this.lang.t(key) : title;
  }
}
