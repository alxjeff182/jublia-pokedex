import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ErrorHandler, provideAppInitializer } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, RouteReuseStrategy, TitleStrategy, withPreloading } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { Capacitor } from '@capacitor/core';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { GlobalErrorHandler } from './app/core/handlers/global-error.handler';
import { httpInterceptor } from './app/core/interceptors/http.interceptor';
import { appInitializer } from './app/core/initializers/app.initializer';
import { AppTitleStrategy } from './app/core/strategies/title.strategy';
import { TabPreloadStrategy } from './app/core/strategies/tab-preload.strategy';
import { environment } from './environments/environment';

const serviceWorkerProviders =
  environment.production && !Capacitor.isNativePlatform()
    ? [
        provideServiceWorker('ngsw-worker.js', {
          enabled: true,
          registrationStrategy: 'registerWhenStable:30000',
        }),
      ]
    : [];

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    { provide: TitleStrategy, useClass: AppTitleStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(TabPreloadStrategy)),
    provideHttpClient(withFetch(), withInterceptors([httpInterceptor])),
    provideAppInitializer(appInitializer),
    ...serviceWorkerProviders,
  ],
}).catch((err) => console.error(err));
