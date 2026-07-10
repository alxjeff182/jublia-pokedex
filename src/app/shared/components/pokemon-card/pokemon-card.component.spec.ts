import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { PokemonCardComponent } from './pokemon-card.component';
import { FavoritesService } from '../../../core/services/favorites.service';
import { HapticsService } from '../../../core/services/haptics.service';
import { PokemonCardData } from '../../../core/models/pokemon.model';

describe('PokemonCardComponent', () => {
  let fixture: ComponentFixture<PokemonCardComponent>;
  let component: PokemonCardComponent;
  let favorites: jasmine.SpyObj<FavoritesService>;
  let haptics: jasmine.SpyObj<HapticsService>;
  let router: jasmine.SpyObj<Router>;

  const pokemon: PokemonCardData = {
    id: 25,
    name: 'pikachu',
    sprite: 'pikachu.png',
    types: ['electric'],
  };

  beforeEach(async () => {
    favorites = jasmine.createSpyObj('FavoritesService', ['isFavorite', 'toggleFavorite']);
    favorites.isFavorite.and.returnValue(false);
    favorites.toggleFavorite.and.resolveTo();
    haptics = jasmine.createSpyObj('HapticsService', ['lightImpact']);
    haptics.lightImpact.and.resolveTo();
    router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [PokemonCardComponent],
      providers: [
        { provide: FavoritesService, useValue: favorites },
        { provide: HapticsService, useValue: haptics },
        { provide: Router, useValue: router },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonCardComponent);
    component = fixture.componentInstance;
    component.pokemon = pokemon;
    fixture.detectChanges();
  });

  it('formats display name and id', () => {
    expect(component.displayName).toBe('Pikachu');
    expect(component.displayId).toBe('#025');
    expect(component.auraBackground).toContain('radial-gradient');
    expect(component.auraBackgroundOuter).toContain('radial-gradient');
  });

  it('navigates to detail on openDetail', () => {
    component.openDetail(new Event('click'));
    expect(router.navigate).toHaveBeenCalledWith(['/tabs/pokemon', 25]);
  });

  it('emits favoriteToggled when heart is toggled', async () => {
    spyOn(component.favoriteToggled, 'emit');
    const event = new Event('click');
    spyOn(event, 'stopPropagation');
    await component.toggleFavorite(event);
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(favorites.toggleFavorite).toHaveBeenCalledWith(25);
    expect(component.favoriteToggled.emit).toHaveBeenCalledWith(25);
  });

  it('reports favorite state from service', () => {
    favorites.isFavorite.and.returnValue(true);
    expect(component.isFavorite()).toBeTrue();
    favorites.isFavorite.and.returnValue(false);
    expect(component.isFavorite()).toBeFalse();
  });
});
