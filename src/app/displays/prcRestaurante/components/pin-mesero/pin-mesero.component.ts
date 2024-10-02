import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DialogActionInterface } from 'src/app/interfaces/dialog-actions.interface';
import { GlobalRestaurantService } from '../../services/global-restaurant.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { RestaurantService } from '../../services/restaurant.service';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ApiService } from 'src/app/services/api.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { WaiterInterface } from '../../interfaces/waiter.interface';

@Component({
  selector: 'app-pin-mesero',
  templateUrl: './pin-mesero.component.html',
  styleUrls: ['./pin-mesero.component.scss'],
  providers: [
    RestaurantService,
  ]
})
export class PinMeseroComponent {

  token: string = PreferencesService.token; //usuario de la sesion
  empresa: EmpresaInterface = PreferencesService.empresa; //empresa de la sesion0

  constructor(
    //Declaracion de variables privadas
    private translate: TranslateService,
    public dialogRef: MatDialogRef<PinMeseroComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogActionInterface,
    public restaurantService: GlobalRestaurantService,
    private _restaurantService: RestaurantService,
    private _notificationService: NotificationsService,

  ) {

  }

  async guardar() {

    if (!this.restaurantService.pinMesero) {
      //TODO: traducir
      this._notificationService.openSnackbar(this.translate.instant('Ingrese Pin'));
      return
    }

    this.restaurantService.isLoading = true;

    await this.loadPin();

    this.restaurantService.isLoading = false;

    if (!this.restaurantService.waiter) return;

    this.restaurantService.viewRestaurant = true;
    this.restaurantService.viewLocations = false;

    this.dialogRef.close();

    this.restaurantService.pinMesero = "";

  }

  cancelar() {
    this.restaurantService.pinMesero = "";
    this.dialogRef.close();

  }

  async loadPin(): Promise<boolean> {

    this.restaurantService.waiter = undefined;

    const api = () => this._restaurantService.getAccountPin(
      this.token,
      this.empresa.empresa,
      "123" //TODO:Parametrizar pin
    );

    let res: ResApiInterface = await ApiService.apiUse(api);

    //si algo salio mal
    if (!res.status) {
      // TODO:Ver error
      // this.showError(res);

      return false;
    }

    let waiters: WaiterInterface[] = res.response;


    if (waiters.length == 0) {

      this._notificationService.openSnackbar("Pin invalido"); //TODO:Translate

      return false;
    }

    this.restaurantService.waiter = waiters[0];

    return true;
  }
}
