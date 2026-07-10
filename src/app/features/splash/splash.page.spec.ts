import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SplashPage } from './splash.page';

describe('SplashPage', () => {
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    router = jasmine.createSpyObj('Router', ['navigateByUrl']);
    router.navigateByUrl.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [SplashPage],
      providers: [{ provide: Router, useValue: router }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  it('creates the splash page', () => {
    const fixture = TestBed.createComponent(SplashPage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('navigates to home after bootstrap delay', fakeAsync(() => {
    const fixture = TestBed.createComponent(SplashPage);
    fixture.detectChanges();
    tick(1800);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/tabs/home', {
      replaceUrl: true,
    });
  }));
});
