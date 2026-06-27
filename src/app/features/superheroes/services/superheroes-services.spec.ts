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
    it('Debe devolver todos los superheroes', fakeAsync(() => {
      let heroes: Superheroe[] = [];
      service.getAll().subscribe(h => (heroes = h));
      tick(400);
      expect(heroes.length).toBeGreaterThan(0);
    }));

    it('Debe devolver una copia, no la referencia interna', fakeAsync(() => {
      let heroes: Superheroe[] = [];
      service.getAll().subscribe(h => (heroes = h));
      tick(400);
      heroes[0].name = 'MUTATED';
      expect(service.heroes()[0].name).not.toBe('MUTATED');
    }));
  });

  // Obtener un heroe por id
  describe('getById()', () => {
    it('Debe devolver el superheroe con el id dado', fakeAsync(() => {
      let hero: Superheroe | undefined;
      service.getById(1).subscribe(h => (hero = h));
      tick(400);
      expect(hero).toBeDefined();
      expect(hero!.id).toBe(1);
    }));

    it('Debe lanzar un error cuando el id no existe', fakeAsync(() => {
      let errored = false;
      service.getById(999).subscribe({ error: () => (errored = true) });
      tick(0);
      expect(errored).toBe(true);
    }));
  });

  // Buscar heroes por nombre
  describe('searchByName()', () => {
    it('debe devolver todos los heroes que contienen el término', fakeAsync(() => {
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
});
