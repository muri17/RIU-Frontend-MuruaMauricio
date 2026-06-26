import { Injectable, signal } from '@angular/core';
import { Superheroe } from '../../shared/models/superheroe';
import { delay, Observable, of } from 'rxjs';

//Simular latencia del backend
const DELAY_MS = 400;

//Datos de ejemplo para poblar la lista de superhéroes
const SEED_HEROES: Superheroe[] = [
{
      id: 1,
      name: 'SUPERMAN',
      realName: 'Clark Kent',
      universe: 'DC',
      powers: ['Superfuerza', 'Vuelo', 'Visión de rayos X', 'Invulnerabilidad'],
      year: '1938',
      img: 'https://tse2.mm.bing.net/th/id/OIP.ePU8xOz89xVVrAEWN-AcFQHaKf?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
    },
    {
      id: 2,
      name: 'BATMAN',
      realName: 'Bruce Wayne',
      universe: 'DC',
      powers: ['Inteligencia superior', 'Artes marciales', 'Tecnología avanzada'],
      year: '1939',
      img: 'https://tse2.mm.bing.net/th/id/OIP.lE1UVY-ruQM2tby_53DdPAHaGf?r=0&w=1207&h=1058&rs=1&pid=ImgDetMain&o=7&rm=3',
    },
    {
      id: 3,
      name: 'SPIDERMAN',
      realName: 'Peter Parker',
      universe: 'Marvel',
      powers: ['Trepar paredes', 'Sentido arácnido', 'Telarañas'],
      year: '1962',
      img: 'https://th.bing.com/th/id/R.988376269f2e330401b460f3c5d9b0a6?rik=0rwIsZ1CKXS7Lg&pid=ImgRaw&r=0',
    },
    {
      id: 4,
      name: 'WONDER WOMAN',
      realName: 'Diana Prince',
      universe: 'DC',
      powers: ['Superfuerza', 'Vuelo', 'Lazo de la verdad'],
      year: '1941',
      img: 'https://tse2.mm.bing.net/th/id/OIP.JmM6_evaPfXAwUtf2LL67gHaEo?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
    },
    {
      id: 5,
      name: 'IRON MAN',
      realName: 'Tony Stark',
      universe: 'Marvel',
      powers: ['Armadura tecnológica', 'Inteligencia superior', 'Vuelo'],
      year: '1963',
      img: 'https://th.bing.com/th/id/R.e74965c7ebb43859454bb9c6fb8ffea7?rik=wNi%2fBRzZYK%2fIeg&pid=ImgRaw&r=0',
    },
    {
      id: 6,
      name: 'CAPTAIN AMERICA',
      realName: 'Steve Rogers',
      universe: 'Marvel',
      powers: ['Superfuerza aumentada', 'Escudo de vibranium', 'Agilidad'],
      year: '1941',
      img: 'https://vignette.wikia.nocookie.net/disney/images/f/fa/Captain-America-AOU-Render.png/revision/latest/scale-to-width-down/2000?cb=20180420015558&path-prefix=es',
    },
    {
      id: 7,
      name: 'THOR',
      realName: 'Thor Odinson',
      universe: 'Marvel',
      powers: ['Control del trueno', 'Mjolnir', 'Superfuerza', 'Vuelo'],
      year: '1962',
      img: 'https://i.pinimg.com/originals/b3/f1/a3/b3f1a399d11e269baf2b61e1a1299e7f.jpg',
    },
];

@Injectable({
  providedIn: 'root',
})

export class SuperheroesServices {

  //Almacenamiento en memoria reactivo
  private readonly _superheroes = signal<Superheroe[]>(SEED_HEROES);

  //Consultar todos los superheroes
  getAll(): Observable<Superheroe[]> {
      return of(this._superheroes().map(h => ({ ...h }))).pipe(delay(DELAY_MS));
  }
}

