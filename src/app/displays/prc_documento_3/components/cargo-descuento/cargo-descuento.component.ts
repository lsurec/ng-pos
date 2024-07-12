import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TraInternaInterface } from '../../interfaces/tra-interna.interface';
import { NotificationsService } from 'src/app/services/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { FacturaService } from '../../services/factura.service';

@Component({
  selector: 'app-cargo-descuento',
  templateUrl: './cargo-descuento.component.html',
  styleUrls: ['./cargo-descuento.component.scss']
})
export class CargoDescuentoComponent {

  isLoading: boolean = false;
  transacciones: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<CargoDescuentoComponent>,
    @Inject(MAT_DIALOG_DATA) public index: number,
    private _notificationsService: NotificationsService,
    private _translate: TranslateService,
    public facturaService: FacturaService,

  ) {
  }

  //cerrar dialogo
  closeDialog(): void {
    this.dialogRef.close();
  }


  async eliminar() {
    let traCheks: TraInternaInterface[] = this.facturaService.traInternas[this.index].operaciones.filter((transaction) => transaction.isChecked);

    if (traCheks.length == 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.seleccionar'));
      return
    }

    let verificador: boolean = await this._notificationsService.openDialogActions(
      {
        title: this._translate.instant('pos.alertas.eliminar'),
        description: this._translate.instant('pos.alertas.perderDatos'),
        verdadero: this._translate.instant('pos.botones.aceptar'),
        falso: this._translate.instant('pos.botones.cancelar'),
      }
    );

    if (!verificador) return;

    // Realiza la lógica para eliminar los pagos seleccionados, por ejemplo:
    this.facturaService.traInternas[this.index].operaciones = this.facturaService.traInternas[this.index].operaciones.filter((transactions) => !transactions.isChecked);

    this.facturaService.calculateTotales();

    this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.transaccionesEliminadas'));

    this.transacciones = false;
  }

  seleccionar() {
    this.facturaService.traInternas[this.index].operaciones.forEach(element => {
      element.isChecked = this.transacciones;
    });

  }

}
