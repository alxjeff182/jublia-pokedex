import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { IonNote } from '@ionic/angular/standalone';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-offline-banner',
  standalone: true,
  imports: [IonNote, TranslatePipe],
  template: `
    @if (!online()) {
      <ion-note class="offline-banner" role="status" aria-live="polite">
        {{ 'offline.message' | translate }}
      </ion-note>
    }
  `,
  styles: `
    .offline-banner {
      display: block;
      position: sticky;
      top: 0;
      z-index: 1000;
      padding: 10px 16px;
      text-align: center;
      background: var(--ion-color-warning);
      color: #1a1a1a;
      font-weight: var(--jublia-font-weight-semibold);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfflineBannerComponent implements OnInit, OnDestroy {
  readonly online = signal(typeof navigator !== 'undefined' ? navigator.onLine : true);

  private readonly handleOnline = (): void => {
    this.online.set(true);
  };

  private readonly handleOffline = (): void => {
    this.online.set(false);
  };

  ngOnInit(): void {
    this.online.set(navigator.onLine);
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  ngOnDestroy(): void {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }
}
