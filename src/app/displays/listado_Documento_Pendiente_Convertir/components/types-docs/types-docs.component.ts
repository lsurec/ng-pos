import { Component } from '@angular/core';
import { GlobalConvertService } from '../../services/global-convert.service';
import { components } from 'src/app/providers/componentes.provider';
import { EventService } from 'src/app/services/event.service';
import { TypesDocConvertInterface } from '../../interfaces/types-doc-convert.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ReceptionService } from '../../services/reception.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { DataUserService } from 'src/app/displays/prc_documento_3/services/data-user.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationsService } from 'src/app/services/notifications.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-types-docs',
  templateUrl: './types-docs.component.html',
  styleUrls: ['./types-docs.component.scss']
})
export class TypesDocsComponent {

  user: string = PreferencesService.user; //Usuario de la sesion
  token: string = PreferencesService.token; //token de la sesion


  constructor(
    //isntancias del servicio
    public globalConvertSrevice: GlobalConvertService,
    private _eventService: EventService,
    private _receptionService: ReceptionService,
    public dataUserService:DataUserService,
    private _notificationsService: NotificationsService,
    private _translate: TranslateService,
  ) {

  }

  //cargar datos iniciales
  async loadData() {

    //limpiar datos previos
    this.globalConvertSrevice.docs = [];

    //inciiar proceso
    this.globalConvertSrevice.isLoading = true;

    const apiTiposDoc = ()=> this._receptionService.getTiposDoc(
      this.user,
      this.token,
    );

    //consumo del servicio para obtener los tipos de documentos disponibles
    let res: ResApiInterface = await  ApiService.apiUse(apiTiposDoc);

    //Finalizar proceso
    this.globalConvertSrevice.isLoading = false;

    //si el sercico falló
    if (!res.status) {
      this.showError(res);
     return;
    }

      //Respuesta del servicio 
    this.globalConvertSrevice.docs = res.response;

  }

  //regresear a menu (pantalla de inicio)
  goBack(): void {
    components.forEach(element => {
      element.visible = false;
    });

    this._eventService.emitCustomEvent(false);
  }

  //ir a vista douemntos origen (pendientes de recepcionar)
  async goOrigin(doc: TypesDocConvertInterface) {

    this.globalConvertSrevice.docSelect = doc;
    await this.loadDocsOrign();
    this.globalConvertSrevice.mostrarDocOrigen();
    this.globalConvertSrevice.screen = "";
  }


  //caragr docuemntos origen (pendientes de recpecionar)
  async loadDocsOrign() {
    //inciar proceso 
    this.globalConvertSrevice.isLoading = true;
    
    //limpiar datos previso
    this.globalConvertSrevice.docsOrigin = [];

    //fecha del usuario
    let today: Date = new Date();

    //obtener fechas con formato valido para el servico 
    this.globalConvertSrevice. fechaInicial = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };
    this.globalConvertSrevice.fechaFinal = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };

    const apiDocOrigen = ()=> this._receptionService.getPendindgDocs(
      this.user,
      this.token,
      this.globalConvertSrevice.docSelect!.tipo_Documento,
      this.globalConvertSrevice.formatStrFilterDate(this.globalConvertSrevice.fechaInicial!),
      this.globalConvertSrevice.formatStrFilterDate(this.globalConvertSrevice.fechaFinal!),
      "",
    );

    //Consumo del servixio para obtener documents pendientes de recepcionar
    let res: ResApiInterface = await ApiService.apiUse(apiDocOrigen);

    //Finalizar proceoso
    this.globalConvertSrevice.isLoading = false;

      //Si el servicio falló mostrar mensaje
    if (!res.status) {
     this.showError(res);
      return;
    }

      //asigar erespuestas del servicio 
    this.globalConvertSrevice.docsOrigin = res.response;
    this.globalConvertSrevice.docsOriginFilter = res.response;

  }

  //mostrar error
  async showError(res: ResApiInterface) {

    //dialofo de confirmmacion
    let verificador = await this._notificationsService.openDialogActions(
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

    //guardrad error
    PreferencesService.error = error;

    //ver pantalla de rror
    this.globalConvertSrevice.mostrarError(9);
  }
}