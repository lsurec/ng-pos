import { Component, HostListener, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DialogActionInterface } from 'src/app/interfaces/dialog-actions.interface';
import { GlobalRestaurantService } from '../../services/global-restaurant.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { RestaurantService } from '../../services/restaurant.service';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ApiService } from 'src/app/services/api.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { WaiterInterface } from '../../interfaces/waiter.interface';
import { ErrorInterface } from 'src/app/interfaces/error.interface';

@Component({
  selector: 'app-pin-mesero',
  templateUrl: './pin-mesero.component.html',
  styleUrls: ['./pin-mesero.component.scss'],
  providers: [
    RestaurantService,
  ]
})
export class PinMeseroComponent {

  pinMesero: string = "";
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

    if (!this.pinMesero) {
      //TODO: traducir
      this._notificationService.openSnackbar(this.translate.instant('Ingrese Pin'));
      return
    }

    this.restaurantService.isLoading = true;

    let res: boolean = await this.loadPin();

    if (!res) {
      this.restaurantService.isLoading = false;
      return
    };

    this.dialogRef.close();

    this.restaurantService.viewRestaurant = true;
    this.restaurantService.viewLocations = false;

    this.restaurantService.isLoading = false;
    this.restaurantService.idPantalla = 1; //Clasificaciones

    this.pinMesero = "";
  }

  cancelar() {
    this.pinMesero = "";
    this.dialogRef.close();

  }

  async loadPin(): Promise<boolean> {

    this.restaurantService.waiter = undefined;

    const api = () => this._restaurantService.getAccountPin(
      this.token,
      this.empresa.empresa,
      this.pinMesero,
    );

    let res: ResApiInterface = await ApiService.apiUse(api);

    //si algo salio mal
    if (!res.status) {
      //cerrar eldialogo y ver error
      this.dialogRef.close();

      this.showError(res);

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

  async showError(res: ResApiInterface) {

    //Diaogo de confirmacion
    let verificador = await this._notificationService.openDialogActions(
      {
        title: this.translate.instant('pos.alertas.salioMal'),
        description: this.translate.instant('pos.alertas.error'),
        verdadero: this.translate.instant('pos.botones.informe'),
        falso: this.translate.instant('pos.botones.aceptar'),
      }
    );

    //Cancelar
    if (!verificador) return;

    let dateNow: Date = new Date(); //fecha del error

    //Crear error
    let error: ErrorInterface = {
      date: dateNow,
      description: res.response,
      storeProcedure: res.storeProcedure,
      url: res.url,
    }

    //Guardar error
    PreferencesService.error = error;

    //TODO:mostrar pantalla de error

    this.restaurantService.verError = true;

    return;
  }

  //detectamos la tecla precionada
  @HostListener('document:keydown', ['$event'])
  //Manejo de eventos del declado
  handleKeyboardEvent(event: KeyboardEvent) {
    // console.log("Tecla presionada:", event.key);

    //si es enter guardar y validar el pin del mesero
    if (event.key.toLowerCase() === "enter") {
      //evita o bloquea la funcion que tiene por defecto
      event.preventDefault();
      //realiza la funcion que se necesite
      this.guardar();
    }
  }
}
