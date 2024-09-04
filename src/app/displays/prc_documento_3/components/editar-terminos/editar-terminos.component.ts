import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FacturaService } from '../../services/factura.service';
import { NotificationsService } from 'src/app/services/notifications.service';

@Component({
  selector: 'app-editar-terminos',
  templateUrl: './editar-terminos.component.html',
  styleUrls: ['./editar-terminos.component.scss']
})
export class EditarTerminosComponent {


  isLoading: boolean = false; //pantalla de carga

  constructor(
    public dialogRef: MatDialogRef<EditarTerminosComponent>,
    public facturaService: FacturaService,
    private _notificationsService: NotificationsService,

  ) {


  }

  //cerrar dialogo
  closeDialog(): void {
    this.dialogRef.close();
  }

  editar(index: number) {
    this._notificationsService.editTerm(index);
  }

}
