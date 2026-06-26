import {
  Component,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';

import { SuperheroesServices } from '../../../../core/services/superheroes-services';
import { Superheroe } from '../../../../shared/models/superheroe';


@Component({
  selector: 'app-superheroe-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './superheroe-list.component.html',
  styleUrls: ['./superheroe-list.component.scss'],
})
export class SuperheroeListComponent implements OnInit, OnDestroy {
  private readonly heroesService = inject(SuperheroesServices);

  private readonly destroy$ = new Subject<void>();

  readonly dataSource = new MatTableDataSource<Superheroe>();
  readonly displayedColumns = ['name', 'realName', 'universe', 'year'];

  ngOnInit(): void {
    this.loadHeroes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadHeroes(): void {
    this.heroesService
      .getAll()
      .subscribe(heroes => {
        this.dataSource.data = heroes;
      });
  }
}
