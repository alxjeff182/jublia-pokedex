import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';
import { pokemonIdGuard } from './pokemon-id.guard';

describe('pokemonIdGuard', () => {
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

  it('allows valid pokemon ids', () => {
    const result = TestBed.runInInjectionContext(() =>
      pokemonIdGuard({ paramMap: { get: () => '25' } } as never, {} as never),
    );
    expect(result).toBeTrue();
  });

  it('redirects invalid ids to home', () => {
    const result = TestBed.runInInjectionContext(() =>
      pokemonIdGuard({ paramMap: { get: () => 'abc' } } as never, {} as never),
    );
    expect(result).toEqual(router.createUrlTree(['/tabs/home']));
    expect(toastCreate).toHaveBeenCalled();
  });

  it('rejects out-of-range ids', () => {
    const result = TestBed.runInInjectionContext(() =>
      pokemonIdGuard({ paramMap: { get: () => '9999' } } as never, {} as never),
    );
    expect(result).toEqual(router.createUrlTree(['/tabs/home']));
  });
});
