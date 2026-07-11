import { signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { SplashPage } from './splash.page';

describe('SplashPage', () => {
  let router: jasmine.SpyObj<Router>;
  let language: jasmine.SpyObj<LanguageService>;

  beforeEach(async () => {
    router = jasmine.createSpyObj('Router', ['navigateByUrl']);
    router.navigateByUrl.and.returnValue(Promise.resolve(true));

    language = jasmine.createSpyObj('LanguageService', ['t']);
    Object.defineProperty(language, 'locale', { value: signal('en') });
    language.t.and.callFake((key: string) => key);

    await TestBed.configureTestingModule({
      imports: [SplashPage],
      providers: [
        { provide: Router, useValue: router },
        { provide: LanguageService, useValue: language },
      ],
    }).compileComponents();
  });

  it('creates the splash page', () => {
    const fixture = TestBed.createComponent(SplashPage);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('.splash-deco').length).toBe(4);
    expect(fixture.nativeElement.querySelectorAll('.splash-aura').length).toBe(3);
    expect(fixture.nativeElement.querySelector('.splash-hero__ball')).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('.splash-hero__ball')?.getAttribute('src'),
    ).toContain('assets/icon/pokeball.png');
  });

  it('navigates to home after bootstrap delay', fakeAsync(() => {
    const fixture = TestBed.createComponent(SplashPage);
    fixture.detectChanges();
    tick(1800);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/', {
      replaceUrl: true,
      state: { fromSplash: true },
    });
  }));
});
