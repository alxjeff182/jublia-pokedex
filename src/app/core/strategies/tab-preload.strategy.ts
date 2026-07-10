import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of } from 'rxjs';

const PRELOAD_PATHS = new Set(['home']);

@Injectable({ providedIn: 'root' })
export class TabPreloadStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    const path = route.path ?? '';
    if (PRELOAD_PATHS.has(path)) {
      return load();
    }
    return of(null);
  }
}
