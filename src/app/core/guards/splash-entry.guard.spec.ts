import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { splashEntryGuard } from './splash-entry.guard';

describe('splashEntryGuard', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
    router = TestBed.inject(Router);
  });

  it('redirects root visits to splash', () => {
    const result = TestBed.runInInjectionContext(() =>
      splashEntryGuard({} as never, { url: '/' } as never),
    );
    expect(result).toEqual(router.createUrlTree(['/splash']));
  });

  it('allows root visits after splash', () => {
    spyOn(router, 'getCurrentNavigation').and.returnValue({
      extras: { state: { fromSplash: true } },
    } as never);

    const result = TestBed.runInInjectionContext(() =>
      splashEntryGuard({} as never, { url: '/' } as never),
    );
    expect(result).toBeTrue();
  });

  it('allows non-root tab routes', () => {
    const result = TestBed.runInInjectionContext(() =>
      splashEntryGuard({} as never, { url: '/browse' } as never),
    );
    expect(result).toBeTrue();
  });
});
