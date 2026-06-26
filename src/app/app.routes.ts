import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'superheroes',
    pathMatch: 'full',
  },
  {
    path: 'superheroes',
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './features/superheroes/components/superheroe-list/superheroe-list.component'
          ).then(m => m.SuperheroeListComponent),
        title: 'Superhéroes',
      },
      {
        path: 'new',
        loadComponent: () =>
          import(
            './features/superheroes/components/superheroe-form/superheroe-form.component'
          ).then(m => m.SuperheroeFormComponent),
        title: 'Nuevo héroe',
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import(
            './features/superheroes/components/superheroe-form/superheroe-form.component'
          ).then(m => m.SuperheroeFormComponent),
        title: 'Editar héroe',
      },
      {
        path: 'detail/:id',
        loadComponent: () =>
          import(
            './features/superheroes/components/superheroe-form/superheroe-form.component'
          ).then(m => m.SuperheroeFormComponent),
        title: 'Detalle héroe',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'superheroes',
  },
];
