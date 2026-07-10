import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IonIcon, IonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heartOutline } from 'ionicons/icons';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [IonIcon, IonText],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  @Input() icon = 'heart-outline';
  @Input() title = 'Nothing here yet';
  @Input() message = 'Start exploring to add items.';

  constructor() {
    addIcons({ heartOutline });
  }
}
