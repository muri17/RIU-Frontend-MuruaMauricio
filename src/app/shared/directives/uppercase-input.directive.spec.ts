import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach } from 'vitest';

import { UppercaseInputDirective } from './uppercase-input.directive';

@Component({
  standalone: true,
  imports: [UppercaseInputDirective, ReactiveFormsModule],
  template: `<input appUppercase [formControl]="ctrl" />`,
})
class HostComponent {
  ctrl = new FormControl('');
}

@Component({
  standalone: true,
  imports: [UppercaseInputDirective],
  template: `<input appUppercase />`,
})
class HostNoControlComponent {}

describe('UppercaseInputDirective', () => {
  describe('con FormControl', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;
    let input: HTMLInputElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [HostComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(HostComponent);
      host = fixture.componentInstance;
      fixture.detectChanges();
      input = fixture.debugElement.query(By.css('input')).nativeElement;
    });

    it('debe crearse la directiva', () => {
      const directive = fixture.debugElement
        .query(By.directive(UppercaseInputDirective))
        .injector.get(UppercaseInputDirective);
      expect(directive).toBeTruthy();
    });

    it('debe convertir a mayúsculas el valor del DOM al escribir', () => {
      input.value = 'superman';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(input.value).toBe('SUPERMAN');
    });

    it('debe actualizar el FormControl con el valor en mayúsculas', () => {
      input.value = 'batman';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(host.ctrl.value).toBe('BATMAN');
    });

    it('debe mantener el valor ya en mayúsculas sin cambios', () => {
      input.value = 'FLASH';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(input.value).toBe('FLASH');
      expect(host.ctrl.value).toBe('FLASH');
    });

    it('debe convertir texto mixto a mayúsculas', () => {
      input.value = 'SpIdErMaN';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(input.value).toBe('SPIDERMAN');
      expect(host.ctrl.value).toBe('SPIDERMAN');
    });
  });

  describe('sin FormControl', () => {
    let fixture: ComponentFixture<HostNoControlComponent>;
    let input: HTMLInputElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [HostNoControlComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(HostNoControlComponent);
      fixture.detectChanges();
      input = fixture.debugElement.query(By.css('input')).nativeElement;
    });

    it('debe convertir a mayúsculas el DOM sin lanzar error', () => {
      input.value = 'ironman';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(input.value).toBe('IRONMAN');
    });
  });
});
