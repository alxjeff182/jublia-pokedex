import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { httpInterceptor } from './http.interceptor';
import { ApiError } from '../models/api-error.model';

describe('httpInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('passes through successful responses', () => {
    http.get('/api/test').subscribe((body) => {
      expect(body).toEqual({ ok: true });
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({ ok: true });
  });

  it('maps http errors to ApiError', () => {
    let error: unknown;
    http.get('/api/fail').subscribe({
      error: (err) => {
        error = err;
      },
    });

    const req = httpMock.expectOne('/api/fail');
    req.flush('Not found', { status: 404, statusText: 'Not Found' });

    expect(error).toEqual(jasmine.any(ApiError));
    expect((error as ApiError).status).toBe(404);
  });
});
