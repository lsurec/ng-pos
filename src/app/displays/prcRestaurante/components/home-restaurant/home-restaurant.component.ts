import { Component, OnInit } from '@angular/core';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ApiService } from 'src/app/services/api.service';
import { RestaurantService } from '../../services/restaurant.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { FacturaService } from 'src/app/displays/prc_documento_3/services/factura.service';
import { SerieService } from 'src/app/displays/prc_documento_3/services/serie.service';
import { SerieInterface } from 'src/app/displays/prc_documento_3/interfaces/serie.interface';
import { LocationInterface } from '../../interfaces/locations.interface';
import { TableInterface } from '../../interfaces/table.interface';

@Component({
  selector: 'app-home-restaurant',
  templateUrl: './home-restaurant.component.html',
  styleUrls: ['./home-restaurant.component.scss'],
  providers: [RestaurantService]
})
export class HomeRestaurantComponent implements OnInit {


  isLoading: boolean = false;

  user: string = PreferencesService.user; //usuario de la sesion
  token: string = PreferencesService.token; //usuario de la sesion
  empresa: number = PreferencesService.empresa.empresa; //empresa de la sesion0
  estacion: number = PreferencesService.estacion.estacion_Trabajo; //estacion de la sesion
  tipoCambio: number = PreferencesService.tipoCambio; ///tipo cambio disponioble
  tipoDocumento: number = this._facturaService.tipoDocumento!; //Tipo de documento del modulo

  series: SerieInterface[] = [];
  serie?: SerieInterface;
  locations: LocationInterface[] = [];
  location?: LocationInterface;
  tables: TableInterface[] = [];
  table?: TableInterface;


  constructor(
    private _restaurantService: RestaurantService,
    private _notificationService: NotificationsService,
    private _translate: TranslateService,
    private _facturaService: FacturaService,
    private _serieService: SerieService,

  ) {

  }

  ngOnInit(): void {
    this.laodData();
  }


  async laodData() {

    this.isLoading = true;
    //cargar serie
    let resSerie: boolean = await this.loadSeries();

    //si algo salio mal
    if (!resSerie) {
      this.isLoading = false;
      return;
    };

    //Si no hay series mostrar mensaje
    if (this.series.length == 0) {

      this.isLoading = false;

      this._notificationService.openSnackbar("No existen series asignadas"); //TODO:Translate

      return;
    }

    //cargar ubicaciones
    let resLocation: boolean = await this.loadLocations();

    //Si algo salió mal
    if (!resLocation) {
      this.isLoading = false;
      return;
    };

    //Si solo hay una localizacion cargar mesas
    if (this.locations.length > 1) {
      this.isLoading = false;
      return;
    }

    //cargar mesa
    let resTable: boolean = await this.loadTables();

    //Si algo salió mal
    if (!resTable) {
      this.isLoading = false;
      return;
    };

  }

  async loadPin():Promise<boolean>{
    
    
    const api = () => this._restaurantService.getAccountPin(
      this.token,
      this.empresa,
      "123" //TODO:Parametrizar pin
     );

    let res: ResApiInterface = await ApiService.apiUse(api);

    //si algo salio mal
    if (!res.status) {
      this.showError(res);

      return false;
    }




    return true;
  }

  //TODO:Implementar Try Catch
  async loadSeries(): Promise<boolean> {

    this.series = [];

    const api = () => this._serieService.getSerie(
      this.user,
      this.token,
      this.tipoDocumento,
      this.empresa,
      this.estacion,
    );

    let res: ResApiInterface = await ApiService.apiUse(api);

    //si algo salio mal
    if (!res.status) {
      this.showError(res);

      return false;
    }

    this.series = res.response;

    //TODO:Implementar en POS
    this.serie = this.series.reduce((prev, curr) => {
      // Si `prev.orden` o `curr.orden` son nulos, asignar un valor alto o bajo para que no interfieran
      const prevOrden = prev.orden ?? Infinity;  // Asignar Infinity si es nulo
      const currOrden = curr.orden ?? Infinity;
      return (currOrden < prevOrden) ? curr : prev;
    });

    return true;

  }


  async loadLocations(): Promise<boolean> {
    const api = () => this._restaurantService.getLocations(
      this.tipoDocumento,
      this.empresa,
      this.estacion,
      this.serie!.serie_Documento,
      this.user,
      this.token,
    );


    let res: ResApiInterface = await ApiService.apiUse(api);

    //si algo salio mal
    if (!res.status) {

      this.showError(res);

      return false;
    }

    this.locations = res.response;

    if (this.locations.length == 1)
      this.location = this.locations[0];

    return true;
  }

  async loadTables(): Promise<boolean> {
    const api = () => this._restaurantService.getTables(
      this.tipoDocumento,
      this.empresa,
      this.estacion,
      this.serie!.serie_Documento,
      this.location!.elemento_Asignado,
      this.user,
      this.token,
    );


    let res: ResApiInterface = await ApiService.apiUse(api);

    //si algo salio mal
    if (!res.status) {

      this.showError(res);

      return false;
    }

    this.tables = res.response;

    if (this.tables.length == 1)
      this.table = this.tables[0];

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

    return;
  }



}
