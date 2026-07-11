import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SeoTags {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: string;
}

const BASE_URL = 'https://alxjeff182.github.io/jublia-pokedex';
const DEFAULT_IMAGE = `${BASE_URL}/assets/icon/pokeball.png`;
const JSON_LD_ID = 'jublia-jsonld';
const SITE_NAME = 'My Pokedex by Jublia AI';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly document = inject(DOCUMENT);

  getBaseUrl(): string {
    return BASE_URL;
  }

  buildUrl(path: string): string {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${BASE_URL}${normalized === '/' ? '/' : normalized}`;
  }

  updateTags(tags: SeoTags): void {
    this.title.setTitle(tags.title);

    this.meta.updateTag({ name: 'description', content: tags.description });
    this.meta.updateTag({ property: 'og:title', content: tags.title });
    this.meta.updateTag({ property: 'og:description', content: tags.description });
    this.meta.updateTag({ property: 'og:url', content: tags.url });
    this.meta.updateTag({
      property: 'og:image',
      content: tags.image ?? DEFAULT_IMAGE,
    });
    this.meta.updateTag({ property: 'og:type', content: tags.type ?? 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: tags.title });
    this.meta.updateTag({
      name: 'twitter:description',
      content: tags.description,
    });
    this.meta.updateTag({
      name: 'twitter:image',
      content: tags.image ?? DEFAULT_IMAGE,
    });
  }

  updateCanonical(url: string): void {
    const head = this.document.head;
    let link = this.document.querySelector(
      'link[rel="canonical"]',
    ) as HTMLLinkElement | null;

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }

    link.setAttribute('href', url);
  }

  setJsonLd(data: object | null): void {
    const head = this.document.head;
    const existing = this.document.getElementById(JSON_LD_ID);

    if (data === null) {
      existing?.remove();
      return;
    }

    const script = existing ?? this.document.createElement('script');
    script.id = JSON_LD_ID;
    script.setAttribute('type', 'application/ld+json');
    script.textContent = JSON.stringify(data);

    if (!existing) {
      head.appendChild(script);
    }
  }
}
