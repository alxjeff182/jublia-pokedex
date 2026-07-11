import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BrowsePage } from './browse.page';

describe('BrowsePage', () => {
  let fixture: ComponentFixture<BrowsePage>;
  let component: BrowsePage;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    router.navigate.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [BrowsePage],
      providers: [{ provide: Router, useValue: router }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(BrowsePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates and lists pokemon types', () => {
    expect(component).toBeTruthy();
    expect(component.types.length).toBeGreaterThan(0);
    expect(component.typeColor('fire')).toContain('#');
  });

  it('navigates to home with type filter', fakeAsync(() => {
    component.openType('water');
    expect(component.pressedType()).toBe('water');
    tick(160);
    expect(router.navigate).toHaveBeenCalledWith(['/'], {
      queryParams: { type: 'water' },
    });
    expect(component.pressedType()).toBeNull();
  }));
});
