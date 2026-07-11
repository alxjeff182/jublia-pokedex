import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LottiePlayerComponent } from './lottie-player.component';

describe('LottiePlayerComponent', () => {
  let fixture: ComponentFixture<LottiePlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LottiePlayerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LottiePlayerComponent);
    fixture.componentRef.setInput('path', 'assets/lottie/splash-pokeball.json');
    fixture.detectChanges();
  });

  it('creates and renders a lottie container', () => {
    expect(fixture.componentInstance).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('.lottie-player__container'),
    ).toBeTruthy();
  });

  it('destroys without error on teardown', () => {
    expect(() => fixture.destroy()).not.toThrow();
  });
});
