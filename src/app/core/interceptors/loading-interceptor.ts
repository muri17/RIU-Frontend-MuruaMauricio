import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize, Observable } from 'rxjs';
import { LoadingService } from '../services/loading-service';


//NOTA: En esta app, la capa de servicios usa observables simulados (sin HTTP real),
//así que la superposición se activa directamente mediante LoadingService.show/hide en cada operación.
// Este interceptor se activaría automáticamente para llamadas HTTP reales y hay que registrarlo
// en app.config.ts, pero no se usa en esta app.

export const loadingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const loadingService = inject(LoadingService);
  loadingService.show();
  return next(req).pipe(finalize(() => loadingService.hide()));
};

