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
      }
    ],
  },
  {
    path: '**',
    redirectTo: 'superheroes',
  },
];
