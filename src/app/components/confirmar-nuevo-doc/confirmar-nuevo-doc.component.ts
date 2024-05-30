import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { FacturaService } from 'src/app/displays/prc_documento_3/services/factura.service';
import { DialogActionInterface } from 'src/app/interfaces/dialog-actions.interface';
import { PreferencesService } from 'src/app/services/preferences.service';

@Component({
  selector: 'app-confirmar-nuevo-doc',
  templateUrl: './confirmar-nuevo-doc.component.html',
  styleUrls: ['./confirmar-nuevo-doc.component.scss']
})
export class ConfirmarNuevoDocComponent {

  constructor(
    //Declaracion de variables privadas
    private translate: TranslateService,
    public dialogRef: MatDialogRef<ConfirmarNuevoDocComponent>,
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

    if (PreferencesService.mostrarAlerta == "0") {
      facturaService.noMostrar = false;
    }

  }

  //guardar el valor del CheckBox en las preferencias
  ocultar() {
    if (this.facturaService.noMostrar) {
      PreferencesService.mostrarAlerta = "0";
    } else if (!this.facturaService.noMostrar) {
      PreferencesService.mostrarAlerta = "1";
    }
  }
}
