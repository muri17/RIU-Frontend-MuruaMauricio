import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { SuperheroesServices } from './superheroes-services';
import { Superheroe } from '../../../shared/models/superheroe';

describe('SuperheroesServices', () => {
  let service: SuperheroesServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuperheroesServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  //Obtener todos los heroes
  describe('getAll()', () => {
    it('debe devolver todos los superhéroes', fakeAsync(() => {
      let heroes: Superheroe[] = [];
      service.getAll().subscribe(h => (heroes = h));
      tick(400);
      expect(heroes.length).toBeGreaterThan(0);
    }));

    it('debe devolver una copia, no la referencia interna', fakeAsync(() => {
      let heroes: Superheroe[] = [];
      service.getAll().subscribe(h => (heroes = h));
      tick(400);
      heroes[0].name = 'MUTATED';
      let fresh: Superheroe[] = [];
      service.getAll().subscribe(h => (fresh = h));
      tick(400);
      expect(fresh[0].name).not.toBe('MUTATED');
    }));
  });

  // Obtener un heroe por id
  describe('getById()', () => {
    it('debe devolver el superhéroes con el id dado', fakeAsync(() => {
      let hero: Superheroe | undefined;
      service.getById(1).subscribe(h => (hero = h));
      tick(400);
      expect(hero).toBeDefined();
      expect(hero!.id).toBe(1);
    }));

    it('debe lanzar un error cuando el id no existe', fakeAsync(() => {
      let errored = false;
      service.getById(999).subscribe({ error: () => (errored = true) });
      tick(0);
      expect(errored).toBe(true);
    }));
  });

  // Buscar heroes por nombre
  describe('searchByName()', () => {
    it('debe devolver todos los superhéroes que contienen el término', fakeAsync(() => {
      let results: Superheroe[] = [];
      service.searchByName('man').subscribe(h => (results = h));
      tick(400);
      expect(results.length).toBeGreaterThan(0);
      results.forEach(h => expect(h.name.toUpperCase()).toContain('MAN'));
    }));

    it('debe ser insensible a mayúsculas y minúsculas', fakeAsync(() => {
      let lower: Superheroe[] = [], upper: Superheroe[] = [];
      service.searchByName('man').subscribe(h => (lower = h));
      tick(400);
      service.searchByName('MAN').subscribe(h => (upper = h));
      tick(400);
      expect(lower.length).toBe(upper.length);
    }));

    it('debe devolver un array vacío cuando no hay coincidencias', fakeAsync(() => {
      let results: Superheroe[] = [];
      service.searchByName('zzz_no_match').subscribe(h => (results = h));
      tick(400);
      expect(results.length).toBe(0);
    }));
  });

  //Crear un nuevo heroe
  describe('create()', () => {
    const dto: Superheroe = {
      id: 0,
      name: 'Flash',
      realName: 'Barry Allen',
      universe: 'DC',
      powers: ['Supervelocidad'],
      year: '1956',
    };

    it('debe crear un superhéroes', fakeAsync(() => {
      const before = service.totalHeroes();
      service.create(dto).subscribe();
      tick(400);
      expect(service.totalHeroes()).toBe(before + 1);
    }));

    it('debe asignar un id único al nuevo superhéroes', fakeAsync(() => {
      let h1: Superheroe | undefined, h2: Superheroe | undefined;
      service.create({ ...dto, name: 'HERO_A' }).subscribe(h => (h1 = h));
      tick(400);
      service.create({ ...dto, name: 'HERO_B' }).subscribe(h => (h2 = h));
      tick(400);
      expect(h1!.id).not.toBe(h2!.id);
    }));
  });

  //Actualizar un heroe existente
  describe('update()', () => {
    it('debe actualizar los campos del superhéroes existentes', fakeAsync(() => {
      let updated: Superheroe | undefined;
      service.update(1, { realName: 'Kal-El' }).subscribe(h => (updated = h));
      tick(400);
      expect(updated!.realName).toBe('Kal-El');
    }));

    it('debe poner en mayúsculas el nombre al actualizar', fakeAsync(() => {
      let updated: Superheroe | undefined;
      service.update(1, { name: 'superclark' }).subscribe(h => (updated = h));
      tick(400);
      expect(updated!.name).toBe('SUPERCLARK');
    }));

    it('debe mostrar un error cuando el id no existe', fakeAsync(() => {
      let errored = false;
      service.update(999, { realName: 'X' }).subscribe({ error: () => (errored = true) });
      tick(0);
      expect(errored).toBe(true);
    }));
  });

  //Eliminar un heroe existente
  describe('delete()', () => {
    it('debe eliminar el superhéroes', fakeAsync(() => {
      const before = service.totalHeroes();
      service.delete(1).subscribe();
      tick(400);
      expect(service.totalHeroes()).toBe(before - 1);
    }));

    it('debe mostrar un error cuando el id no existe', fakeAsync(() => {
      let errored = false;
      service.delete(999).subscribe({ error: () => (errored = true) });
      tick(0);
      expect(errored).toBe(true);
    }));
  });
});
