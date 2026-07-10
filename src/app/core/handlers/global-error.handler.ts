import { ErrorHandler, Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';
import { environment } from '../../../environments/environment';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly toastController = inject(ToastController);

  handleError(error: unknown): void {
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    if (!environment.production) {
      console.error('[GlobalError]', error);
    } else {
      // Sentry-ready hook: Sentry.captureException(error);
      console.error(JSON.stringify({ level: 'error', message, timestamp: Date.now() }));
    }

    void this.showToast(message);
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message: message.slice(0, 120),
      duration: 3000,
      color: 'danger',
      position: 'bottom',
    });
    await toast.present();
  }
}
