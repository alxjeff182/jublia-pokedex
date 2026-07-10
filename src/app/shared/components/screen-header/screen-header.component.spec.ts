import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { ScreenHeaderComponent } from './screen-header.component';

describe('ScreenHeaderComponent', () => {
  let fixture: ComponentFixture<ScreenHeaderComponent>;
  let component: ScreenHeaderComponent;
  let router: jasmine.SpyObj<Router>;
  let location: jasmine.SpyObj<Location>;

  beforeEach(async () => {
    router = jasmine.createSpyObj('Router', ['navigateByUrl']);
    location = jasmine.createSpyObj('Location', ['back']);

    await TestBed.configureTestingModule({
      imports: [ScreenHeaderComponent],
      providers: [
        { provide: Router, useValue: router },
        { provide: Location, useValue: location },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ScreenHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('detects back button when backHref is set', () => {
    component.backHref = '/tabs/home';
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
    expect(router.navigateByUrl).toHaveBeenCalledWith('/tabs/home');
  });

  it('uses browser history when backHref is set', () => {
    component.backHref = '/tabs/home';
    Object.defineProperty(window.history, 'length', { configurable: true, value: 2 });
    component.onBackClick();
    expect(location.back).toHaveBeenCalled();
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
    component.backHref = '/tabs/home';
    Object.defineProperty(window.history, 'length', { configurable: true, value: 1 });
    component.onBackClick();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/tabs/home');
  });
});
