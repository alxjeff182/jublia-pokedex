import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeService } from '../../../core/services/theme.service';
import { LanguageService } from '../../../core/services/language.service';
import { ThemePillToggleComponent } from './theme-pill-toggle.component';

describe('ThemePillToggleComponent', () => {
  let fixture: ComponentFixture<ThemePillToggleComponent>;
  let theme: jasmine.SpyObj<ThemeService>;

  beforeEach(async () => {
    theme = jasmine.createSpyObj('ThemeService', ['toggleDarkMode']);
    Object.defineProperty(theme, 'isDark', { value: signal(false) });
    theme.toggleDarkMode.and.resolveTo();

    const language = jasmine.createSpyObj('LanguageService', ['t']);
    Object.defineProperty(language, 'locale', { value: signal('en') });
    language.t.and.callFake((key: string) => key);

    await TestBed.configureTestingModule({
      imports: [ThemePillToggleComponent],
      providers: [
        { provide: ThemeService, useValue: theme },
        { provide: LanguageService, useValue: language },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemePillToggleComponent);
    fixture.detectChanges();
  });

  it('renders day mode label when light theme is active', () => {
    const label = fixture.nativeElement.querySelector('.theme-pill__label');
    expect(label?.textContent?.trim()).toBe('header.dayMode');
    expect(fixture.nativeElement.querySelector('.theme-pill--dark')).toBeFalsy();
  });

  it('toggles theme on click', async () => {
    fixture.nativeElement.querySelector('.theme-pill').click();
    await fixture.whenStable();
    expect(theme.toggleDarkMode).toHaveBeenCalled();
  });
});
