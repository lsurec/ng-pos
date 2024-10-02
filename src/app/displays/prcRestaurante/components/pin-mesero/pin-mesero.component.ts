import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DialogActionInterface } from 'src/app/interfaces/dialog-actions.interface';
import { GlobalRestaurantService } from '../../services/global-restaurant.service';
import { NotificationsService } from 'src/app/services/notifications.service';

@Component({
  selector: 'app-pin-mesero',
  templateUrl: './pin-mesero.component.html',
  styleUrls: ['./pin-mesero.component.scss']
})
export class PinMeseroComponent {


  constructor(
    //Declaracion de variables privadas
    private translate: TranslateService,
    public dialogRef: MatDialogRef<PinMeseroComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogActionInterface,
    public restaurantService: GlobalRestaurantService,
    private _notificationService: NotificationsService,

  ) {

  }

  guardar() {

    if (this.restaurantService.pinMesero.length == 0) {
      //TODO: traducir
      this._notificationService.openSnackbar(this.translate.instant('Ingrese Pin'));
      return
    }

    this.restaurantService.isLoading = true;

    this.restaurantService.viewRestaurant = true;
    this.restaurantService.viewLocations = false;

    this.dialogRef.close();

    this.restaurantService.pinMesero = "";
    this.restaurantService.isLoading = false;

  }

  cancelar() {
    this.restaurantService.pinMesero = "";
    this.dialogRef.close();

  }

}
