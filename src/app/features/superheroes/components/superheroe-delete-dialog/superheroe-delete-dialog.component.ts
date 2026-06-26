import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

export interface DeleteDialogData {
  heroName: string;
}

@Component({
  selector: 'app-superheroe-delete-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Eliminar superhéroe</h2>

    <mat-dialog-content>
      <p>
        ¿Estás seguro de que deseas eliminar a
        <strong>{{ data.heroName }}</strong>?
      </p>
      <p class="warn-text">Esta acción no se puede deshacer.</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="warn" [mat-dialog-close]="true">
        Eliminar
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .warn-text {
      color: #f44336;
      font-size: 0.85rem;
      margin-top: 4px;
    }
    mat-dialog-content p {
      margin: 0 0 8px;
    }
  `,
})
export class SuperheroeDeleteDialogComponent {
  readonly data = inject<DeleteDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<SuperheroeDeleteDialogComponent>);
}
