import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TabPreloadStrategy } from './tab-preload.strategy';

describe('TabPreloadStrategy', () => {
  let strategy: TabPreloadStrategy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    strategy = TestBed.inject(TabPreloadStrategy);
  });

  it('preloads configured tab routes', () => {
    const load = jasmine.createSpy('load').and.returnValue(of('loaded'));
    strategy.preload({ path: '' }, load);
    expect(load).toHaveBeenCalled();
    strategy.preload({ path: 'home' }, load);
    strategy.preload({ path: 'compare' }, load);
    expect(load).toHaveBeenCalledTimes(3);
  });

  it('skips preload for other routes', () => {
    const load = jasmine.createSpy('load');
    const result = strategy.preload({ path: 'settings' }, load);
    expect(load).not.toHaveBeenCalled();
    result.subscribe((value) => expect(value).toBeNull());
  });

  it('skips preload for browse and favorites tabs', () => {
    const load = jasmine.createSpy('load');
    strategy.preload({ path: 'browse' }, load).subscribe((value) => expect(value).toBeNull());
    strategy.preload({ path: 'favorites' }, load).subscribe((value) => expect(value).toBeNull());
    expect(load).not.toHaveBeenCalled();
  });
});
