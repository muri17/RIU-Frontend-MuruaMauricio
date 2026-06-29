import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpInterceptorFn, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { loadingInterceptor } from './loading-interceptor';
import { LoadingService } from '../services/loading-service';

describe('loadingInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => loadingInterceptor(req, next));

  let loadingService: LoadingService;
  let httpClient: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting(),
        LoadingService,
      ],
    });
    loadingService = TestBed.inject(LoadingService);
    httpClient = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('debe llamar show() al iniciar la petición', () => {
    httpClient.get('/api/test').subscribe();
    const req = httpTesting.expectOne('/api/test');
    expect(loadingService.isLoading()).toBe(true);
    req.flush({});
  });

  it('debe llamar hide() al completar la petición', () => {
    httpClient.get('/api/test').subscribe();
    const req = httpTesting.expectOne('/api/test');
    req.flush({});
    expect(loadingService.isLoading()).toBe(false);
  });

  it('debe llamar hide() incluso cuando la petición falla', () => {
    httpClient.get('/api/test').subscribe({ error: () => {} });
    const req = httpTesting.expectOne('/api/test');
    req.flush('Error', { status: 500, statusText: 'Server Error' });
    expect(loadingService.isLoading()).toBe(false);
  });

  it('debe gestionar correctamente múltiples peticiones concurrentes', () => {
    httpClient.get('/api/a').subscribe();
    httpClient.get('/api/b').subscribe();

    expect(loadingService.isLoading()).toBe(true);

    httpTesting.expectOne('/api/a').flush({});
    expect(loadingService.isLoading()).toBe(true);

    httpTesting.expectOne('/api/b').flush({});
    expect(loadingService.isLoading()).toBe(false);
  });
});
