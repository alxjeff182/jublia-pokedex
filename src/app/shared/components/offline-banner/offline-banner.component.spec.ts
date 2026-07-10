import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OfflineBannerComponent } from './offline-banner.component';

describe('OfflineBannerComponent', () => {
  let fixture: ComponentFixture<OfflineBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfflineBannerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OfflineBannerComponent);
    fixture.detectChanges();
  });

  it('creates the banner component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows banner when offline event fires', () => {
    window.dispatchEvent(new Event('offline'));
    fixture.detectChanges();
    expect(fixture.componentInstance.online()).toBeFalse();
    expect(fixture.nativeElement.querySelector('.offline-banner')).toBeTruthy();
  });

  it('hides banner when online event fires', () => {
    window.dispatchEvent(new Event('offline'));
    fixture.detectChanges();
    window.dispatchEvent(new Event('online'));
    fixture.detectChanges();
    expect(fixture.componentInstance.online()).toBeTrue();
    expect(fixture.nativeElement.querySelector('.offline-banner')).toBeFalsy();
  });
});
