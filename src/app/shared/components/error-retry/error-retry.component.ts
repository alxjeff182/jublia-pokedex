import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IonButton, IonIcon, IonModal, IonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cloudOfflineOutline, refreshOutline } from 'ionicons/icons';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-error-retry',
  standalone: true,
  imports: [IonButton, IonIcon, IonText, IonModal, TranslatePipe],
  templateUrl: './error-retry.component.html',
  styleUrl: './error-retry.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorRetryComponent {
  @Input() title = '';
  @Input() message = '';
  @Input() presentation: 'inline' | 'modal' = 'modal';
  @Output() retry = new EventEmitter<void>();
  @Output() dismiss = new EventEmitter<void>();

  constructor() {
    addIcons({ cloudOfflineOutline, refreshOutline });
  }

  onRetry(): void {
    this.retry.emit();
  }

  onDismiss(): void {
    this.dismiss.emit();
  }
}
