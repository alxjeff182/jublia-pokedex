import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import type { AnimationItem } from 'lottie-web';
import lottie from 'lottie-web';

@Component({
  selector: 'app-lottie-player',
  standalone: true,
  template: '<div #container class="lottie-player__container" aria-hidden="true"></div>',
  styles: [
    `
      :host {
        display: block;
      }

      .lottie-player__container {
        width: 100%;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LottiePlayerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container', { static: true })
  private readonly containerRef!: ElementRef<HTMLDivElement>;

  @Input({ required: true }) path!: string;
  @Input() loop = true;
  @Input() autoplay = true;

  private animationItem: AnimationItem | null = null;

  ngAfterViewInit(): void {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    this.animationItem = lottie.loadAnimation({
      container: this.containerRef.nativeElement,
      renderer: 'svg',
      loop: prefersReducedMotion ? false : this.loop,
      autoplay: prefersReducedMotion ? false : this.autoplay,
      path: this.path,
    });

    if (prefersReducedMotion) {
      this.animationItem.addEventListener('DOMLoaded', () => {
        const midFrame = Math.floor((this.animationItem?.totalFrames ?? 1) / 2);
        this.animationItem?.goToAndStop(midFrame, true);
      });
    }
  }

  ngOnDestroy(): void {
    this.animationItem?.destroy();
    this.animationItem = null;
  }
}
