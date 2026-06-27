import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, switchMap, takeUntil } from 'rxjs';

import { SuperheroesServices } from '../../services/superheroes-services';
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
    MatPaginatorModule,
  ],
  templateUrl: './superheroe-list.component.html',
  styleUrls: ['./superheroe-list.component.scss'],
})
export class SuperheroeListComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private readonly heroesService = inject(SuperheroesServices);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  private readonly destroy$ = new Subject<void>();

  readonly dataSource = new MatTableDataSource<Superheroe>();
  readonly displayedColumns = ['name', 'realName', 'universe', 'year', 'actions'] as const;
  readonly defaultImg = 'assets/images/hero-placeholder.svg';
  readonly searchControl = new FormControl('');


  //Mostrar imagen default si la imagen del superheroe no carga
  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultImg;
  }

  //Inicializar el componente y cargar la lista de superhéroes
  ngOnInit(): void {
    this.loadHeroes();
    this.listenToSearch();
  }

  //Destruir el componente y limpiar los recursos
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  //Cargar la lista de superhéroes desde el servicio
  private loadHeroes(): void {
    this.heroesService
      .getAll()
      .subscribe(heroes => {
        this.applyData(heroes);
      });
  }

  //Buscar superhéroes por nombre y actualizar la lista
  private listenToSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(query => {
          const source$ = query?.trim()
            ? this.heroesService.searchByName(query.trim())
            : this.heroesService.getAll();
          return source$;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe(heroes => this.applyData(heroes));
  }

  //Aplicar los datos de superhéroes a la fuente de datos de la tabla
  private applyData(heroes: Superheroe[]): void {
    this.dataSource.data = heroes;
    // Asignar el paginador a la fuente de datos después de que se haya renderizado la vista
    setTimeout(() => {
      if (this.paginator) this.dataSource.paginator = this.paginator;
    });
  }

  // Navegar a la página de creación de un nuevo superhéroe
  navigateToCreate(): void {
    this.router.navigate(['/superheroes/new']);
  }

  // Navegar a la página de edición de un superhéroe existente
  navigateToEdit(heroe: Superheroe): void {
    this.router.navigate(['/superheroes/edit', heroe.id]);
  }

  // Navegar a la página de detalle de un superhéroe
  navigateToDetail(heroe: Superheroe): void {
    this.router.navigate(['/superheroes/detail', heroe.id]);
  }

  // Abrir un diálogo de confirmación para eliminar un superhéroe
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

  // Limpiar el campo de búsqueda y mostrar todos los superhéroes
  clearSearch(): void {
    this.searchControl.setValue('');
  }
}

