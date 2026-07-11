import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';
import { pokemonSlugGuard } from './pokemon-slug.guard';

describe('pokemonSlugGuard', () => {
  let router: Router;
  let toastCreate: jasmine.Spy;

  beforeEach(() => {
    toastCreate = jasmine.createSpy('create').and.resolveTo({
      present: jasmine.createSpy('present').and.resolveTo(),
    });

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: ToastController,
          useValue: { create: toastCreate },
        },
      ],
    });

    router = TestBed.inject(Router);
  });

  it('allows valid pokemon slugs', () => {
    const result = TestBed.runInInjectionContext(() =>
      pokemonSlugGuard({ paramMap: { get: () => 'pikachu' } } as never, {} as never),
    );
    expect(result).toBeTrue();
  });

  it('allows legacy numeric ids', () => {
    const result = TestBed.runInInjectionContext(() =>
      pokemonSlugGuard({ paramMap: { get: () => '25' } } as never, {} as never),
    );
    expect(result).toBeTrue();
  });

  it('allows hyphenated names', () => {
    const result = TestBed.runInInjectionContext(() =>
      pokemonSlugGuard({ paramMap: { get: () => 'mr-mime' } } as never, {} as never),
    );
    expect(result).toBeTrue();
  });

  it('redirects invalid slugs to home', () => {
    const result = TestBed.runInInjectionContext(() =>
      pokemonSlugGuard({ paramMap: { get: () => 'not valid!' } } as never, {} as never),
    );
    expect(result).toEqual(router.createUrlTree(['/']));
    expect(toastCreate).toHaveBeenCalled();
  });

  it('rejects empty slugs', () => {
    const result = TestBed.runInInjectionContext(() =>
      pokemonSlugGuard({ paramMap: { get: () => '' } } as never, {} as never),
    );
    expect(result).toEqual(router.createUrlTree(['/']));
  });
});
