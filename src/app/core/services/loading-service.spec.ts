import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { LoadingService } from './loading-service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isLoading inicial', () => {
    it('debe ser false al iniciar', () => {
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('show()', () => {
    it('debe poner isLoading en true al llamar show()', () => {
      service.show();
      expect(service.isLoading()).toBe(true);
    });

    it('debe acumular múltiples llamadas a show()', () => {
      service.show();
      service.show();
      service.show();
      expect(service.isLoading()).toBe(true);
    });
  });

  describe('hide()', () => {
    it('debe poner isLoading en false después de show() + hide()', () => {
      service.show();
      service.hide();
      expect(service.isLoading()).toBe(false);
    });

    it('debe mantener isLoading true si hay más show() que hide()', () => {
      service.show();
      service.show();
      service.hide();
      expect(service.isLoading()).toBe(true);
    });

    it('debe volver a false cuando se equilibran show() y hide()', () => {
      service.show();
      service.show();
      service.hide();
      service.hide();
      expect(service.isLoading()).toBe(false);
    });

    it('no debe bajar el contador por debajo de 0 con hide() extra', () => {
      service.hide();
      service.hide();
      expect(service.isLoading()).toBe(false);
      service.show();
      service.hide();
      expect(service.isLoading()).toBe(false);
    });
  });
});
