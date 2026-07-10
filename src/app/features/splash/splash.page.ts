import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonSpinner,
  IonText,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [IonContent, IonSpinner, IonText],
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
    await this.router.navigateByUrl('/tabs/home', { replaceUrl: true });
  }
}
