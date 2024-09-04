import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ErrorLogInterface } from 'src/app/interfaces/error-log.interface';
import { NotificationsService } from 'src/app/services/notifications.service';

@Component({
  selector: 'app-detalle-error',
  templateUrl: './detalle-error.component.html',
  styleUrls: ['./detalle-error.component.scss']
})
export class DetalleErrorComponent {

  isLoading: boolean = false; //pantalla de carga
  error?: ErrorLogInterface;

  constructor(
    public dialogRef: MatDialogRef<DetalleErrorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ErrorLogInterface,
  ) {

    this.error = data;

  }


  ngOnInit(): void {
  }

  //cerrar dialogo
  closeDialog(): void {
    this.dialogRef.close();
  }

}
