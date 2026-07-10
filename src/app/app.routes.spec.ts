import { routes } from './app.routes';

describe('app routes', () => {
  it('redirects root to splash', () => {
    const root = routes.find((route) => route.path === '');
    expect(root?.redirectTo).toBe('splash');
  });

  it('defines splash and tabs routes', () => {
    const splash = routes.find((route) => route.path === 'splash');
    const tabs = routes.find((route) => route.path === 'tabs');
    expect(splash?.loadComponent).toBeDefined();
    expect(tabs?.loadComponent).toBeDefined();
    expect(tabs?.children?.length).toBeGreaterThan(0);
  });

  it('guards pokemon detail route', () => {
    const detail = routes
      .find((route) => route.path === 'tabs')
      ?.children?.find((child) => child.path === 'pokemon/:id');
    expect(detail?.canActivate?.length).toBe(1);
  });

  it('redirects legacy compare and pokemon paths', () => {
    const compare = routes.find((route) => route.path === 'compare');
    const pokemon = routes.find((route) => route.path === 'pokemon/:id');
    expect(compare?.redirectTo).toBe('tabs/compare');
    expect(pokemon?.redirectTo).toBe('tabs/pokemon/:id');
  });
});
