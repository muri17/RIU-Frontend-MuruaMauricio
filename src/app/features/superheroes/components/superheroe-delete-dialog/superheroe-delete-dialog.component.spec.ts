import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  SuperheroeDeleteDialogComponent,
  DeleteDialogData,
} from './superheroe-delete-dialog.component';

describe('SuperheroeDeleteDialogComponent', () => {
  let component: SuperheroeDeleteDialogComponent;
  let fixture: ComponentFixture<SuperheroeDeleteDialogComponent>;
  let dialogRefSpy: { close: ReturnType<typeof vi.fn> };

  const mockData: DeleteDialogData = { heroName: 'SUPERMAN' };

  beforeEach(async () => {
    dialogRefSpy = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [SuperheroeDeleteDialogComponent],
      providers: [
        provideAnimationsAsync(),
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        { provide: MatDialogRef, useValue: dialogRefSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SuperheroeDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe mostrar el nombre del héroe en el mensaje de confirmación', () => {
    const content = fixture.nativeElement.textContent as string;
    expect(content).toContain('SUPERMAN');
  });

  it('debe mostrar el aviso de acción no reversible', () => {
    const content = fixture.nativeElement.textContent as string;
    expect(content).toContain('Esta acción no se puede deshacer');
  });

  it('debe tener inyectados los datos del diálogo', () => {
    expect(component.data.heroName).toBe('SUPERMAN');
  });

  it('debe cerrar el diálogo con true al confirmar eliminación', () => {
    const deleteBtn = fixture.debugElement
      .queryAll(By.css('button'))
      .find(b => (b.nativeElement as HTMLButtonElement).textContent?.includes('Eliminar'));

    expect(deleteBtn).toBeTruthy();
    deleteBtn!.nativeElement.click();
    fixture.detectChanges();

    expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
  });

  it('debe cerrar el diálogo sin valor al cancelar', () => {
    const cancelBtn = fixture.debugElement
      .queryAll(By.css('button'))
      .find(b => (b.nativeElement as HTMLButtonElement).textContent?.includes('Cancelar'));

    expect(cancelBtn).toBeTruthy();
    cancelBtn!.nativeElement.click();
    fixture.detectChanges();

    expect(dialogRefSpy.close).toHaveBeenCalledWith(undefined);
  });
});
