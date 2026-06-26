import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
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
import { SuperheroesServices } from '../../../../core/services/superheroes-services';


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
  ],
  templateUrl: './superheroe-form.component.html',
  styleUrl: './superheroe-form.component.scss',
})
export class SuperheroeFormComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly heroesService = inject(SuperheroesServices);
  private readonly snackBar = inject(MatSnackBar);

  readonly universe = ['Marvel', 'DC', 'Other'] as const;

  form!: FormGroup;

  ngOnInit(): void {
    this.buildForm();
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

  onSubmit(): void {
    const raw = this.form.getRawValue();
    const powers: string[] = raw.powers
      .split(',')
      .map((p: string) => p.trim())
      .filter(Boolean);

    const dto = { ...raw, powers };

    this.heroesService.create(dto).subscribe({
      next: () => {
        this.snackBar.open('Héroe creado ✓', 'OK', { duration: 2500 });
        this.goBack();
      },
      error: (err: Error) =>
        this.snackBar.open(err.message ?? 'Error inesperado', 'Cerrar', {
          duration: 4000,
        }),
    });
  }

  goBack(): void {
    this.router.navigate(['/superheroes']);
  }
}
