import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private readonly _count = signal(0);

  //Verdadero cuando al menos una operación está pendiente
  readonly isLoading = computed(() => this._count() > 0);

  //Mostrar e incrementar el contador de operaciones pendientes
  show(): void {
    this._count.update(n => n + 1);
  }

  //Ocultar y decrementar el contador de operaciones pendientes
  hide(): void {
    this._count.update(n => Math.max(0, n - 1));
  }
}
