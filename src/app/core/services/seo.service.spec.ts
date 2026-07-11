import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  let service: SeoService;
  let meta: Meta;
  let title: Title;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeoService);
    meta = TestBed.inject(Meta);
    title = TestBed.inject(Title);
    document.head
      .querySelectorAll('link[rel="canonical"], #jublia-jsonld')
      .forEach((node) => node.remove());
  });

  it('updates meta tags and document title', () => {
    service.updateTags({
      title: 'My Pokedex by Jublia AI — Home',
      description: 'Explore Pokémon',
      url: 'https://alxjeff182.github.io/jublia-pokedex/',
      image: 'https://example.com/image.png',
      type: 'website',
    });

    expect(title.getTitle()).toBe('My Pokedex by Jublia AI — Home');
    expect(meta.getTag('name="description"')?.content).toBe('Explore Pokémon');
    expect(meta.getTag('property="og:title"')?.content).toBe('My Pokedex by Jublia AI — Home');
    expect(meta.getTag('property="og:description"')?.content).toBe(
      'Explore Pokémon',
    );
    expect(meta.getTag('property="og:url"')?.content).toBe(
      'https://alxjeff182.github.io/jublia-pokedex/',
    );
    expect(meta.getTag('property="og:image"')?.content).toBe(
      'https://example.com/image.png',
    );
    expect(meta.getTag('property="og:type"')?.content).toBe('website');
    expect(meta.getTag('property="og:site_name"')?.content).toBe('My Pokedex by Jublia AI');
    expect(meta.getTag('name="twitter:card"')?.content).toBe('summary_large_image');
    expect(meta.getTag('name="twitter:title"')?.content).toBe('My Pokedex by Jublia AI — Home');
    expect(meta.getTag('name="twitter:description"')?.content).toBe(
      'Explore Pokémon',
    );
    expect(meta.getTag('name="twitter:image"')?.content).toBe(
      'https://example.com/image.png',
    );
  });

  it('falls back to default image when image is omitted', () => {
    service.updateTags({
      title: 'My Pokedex by Jublia AI',
      description: 'Default',
      url: 'https://alxjeff182.github.io/jublia-pokedex/',
    });

    expect(meta.getTag('property="og:image"')?.content).toBe(
      'https://alxjeff182.github.io/jublia-pokedex/assets/icon/pokeball.png',
    );
  });

  it('creates and updates canonical link', () => {
    service.updateCanonical('https://alxjeff182.github.io/jublia-pokedex/browse');
    const link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    expect(link?.href).toBe('https://alxjeff182.github.io/jublia-pokedex/browse');

    service.updateCanonical('https://alxjeff182.github.io/jublia-pokedex/');
    expect(link?.href).toBe('https://alxjeff182.github.io/jublia-pokedex/');
  });

  it('injects and replaces JSON-LD script', () => {
    service.setJsonLd({ '@type': 'Thing', name: 'Pikachu' });
    let script = document.getElementById('jublia-jsonld');
    expect(script?.textContent).toBe('{"@type":"Thing","name":"Pikachu"}');

    service.setJsonLd({ '@type': 'Thing', name: 'Raichu' });
    script = document.getElementById('jublia-jsonld');
    expect(script?.textContent).toBe('{"@type":"Thing","name":"Raichu"}');
    expect(document.querySelectorAll('#jublia-jsonld').length).toBe(1);
  });

  it('removes JSON-LD when data is null', () => {
    service.setJsonLd({ '@type': 'Thing', name: 'Pikachu' });
    service.setJsonLd(null);
    expect(document.getElementById('jublia-jsonld')).toBeNull();
  });

  it('builds absolute URLs from paths', () => {
    expect(service.buildUrl('/browse')).toBe(
      'https://alxjeff182.github.io/jublia-pokedex/browse',
    );
    expect(service.buildUrl('/')).toBe('https://alxjeff182.github.io/jublia-pokedex/');
  });
});
