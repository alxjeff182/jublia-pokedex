import { TestBed } from '@angular/core/testing';
import { HapticsService } from './haptics.service';

const STORAGE_KEY = 'CapacitorStorage.jublia_dex_haptics';

describe('HapticsService', () => {
  let service: HapticsService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(HapticsService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('resolves when haptics is supported', async () => {
    await expectAsync(service.lightImpact()).toBeResolved();
  });

  it('loads disabled preference from storage', async () => {
    localStorage.setItem(STORAGE_KEY, 'false');
    await service.init();
    expect(service.isEnabled()).toBeFalse();
  });

  it('persists preference changes', async () => {
    await service.setEnabled(false);
    expect(service.isEnabled()).toBeFalse();
    expect(localStorage.getItem(STORAGE_KEY)).toBe('false');
    await service.setEnabled(true);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
  });

  it('resolves when vibrate is unavailable', async () => {
    const vibrate = navigator.vibrate;
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: undefined,
    });

    await expectAsync(service.lightImpact()).toBeResolved();

    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: vibrate,
    });
  });

  it('skips haptics when disabled', async () => {
    await service.setEnabled(false);
    await expectAsync(service.lightImpact()).toBeResolved();
    await expectAsync(service.selectionChanged()).toBeResolved();
  });
});

