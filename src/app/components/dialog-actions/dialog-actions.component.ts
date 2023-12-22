import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DialogActionInterface } from 'src/app/interfaces/dialog-actions';

@Component({
  selector: 'app-dialog-actions',
  templateUrl: './dialog-actions.component.html',
  styleUrls: ['./dialog-actions.component.scss']
})
export class DialogActionsComponent {

  constructor(
    //Declaracion de variables privadas
    private translate: TranslateService,
    public dialogRef: MatDialogRef<DialogActionsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogActionInterface
  ) {
    //si hay dialogo
    if (!data.verdadero) {
      data.verdadero = this.translate.instant('pos.botones.aceptar');
    }
    //sino hay dialogo
    if (!data.falso) {
      data.falso = this.translate.instant('pos.botones.cancelar');
    }
  }
}
