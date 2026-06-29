import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { SuperheroeFormComponent } from './superheroe-form.component';
import { SuperheroesServices } from '../../services/superheroes-services';
import { LoadingService } from '../../../../core/services/loading-service';
import { Superheroe } from '../../../../shared/models/superheroe';

const MOCK_HERO: Superheroe = {
  id: 1,
  name: 'SUPERMAN',
  realName: 'Clark Kent',
  universe: 'DC',
  powers: ['Vuelo', 'Superfuerza'],
  year: '1938',
  img: '',
};

function buildRoute(params: Record<string, string> = {}, path = '') {
  return {
    snapshot: {
      paramMap: convertToParamMap(params),
      routeConfig: { path },
    },
  };
}

describe('SuperheroeFormComponent', () => {
  let component: SuperheroeFormComponent;
  let fixture: ComponentFixture<SuperheroeFormComponent>;
  let heroesServiceSpy: {
    getById: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };
  let snackBarSpy: { open: ReturnType<typeof vi.fn> };

  async function setup(routeStub: ReturnType<typeof buildRoute>) {
    heroesServiceSpy = {
      getById: vi.fn().mockReturnValue(of(MOCK_HERO)),
      create: vi.fn().mockReturnValue(MOCK_HERO),
      update: vi.fn().mockReturnValue(of(MOCK_HERO)),
    };
    routerSpy = { navigate: vi.fn() };
    snackBarSpy = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [SuperheroeFormComponent],
      providers: [
        provideAnimationsAsync(),
        { provide: SuperheroesServices, useValue: heroesServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: MatSnackBar, useValue: snackBarSpy },
        LoadingService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SuperheroeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  //Creacion

  describe('Modo creación (sin id en ruta)', () => {
    beforeEach(async () => setup(buildRoute({}, 'new')));

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('isEditMode debe ser false', () => {
      expect(component.isEditMode()).toBe(false);
    });

    it('isViewMode debe ser false', () => {
      expect(component.isViewMode()).toBe(false);
    });

    it('no debe llamar getById sin id', () => {
      expect(heroesServiceSpy.getById).not.toHaveBeenCalled();
    });

    it('el formulario debe tener universe por defecto "Marvel"', () => {
      expect(component.form.get('universe')?.value).toBe('Marvel');
    });

    it('onSubmit sin datos invalida el formulario sin llamar a create', () => {
      component.onSubmit();
      expect(heroesServiceSpy.create).not.toHaveBeenCalled();
    });

    it('debe crear el héroe y navegar al completar el formulario válido', () => {
      component.form.patchValue({
        name: 'Flash',
        realName: 'Barry Allen',
        universe: 'DC',
        powers: 'Supervelocidad',
        year: '1956',
      });
      component.onSubmit();
      expect(heroesServiceSpy.create).toHaveBeenCalledOnce();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/superheroes']);
    });

    it('debe mostrar snackbar de éxito al crear', () => {
      component.form.patchValue({
        name: 'Flash',
        realName: 'Barry Allen',
        universe: 'DC',
        powers: 'Supervelocidad',
        year: '1956',
      });
      component.onSubmit();
      expect(snackBarSpy.open).toHaveBeenCalledWith('Héroe creado ✓', 'OK', { duration: 2500 });
    });
  });

  // Edicion

  describe('Modo edición (ruta edit/:id)', () => {
    beforeEach(async () => setup(buildRoute({ id: '1' }, 'edit/:id')));

    it('isEditMode debe ser true', () => {
      expect(component.isEditMode()).toBe(true);
    });

    it('debe cargar el héroe por id al iniciar', fakeAsync(() => {
      tick(400);
      expect(heroesServiceSpy.getById).toHaveBeenCalledWith(1);
    }));

    it('debe parchear el formulario con los datos del héroe', fakeAsync(() => {
      tick(400);
      fixture.detectChanges();
      expect(component.form.get('name')?.value).toBe('SUPERMAN');
      expect(component.form.get('realName')?.value).toBe('Clark Kent');
    }));

    it('debe llamar update con el id y los datos al guardar', fakeAsync(() => {
      tick(400);
      fixture.detectChanges();
      component.form.patchValue({ realName: 'Kal-El' });
      component.onSubmit();
      tick(400);
      expect(heroesServiceSpy.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ realName: 'Kal-El' }),
      );
    }));

    it('debe navegar de vuelta al guardar con éxito', fakeAsync(() => {
      tick(400);
      fixture.detectChanges();
      component.onSubmit();
      tick(400);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/superheroes']);
    }));

    it('debe mostrar snackbar de error cuando update falla', fakeAsync(() => {
      heroesServiceSpy.update.mockReturnValue(throwError(() => new Error('Error de red')));
      tick(400);
      fixture.detectChanges();
      component.onSubmit();
      tick(0);
      expect(snackBarSpy.open).toHaveBeenCalledWith('Error de red', 'Cerrar', { duration: 4000 });
    }));
  });

  // Consultar

  describe('Modo vista (ruta detail/:id)', () => {
    beforeEach(async () => setup(buildRoute({ id: '1' }, 'detail/:id')));

    it('isViewMode debe ser true', () => {
      expect(component.isViewMode()).toBe(true);
    });

    it('debe deshabilitar el formulario en modo vista', fakeAsync(() => {
      tick(400);
      fixture.detectChanges();
      expect(component.form.disabled).toBe(true);
    }));
  });

  describe('getById devuelve error', () => {
    beforeEach(async () => {
      const route = buildRoute({ id: '999' }, 'edit/:id');
      heroesServiceSpy = {
        getById: vi.fn().mockReturnValue(throwError(() => new Error('Not found'))),
        create: vi.fn(),
        update: vi.fn(),
      };
      routerSpy = { navigate: vi.fn() };
      snackBarSpy = { open: vi.fn() };

      await TestBed.configureTestingModule({
        imports: [SuperheroeFormComponent],
        providers: [
          provideAnimationsAsync(),
          { provide: SuperheroesServices, useValue: heroesServiceSpy },
          { provide: Router, useValue: routerSpy },
          { provide: ActivatedRoute, useValue: route },
          { provide: MatSnackBar, useValue: snackBarSpy },
          LoadingService,
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(SuperheroeFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('debe mostrar snackbar y navegar al no encontrar el héroe', () => {
      expect(snackBarSpy.open).toHaveBeenCalledWith('Héroe no encontrado', 'Cerrar', { duration: 3000 });
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/superheroes']);
    });
  });

  // Validaciones

  describe('Mensajes de error del formulario', () => {
    beforeEach(async () => setup(buildRoute({}, 'new')));

    it('nameError debe devolver mensaje de obligatorio cuando está vacío y tocado', () => {
      const ctrl = component.form.get('name')!;
      ctrl.markAsTouched();
      ctrl.setValue('');
      expect(component.nameError).toBe('El nombre es obligatorio');
    });

    it('nameError debe devolver mensaje de longitud mínima', () => {
      const ctrl = component.form.get('name')!;
      ctrl.markAsTouched();
      ctrl.setValue('A');
      expect(component.nameError).toBe('Mínimo 2 caracteres');
    });

    it('yearError debe devolver mensaje de obligatorio cuando está vacío y tocado', () => {
      const ctrl = component.form.get('year')!;
      ctrl.markAsTouched();
      ctrl.setValue('');
      expect(component.yearError).toBe('El año es obligatorio');
    });

    it('yearError debe devolver mensaje de patrón para año inválido', () => {
      const ctrl = component.form.get('year')!;
      ctrl.markAsTouched();
      ctrl.setValue('99');
      expect(component.yearError).toBe('Debe ser un año de 4 dígitos (ej: 1962)');
    });
  });

  // Navegacion

  describe('goBack()', () => {
    beforeEach(async () => setup(buildRoute({}, 'new')));

    it('debe navegar a /superheroes', () => {
      component.goBack();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/superheroes']);
    });
  });
});
