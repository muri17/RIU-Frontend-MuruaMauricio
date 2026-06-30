import { TestBed } from '@angular/core/testing';
import { lastValueFrom } from 'rxjs';

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
    it('debe devolver todos los superhéroes', async () => {
      const heroes = await lastValueFrom(service.getAll());
      expect(heroes.length).toBeGreaterThan(0);
    });

    it('debe devolver una copia, no la referencia interna', async () => {
      const heroes = await lastValueFrom(service.getAll());
      heroes[0].name = 'MUTATED';
      const fresh = await lastValueFrom(service.getAll());
      expect(fresh[0].name).not.toBe('MUTATED');
    });
  });

  // Obtener un heroe por id
  describe('getById()', () => {
    it('debe devolver el superhéroes con el id dado', async () => {
      const hero = await lastValueFrom(service.getById(1));
      expect(hero).toBeDefined();
      expect(hero.id).toBe(1);
    });

    it('debe lanzar un error cuando el id no existe', async () => {
      await expect(lastValueFrom(service.getById(999))).rejects.toThrow();
    });
  });

  // Buscar heroes por nombre
  describe('searchByName()', () => {
    it('debe devolver todos los superhéroes que contienen el término', async () => {
      const results = await lastValueFrom(service.searchByName('man'));
      expect(results.length).toBeGreaterThan(0);
      results.forEach(h => expect(h.name.toUpperCase()).toContain('MAN'));
    });

    it('debe ser insensible a mayúsculas y minúsculas', async () => {
      const lower = await lastValueFrom(service.searchByName('man'));
      const upper = await lastValueFrom(service.searchByName('MAN'));
      expect(lower.length).toBe(upper.length);
    });

    it('debe devolver un array vacío cuando no hay coincidencias', async () => {
      const results = await lastValueFrom(service.searchByName('zzz_no_match'));
      expect(results.length).toBe(0);
    });
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

    it('debe crear un superhéroes', async () => {
      const before = service.totalHeroes();
      await lastValueFrom(service.create(dto));
      expect(service.totalHeroes()).toBe(before + 1);
    });

    it('debe asignar un id único al nuevo superhéroes', async () => {
      const h1 = await lastValueFrom(service.create({ ...dto, name: 'HERO_A' }));
      const h2 = await lastValueFrom(service.create({ ...dto, name: 'HERO_B' }));
      expect(h1.id).not.toBe(h2.id);
    });
  });

  //Actualizar un heroe existente
  describe('update()', () => {
    it('debe actualizar los campos del superhéroes existentes', async () => {
      const updated = await lastValueFrom(service.update(1, { realName: 'Kal-El' }));
      expect(updated.realName).toBe('Kal-El');
    });

    it('debe poner en mayúsculas el nombre al actualizar', async () => {
      const updated = await lastValueFrom(service.update(1, { name: 'superclark' }));
      expect(updated.name).toBe('SUPERCLARK');
    });

    it('debe mostrar un error cuando el id no existe', async () => {
      await expect(lastValueFrom(service.update(999, { realName: 'X' }))).rejects.toThrow();
    });
  });

  //Eliminar un heroe existente
  describe('delete()', () => {
    it('debe eliminar el superhéroes', async () => {
      const before = service.totalHeroes();
      await lastValueFrom(service.delete(1));
      expect(service.totalHeroes()).toBe(before - 1);
    });

    it('debe mostrar un error cuando el id no existe', async () => {
      await expect(lastValueFrom(service.delete(999))).rejects.toThrow();
    });
  });
});