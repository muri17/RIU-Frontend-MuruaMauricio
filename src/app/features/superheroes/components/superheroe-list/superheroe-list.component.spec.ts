import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { SuperheroeListComponent } from './superheroe-list.component';
import { Superheroe } from '../../../../shared/models/superheroe';
import { SuperheroesServices } from '../../services/superheroes-services';

const MOCK_HEROES: Superheroe[] = [
  { id: 1, name: 'SUPERMAN', realName: 'Clark Kent', universe: 'DC', powers: ['Vuelo'], year: '1938' },
  { id: 2, name: 'BATMAN', realName: 'Bruce Wayne', universe: 'DC', powers: ['Artes marciales'], year: '1939' },
  { id: 3, name: 'SPIDERMAN', realName: 'Peter Parker', universe: 'Marvel', powers: ['Telarañas'], year: '1962' },
];

describe('SuperheroeListComponent', () => {
  let component: SuperheroeListComponent;
  let fixture: ComponentFixture<SuperheroeListComponent>;
  let heroesServiceSpy: {
    getAll: ReturnType<typeof vi.fn>;
    searchByName: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let dialogSpy: { open: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    heroesServiceSpy = {
      getAll: vi.fn().mockReturnValue(of([...MOCK_HEROES])),
      searchByName: vi.fn().mockReturnValue(of([])),
      delete: vi.fn().mockReturnValue(of(undefined)),
    };
    dialogSpy = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [SuperheroeListComponent],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        { provide: SuperheroesServices, useValue: heroesServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SuperheroeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar todos los superhéroes al iniciar', fakeAsync(() => {
    tick(400);
    fixture.detectChanges();
    expect(heroesServiceSpy.getAll).toHaveBeenCalledOnce();
    expect(component.dataSource.data.length).toBe(3);
  }));

  it('debe llamar a searchByName cuando el control de búsqueda tiene un valor', fakeAsync(() => {
    const filtered = MOCK_HEROES.filter(h => h.name.includes('MAN'));
    heroesServiceSpy.searchByName.mockReturnValue(of(filtered));

    component.searchControl.setValue('man');
    tick(350); // debounce
    fixture.detectChanges();

    expect(heroesServiceSpy.searchByName).toHaveBeenCalledWith('man');
  }));

  it('debe llamar a getAll cuando se limpia la búsqueda', fakeAsync(() => {
    component.searchControl.setValue('man');
    tick(350);

    heroesServiceSpy.getAll.mockClear();
    component.clearSearch();
    tick(350);

    expect(heroesServiceSpy.getAll).toHaveBeenCalled();
  }));

  it('debe abrir el diálogo de eliminación cuando se llama a openDeleteDialog', () => {
    const mockRef = { afterClosed: () => of(false) } as unknown as MatDialogRef<unknown>;
    dialogSpy.open.mockReturnValue(mockRef);

    component.openDeleteDialog(MOCK_HEROES[0]);

    expect(dialogSpy.open).toHaveBeenCalledOnce();
  });

  it('debe llamar a delete con el ID del superhéroes cuando se confirma el diálogo', fakeAsync(() => {
    const mockRef = { afterClosed: () => of(true) } as unknown as MatDialogRef<unknown>;
    dialogSpy.open.mockReturnValue(mockRef);

    component.openDeleteDialog(MOCK_HEROES[0]);
    tick(400);

    expect(heroesServiceSpy.delete).toHaveBeenCalledWith(1);
  }));

  it('debe NO llamar a delete cuando se cancela el diálogo', fakeAsync(() => {
    const mockRef = { afterClosed: () => of(false) } as unknown as MatDialogRef<unknown>;
    dialogSpy.open.mockReturnValue(mockRef);

    component.openDeleteDialog(MOCK_HEROES[0]);
    tick(400);

    expect(heroesServiceSpy.delete).not.toHaveBeenCalled();
  }));
});
