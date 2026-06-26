import { TestBed } from '@angular/core/testing';

import { SuperheroesServices } from './superheroes-services';

describe('SuperheroesServices', () => {
  let service: SuperheroesServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuperheroesServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
