import { CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { ScreenHeaderComponent } from './screen-header.component';
import { LanguageService } from '../../../core/services/language.service';
import { ThemeService } from '../../../core/services/theme.service';

describe('ScreenHeaderComponent', () => {
  let fixture: ComponentFixture<ScreenHeaderComponent>;
  let component: ScreenHeaderComponent;
  let router: jasmine.SpyObj<Router>;
  let location: jasmine.SpyObj<Location>;

  let language: jasmine.SpyObj<LanguageService>;
  let theme: jasmine.SpyObj<ThemeService>;

  beforeEach(async () => {
    router = jasmine.createSpyObj('Router', ['navigateByUrl']);
    location = jasmine.createSpyObj('Location', ['back']);
    theme = jasmine.createSpyObj('ThemeService', ['toggleDarkMode']);
    Object.defineProperty(theme, 'isDark', { value: signal(false) });
    theme.toggleDarkMode.and.resolveTo();
    language = jasmine.createSpyObj('LanguageService', ['setLocale', 't']);
    Object.defineProperty(language, 'locale', { value: signal('en') });
    language.setLocale.and.resolveTo();
    language.t.and.callFake((key: string) => key);

    await TestBed.configureTestingModule({
      imports: [ScreenHeaderComponent],
      providers: [
        { provide: Router, useValue: router },
        { provide: Location, useValue: location },
        { provide: ThemeService, useValue: theme },
        { provide: LanguageService, useValue: language },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ScreenHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('detects back button when backHref is set', () => {
    component.backHref = '/';
    expect(component.hasBack).toBeTrue();
  });

  it('detects brand variant', () => {
    component.variant = 'brand';
    expect(component.isBrand).toBeTrue();
  });

  it('emits backClick when observed', () => {
    spyOn(component.backClick, 'emit');
    spyOnProperty(component.backClick, 'observed', 'get').and.returnValue(true);
    component.onBackClick();
    expect(component.backClick.emit).toHaveBeenCalled();
    expect(location.back).not.toHaveBeenCalled();
  });

  it('navigates to pokeballHref by default', () => {
    component.onPokeballClick();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('uses browser history when backHref is set', () => {
    component.backHref = '/';
    Object.defineProperty(window.history, 'length', { configurable: true, value: 2 });
    component.onBackClick();
    expect(location.back).toHaveBeenCalled();
  });

  it('renders default toolbar title left-aligned when provided', () => {
    component.title = 'Compare Pokémon';
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('.toolbar-title');
    expect(title?.textContent?.trim()).toBe('Compare Pokémon');
  });

  it('renders overlay title when provided', () => {
    component.variant = 'overlay';
    component.title = 'Pikachu';
    component.showBack = true;
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('.overlay-nav__title');
    expect(title?.textContent?.trim()).toBe('Pikachu');
  });

  it('renders overlay theme and language switches', () => {
    component.variant = 'overlay';
    component.title = 'Ivysaur';
    component.showBack = true;
    component.rightIcon = 'share-outline';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.lang-switch--overlay')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-theme-pill-toggle')).toBeTruthy();
  });

  it('renders default header switches together', () => {
    component.title = 'Favorites';
    fixture.detectChanges();

    const switches = fixture.nativeElement.querySelector('.header-end-switches');
    expect(switches).toBeTruthy();
    expect(switches.querySelector('.lang-switch')).toBeTruthy();
    expect(switches.querySelector('app-theme-pill-toggle')).toBeTruthy();
  });

  it('detects overlay variant and end actions', () => {
    component.variant = 'overlay';
    component.rightIcon = 'share-outline';
    expect(component.isOverlay).toBeTrue();
    expect(component.hasEndAction).toBeTrue();
  });

  it('emits pokeball click when handler is observed', () => {
    spyOn(component.pokeballClick, 'emit');
    spyOnProperty(component.pokeballClick, 'observed', 'get').and.returnValue(true);
    component.onPokeballClick();
    expect(component.pokeballClick.emit).toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('navigates to backHref when history is empty', () => {
    component.backHref = '/';
    Object.defineProperty(window.history, 'length', { configurable: true, value: 1 });
    component.onBackClick();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('updates locale from header switch', async () => {
    await component.setLocale('id');
    expect(language.setLocale).toHaveBeenCalledWith('id');
  });
});
