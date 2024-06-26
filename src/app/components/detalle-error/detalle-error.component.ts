import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { NotificationsService } from 'src/app/services/notifications.service';

@Component({
  selector: 'app-detalle-error',
  templateUrl: './detalle-error.component.html',
  styleUrls: ['./detalle-error.component.scss']
})
export class DetalleErrorComponent {

  isLoading: boolean = false; //pantalla de carga

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public dialogRef: MatDialogRef<DetalleErrorComponent>,
  ) {

  }


  ngOnInit(): void {
  }

  //cerrar dialogo
  closeDialog(): void {
    this.dialogRef.close();
  }

}
