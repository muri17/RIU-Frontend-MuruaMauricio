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
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { SuperheroesServices } from '../../../../core/services/superheroes-services';
import { Superheroe } from '../../../../shared/models/superheroe';
import { SuperheroeDeleteDialogComponent } from '../superheroe-delete-dialog/superheroe-delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';


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
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  private readonly destroy$ = new Subject<void>();

  readonly dataSource = new MatTableDataSource<Superheroe>();
  readonly displayedColumns = ['name', 'realName', 'universe', 'year', 'actions'];
  readonly defaultImg = 'assets/images/hero-placeholder.svg';


  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultImg;
  }

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

  navigateToCreate(): void {
    this.router.navigate(['/superheroes/new']);
  }

  navigateToEdit(heroe: Superheroe): void {
    this.router.navigate(['/superheroes/edit', heroe.id]);
  }

  navigateToDetail(heroe: Superheroe): void {
    this.router.navigate(['/superheroes/detail', heroe.id]);
  }

  openDeleteDialog(hero: Superheroe): void {
    const ref = this.dialog.open(SuperheroeDeleteDialogComponent, {
      data: { heroName: hero.name },
      width: '380px',
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;

      this.heroesService
        .delete(hero.id)
        .subscribe({
          next: () => {
            this.snackBar.open(`${hero.name} eliminado`, 'OK', { duration: 2500 });
            this.loadHeroes();
          },
          error: (err: Error) =>
            this.snackBar.open(err.message ?? 'Error al eliminar', 'Cerrar', {
              duration: 4000,
            }),
        });
    });
  }
}

