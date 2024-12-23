import { Component, OnInit } from '@angular/core';
import { GlobalRestaurantService } from '../../services/global-restaurant.service';
import { ClassificationRestaurantInterface } from '../../interfaces/classification-restaurant.interface';
import { RestaurantService } from '../../services/restaurant.service';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ApiService } from 'src/app/services/api.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { FacturaService } from 'src/app/displays/prc_documento_3/services/factura.service';
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { TranslateService } from '@ngx-translate/core';
import { NotificationsService } from 'src/app/services/notifications.service';
import { LoadRestaurantService } from '../../services/load.restaurant.service';

@Component({
  selector: 'app-classifications',
  templateUrl: './classifications.component.html',
  styleUrls: ['./classifications.component.scss']
})
export class ClassificationsComponent implements OnInit {

  constructor(
    public restaurantService: GlobalRestaurantService,
    private _restaurantService: RestaurantService,
    private _facturaService: FacturaService,
    private _notificationService: NotificationsService,
    private _translate: TranslateService,
    private _loadRestaurantService: LoadRestaurantService,

  ) {
  }


  ngOnInit(): void {
    this.loadData();

    this._loadRestaurantService.classifications$.subscribe(() => {
      this.loadData();
    });
  }


  user: string = PreferencesService.user; //usuario de la sesion
  token: string = PreferencesService.token; //usuario de la sesion
  empresa: EmpresaInterface = PreferencesService.empresa; //empresa de la sesion0
  estacion: EstacionInterface = PreferencesService.estacion; //estacion de la sesion
  tipoCambio: number = PreferencesService.tipoCambio; ///tipo cambio disponioble
  tipoDocumento: number = this._facturaService.tipoDocumento!; //Tipo de documento del modulo



  async loadData(){
    this.restaurantService.isLoading = true;
    await this.loadClassifications();
    this.restaurantService.isLoading = false;
  }


  async loadClassifications(): Promise<boolean> {

    this.restaurantService.classifications = [];
    this.restaurantService.classification = undefined;


    const api = () => this._restaurantService.getClassifications(
      this.tipoDocumento,
      this.empresa.empresa,
      this.estacion.estacion_Trabajo,
      this.restaurantService.serie!.serie_Documento,
      this.user,
      this.token,
    );

    let res: ResApiInterface = await ApiService.apiUse(api);

    //si algo salio mal
    if (!res.status) {
      this.showError(res);

      return false;
    }
 

    this.restaurantService.classifications = res.response;



    if (this.restaurantService.classifications.length == 1)
      this.restaurantService.classification = this.restaurantService.classifications[0];


    return true;
  }

  selectClassification(clasification: ClassificationRestaurantInterface) {
    this.restaurantService.classification = clasification;
    this.restaurantService.idPantalla = 2; //Productos
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

    this.restaurantService.verError = true;

    return;
  }

}
