import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, retry, throwError, timeout, timer } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiError } from '../models/api-error.model';

const REQUEST_TIMEOUT_MS = 10_000;

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    timeout(REQUEST_TIMEOUT_MS),
    retry({
      count: 1,
      delay: (error) =>
        error instanceof HttpErrorResponse && error.status >= 500
          ? timer(500)
          : throwError(() => error),
    }),
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        if (!environment.production) {
          console.error('[HTTP]', req.method, req.url, error.status, error.message);
        }
        return throwError(
          () =>
            new ApiError(
              error.error?.message ?? error.message ?? 'Request failed',
              error.status,
              req.url,
            ),
        );
      }
      return throwError(() => error);
    }),
  );
};
