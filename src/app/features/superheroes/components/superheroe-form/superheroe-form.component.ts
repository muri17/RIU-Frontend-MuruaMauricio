import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { SuperheroesServices } from '../../services/superheroes-services';
import { LoadingService } from '../../../../core/services/loading-service';
import { UppercaseInputDirective } from '../../../../shared/directives/uppercase-input.directive';



@Component({
  selector: 'app-superheroe-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    UppercaseInputDirective
  ],
  templateUrl: './superheroe-form.component.html',
  styleUrl: './superheroe-form.component.scss',
})
export class SuperheroeFormComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly heroesService = inject(SuperheroesServices);
  private readonly snackBar = inject(MatSnackBar);
  private readonly route = inject(ActivatedRoute);
  readonly loadingService = inject(LoadingService);

  readonly universe = ['Marvel', 'DC', 'Other'] as const;
  readonly defaultImg = 'assets/images/hero-placeholder.svg';

  readonly isEditMode = signal(false);
  readonly isViewMode = signal(false);

  form!: FormGroup;

  ngOnInit(): void {
    this.buildForm();

    const id = this.route.snapshot.paramMap.get('id');
    const path = this.route.snapshot.routeConfig?.path ?? '';

    if (id) {
      const numId = Number.parseInt(id);
      this.loadHeroe(numId);

      if (path.startsWith('detail')) {
        this.isViewMode.set(true);
      } else {
        this.isEditMode.set(true);
      }
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      realName: ['', Validators.required],
      universe: ['Marvel', Validators.required],
      powers: ['', Validators.required],
      year: [
        '',
        [Validators.required, Validators.pattern(/^\d{4}$/)],
      ],
      img: [''],
    });
  }

  private loadHeroe(id: number): void {
    this.loadingService.show();
    this.heroesService
      .getById(id)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe({
        next: hero => {
          this.form.patchValue({
            ...hero,
            powers: hero.powers.join(', '),
          });
          if (this.isViewMode()) this.form.disable();
        },
        error: () => {
          this.snackBar.open('Héroe no encontrado', 'Cerrar', { duration: 3000 });
          this.goBack();
        },
      });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const powers: string[] = raw.powers
      .split(',')
      .map((p: string) => p.trim())
      .filter(Boolean);

    const id = this.isEditMode() ? this.route.snapshot.paramMap.get('id') : null;
    const action$ = id
      ? this.heroesService.update(Number.parseInt(id), { ...raw, powers })
      : this.heroesService.create({ ...raw, powers });

    this.loadingService.show();
    action$
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe({
        next: () => {
          this.snackBar.open(
            this.isEditMode() ? 'Héroe actualizado ✓' : 'Héroe creado ✓',
            'OK',
            { duration: 2500 },
          );
          this.goBack();
        },
        error: (err: Error) =>
          this.snackBar.open(err.message ?? 'Error inesperado', 'Cerrar', {
            duration: 4000,
          }),
      });
  }

  //Obtener los mensajes de error para los campos del formulario
  get nameError(): string {
    const c = this.form.get('name');
    if (c?.hasError('required')) return 'El nombre es obligatorio';
    if (c?.hasError('minlength')) return 'Mínimo 2 caracteres';
    return '';
  }

  //Obtener los mensajes de error para el campo año del formulario
  get yearError(): string {
    const c = this.form.get('year');
    if (c?.hasError('required')) return 'El año es obligatorio';
    if (c?.hasError('pattern')) return 'Debe ser un año de 4 dígitos (ej: 1962)';
    return '';
  }

  //Mostrar imagen default si la imagen del superheroe no carga
  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultImg;
  }

  goBack(): void {
    this.router.navigate(['/superheroes']);
  }
}
