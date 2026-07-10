import { TestBed } from '@angular/core/testing';
import { Capacitor } from '@capacitor/core';
import { PlatformService } from './platform.service';

describe('PlatformService', () => {
  let service: PlatformService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlatformService);
  });

  it('no-ops on web platforms', async () => {
    spyOn(Capacitor, 'isNativePlatform').and.returnValue(false);
    await expectAsync(service.initializeNative()).toBeResolved();
  });

  it('initializes native plugins on native platforms', async () => {
    spyOn(Capacitor, 'isNativePlatform').and.returnValue(true);
    await expectAsync(service.initializeNative()).toBeResolved();
  });
});
