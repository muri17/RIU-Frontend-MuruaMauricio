import {
  AfterViewInit,
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, finalize, Subject, switchMap, takeUntil } from 'rxjs';

import { SuperheroesServices } from '../../services/superheroes-services';
import { Superheroe } from '../../../../shared/models/superheroe';
import { SuperheroeDeleteDialogComponent } from '../superheroe-delete-dialog/superheroe-delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadingService } from '../../../../core/services/loading-service';
import { UppercaseInputDirective } from '../../../../shared/directives/uppercase-input.directive';


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
    MatPaginatorModule,
    MatProgressSpinnerModule,
    UppercaseInputDirective
  ],
  templateUrl: './superheroe-list.component.html',
  styleUrls: ['./superheroe-list.component.scss'],
})
export class SuperheroeListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private readonly heroesService = inject(SuperheroesServices);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  readonly loadingService = inject(LoadingService);

  private readonly destroy$ = new Subject<void>();

  readonly dataSource = new MatTableDataSource<Superheroe>();
  readonly displayedColumns = ['name', 'realName', 'universe', 'year', 'actions'] as const;
  readonly defaultImg = 'assets/images/hero-placeholder.svg';
  readonly searchControl = new FormControl('');


  //Mostrar imagen default si la imagen del superheroe no carga
  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultImg;
  }

  ngOnInit(): void {
    this.loadHeroes();
    this.listenToSearch();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadHeroes(): void {
    this.loadingService.show();
    this.heroesService
      .getAll()
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe(heroes => this.applyData(heroes));
  }

  private listenToSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(query => {
          this.loadingService.show();
          const source$ = query?.trim()
            ? this.heroesService.searchByName(query.trim())
            : this.heroesService.getAll();
          return source$.pipe(finalize(() => this.loadingService.hide()));
        }),
        takeUntil(this.destroy$),
      )
      .subscribe(heroes => this.applyData(heroes));
  }

  private applyData(heroes: Superheroe[]): void {
    this.dataSource.data = heroes;
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

    ref.afterClosed()
      .pipe(
        filter(confirmed => !!confirmed),
        switchMap(() => this.heroesService.delete(hero.id)),
        takeUntil(this.destroy$),
      )
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
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }
}

