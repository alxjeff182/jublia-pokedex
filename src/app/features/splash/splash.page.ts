import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonSpinner,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [IonContent, IonSpinner, TranslatePipe],
  templateUrl: './splash.page.html',
  styleUrl: './splash.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SplashPage implements OnInit {
  private readonly router = inject(Router);

  ngOnInit(): void {
    void this.bootstrap();
  }

  private async bootstrap(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1800));
    await this.router.navigateByUrl('/', {
      replaceUrl: true,
      state: { fromSplash: true },
    });
  }
}
