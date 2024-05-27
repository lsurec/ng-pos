import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { FacturaService } from 'src/app/displays/prc_documento_3/services/factura.service';
import { DialogActionInterface } from 'src/app/interfaces/dialog-actions.interface';
import { PreferencesService } from 'src/app/services/preferences.service';

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
    @Inject(MAT_DIALOG_DATA) public data: DialogActionInterface,
    public facturaService: FacturaService,
  ) {
    //si no hay texto en el boton
    if (!data.verdadero) {
      data.verdadero = this.translate.instant('pos.botones.aceptar');
    }
    //sino hay tetxo para el boton
    if (!data.falso) {
      data.falso = this.translate.instant('pos.botones.cancelar');
    }
  }

  //guardar el valor del CheckBox en las preferencias
  ocultar() {
    this.facturaService.noMostrar = !this.facturaService.noMostrar;

    if (!this.facturaService.noMostrar) {
      PreferencesService.noMostrarAlerta = 0;
    } else if (this.facturaService.noMostrar) {
      PreferencesService.noMostrarAlerta = 1;
    }
  }
}
