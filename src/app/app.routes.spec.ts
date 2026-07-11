import { routes } from './app.routes';

describe('app routes', () => {
  it('defines splash route', () => {
    const splash = routes.find((route) => route.path === 'splash');
    expect(splash?.loadComponent).toBeDefined();
  });

  it('defines tab shell at root with child routes', () => {
    const shell = routes.find(
      (route) => route.path === '' && route.loadComponent && route.children,
    );
    expect(shell?.loadComponent).toBeDefined();
    expect(shell?.canActivate?.length).toBe(1);
    expect(shell?.children?.some((child) => child.path === '')).toBeTrue();
    expect(shell?.children?.some((child) => child.path === 'browse')).toBeTrue();
  });

  it('guards pokemon detail route', () => {
    const shell = routes.find(
      (route) => route.path === '' && route.loadComponent && route.children,
    );
    const detail = shell?.children?.find((child) => child.path === 'pokemon/:slug');
    expect(detail?.canActivate?.length).toBe(1);
  });

  it('redirects legacy tabs paths', () => {
    const legacy = routes.find((route) => route.path === 'tabs');
    const home = legacy?.children?.find((child) => child.path === 'home');
    const browse = legacy?.children?.find((child) => child.path === 'browse');
    expect(home?.redirectTo).toBe('/');
    expect(browse?.redirectTo).toBe('/browse');
  });
});
