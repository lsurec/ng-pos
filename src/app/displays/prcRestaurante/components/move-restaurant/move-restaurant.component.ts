import { Component, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { GlobalRestaurantService } from '../../services/global-restaurant.service';
import { TableInterface } from '../../interfaces/table.interface';
import { LocationInterface } from '../../interfaces/location.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { TranslateService } from '@ngx-translate/core';
import { RestaurantService } from '../../services/restaurant.service';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { FacturaService } from 'src/app/displays/prc_documento_3/services/factura.service';
import { ApiService } from 'src/app/services/api.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { OrderInterface } from '../../interfaces/order.interface';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-move-restaurant',
  templateUrl: './move-restaurant.component.html',
  styleUrls: ['./move-restaurant.component.scss']
})
export class MoveRestaurantComponent {

  @ViewChild('stepper') stepper?: MatStepper;

  user: string = PreferencesService.user; //usuario de la sesion
  token: string = PreferencesService.token; //usuario de la sesion
  empresa: EmpresaInterface = PreferencesService.empresa; //empresa de la sesion0
  estacion: EstacionInterface = PreferencesService.estacion; //estacion de la sesion
  tipoCambio: number = PreferencesService.tipoCambio; ///tipo cambio disponioble
  tipoDocumento: number = this._facturaService.tipoDocumento!; //Tipo de documento del modulo

  formNewLocation = this._formBuilder.group({
  });

  formNewTable = this._formBuilder.group({
  });

  formConfirm = this._formBuilder.group({
  });

  isEditable = true;

  //nuevas variables traslado
  newLocation?: LocationInterface; //nueva ubicacion
  newTable?: TableInterface; // nueva mesa
  indexNewCheck: number = -1; //nueva cuenta

  constructor(
    private _translate: TranslateService,
    private _formBuilder: FormBuilder,
    public restaurantService: GlobalRestaurantService,
    private _restaurantService: RestaurantService,
    private _facturaService: FacturaService,
    private _notificationService: NotificationsService,
  ) {

  }

  async selectLocation(location: LocationInterface) {

    if (location == this.newLocation) {
      return;
    }

    this.newLocation = location;

    this.restaurantService.isLoading = true;
    await this.loadTables();
    this.restaurantService.isLoading = false;
    this.stepper!.next();
  }

  selectTable(table: TableInterface) {
    this.newTable = table;
    this.stepper!.next();
  }

  async loadTables(): Promise<boolean> {

    this.restaurantService.tables = [];

    const api = () => this._restaurantService.getTables(
      this.tipoDocumento,
      this.empresa.empresa,
      this.estacion.estacion_Trabajo,
      this.restaurantService.serie!.serie_Documento,
      this.newLocation!.elemento_Asignado, //Nueva ubicacion seleccionada
      this.user,
      this.token,
    );


    let res: ResApiInterface = await ApiService.apiUse(api);

    //si algo salio mal
    if (!res.status) {

      this.showError(res);

      return false;
    }

    this.restaurantService.tables = res.response;

    if (this.restaurantService.tables.length == 1)
      this.newTable = this.restaurantService.tables[0];

    this.restaurantService.updateOrdersTable();

    return true;


  }

  async showError(res: ResApiInterface) {

    //Diaogo de confirmacion
    let verificador = await this._notificationService.openDialogActions(
      {
        title: this._translate.instant('pos.alertas.salioMal'),
        description: this._translate.instant('pos.alertas.error'),
        verdadero: this._translate.instant('pos.botones.informe'),
        falso: this._translate.instant('pos.botones.aceptar'),
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

  selectCheck(index: number) {
    this.indexNewCheck = index;
    this.stepper!.next();
  }

  async newCheck() {
    let nombre: string = await this._notificationService.newCheck();

    if (nombre) {

      this.restaurantService.orders.push(
        {
          consecutivo: 0,
          consecutivoRef: 0,
          mesa: this.newTable!,
          mesero: this.restaurantService.waiter!,
          nombre: nombre,
          selected: false,
          transacciones: [],
          ubicacion: this.newLocation!,
        }

      );

      this._notificationService.openSnackbar("Cuenta creada."); //TODO:Translate

      this.restaurantService.updateOrdersTable();
    }
  }

  cancelar() {
    this.stepper!.reset()
    this.indexNewCheck = -1;
    this.newTable = undefined;
    this.newLocation = undefined;
  }

  confirmar() {
    //realizar el traslado de la transaccion
  }

}
