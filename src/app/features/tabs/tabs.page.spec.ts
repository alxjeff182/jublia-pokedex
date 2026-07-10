import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TabsPage } from './tabs.page';
import { FavoritesService } from '../../core/services/favorites.service';
import { HapticsService } from '../../core/services/haptics.service';

describe('TabsPage', () => {
  let fixture: ComponentFixture<TabsPage>;
  let component: TabsPage;
  let favorites: jasmine.SpyObj<FavoritesService>;
  let haptics: jasmine.SpyObj<HapticsService>;

  beforeEach(async () => {
    favorites = jasmine.createSpyObj('FavoritesService', ['getFavoriteIds']);
    favorites.getFavoriteIds.and.returnValue([1, 25]);
    haptics = jasmine.createSpyObj('HapticsService', ['selectionChanged']);
    haptics.selectionChanged.and.resolveTo();

    await TestBed.configureTestingModule({
      imports: [TabsPage],
      providers: [
        provideRouter([]),
        { provide: FavoritesService, useValue: favorites },
        { provide: HapticsService, useValue: haptics },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TabsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the tabs shell', () => {
    expect(component).toBeTruthy();
  });

  it('exposes favorite count', () => {
    expect(component.favoriteCount()).toBe(2);
  });

  it('triggers haptics on tab change', () => {
    component.onTabChange();
    expect(haptics.selectionChanged).toHaveBeenCalled();
  });
});
