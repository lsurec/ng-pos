import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { NotificationsService } from 'src/app/services/notifications.service';

@Component({
  selector: 'app-permisions',
  templateUrl: './permisions.component.html',
  styleUrls: ['./permisions.component.scss']
})
export class PermisionsComponent {

  clave: string = "";
  nombre: string = "";


  constructor(
    private _translate: TranslateService,
    public dialogRef: MatDialogRef<PermisionsComponent>,
    private _notificationService: NotificationsService,
  ) {
  }


  cancelar() {
    this.clave = "";
    this.nombre = "";
    this.dialogRef.close();
  }

  ingresar() {
    //Sino hay usuario ni contrase;a mostrar notificacion de que debe completar
    if (!this.nombre || !this.clave) {
      this._notificationService.openSnackbar(this._translate.instant('pos.alertas.completar'));
      return
    }

    this.dialogRef.close(true);
  }

}
