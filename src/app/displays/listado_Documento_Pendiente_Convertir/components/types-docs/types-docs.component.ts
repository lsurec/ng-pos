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

@Component({
  selector: 'app-types-docs',
  templateUrl: './types-docs.component.html',
  styleUrls: ['./types-docs.component.scss']
})
export class TypesDocsComponent {

  user: string = PreferencesService.user; //Usuario de la sesion
  token: string = PreferencesService.token; //token de la sesion


  constructor(
    public globalConvertSrevice: GlobalConvertService,
    private _eventService: EventService,
    private _receptionService: ReceptionService,
    public dataUserService:DataUserService,
    private _notificationsService: NotificationsService,
    private _translate: TranslateService,
  ) {

  }

  async loadData() {

    this.globalConvertSrevice.docs = [];

    this.globalConvertSrevice.isLoading = true;

    let res: ResApiInterface = await this._receptionService.getTiposDoc(
      this.user,
      this.token,
    );
    this.globalConvertSrevice.isLoading = false;



    if (!res.status) {


      this.showError(res);

     return;

    }

    this.globalConvertSrevice.docs = res.response;

  }

  //regresear a menu (pantalla de inicio)
  goBack(): void {
    components.forEach(element => {
      element.visible = false;
    });

    this._eventService.emitCustomEvent(false);
  }

  async goOrigin(doc: TypesDocConvertInterface) {

    this.globalConvertSrevice.docSelect = doc;
    await this.loadDocsOrign();
    this.globalConvertSrevice.mostrarDocOrigen();
    this.globalConvertSrevice.screen = "";
  }


  async loadDocsOrign() {
    this.globalConvertSrevice.isLoading = true;
    this.globalConvertSrevice.docsOrigin = [];


    let today: Date = new Date();

    this.globalConvertSrevice. fechaInicial = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };
    this.globalConvertSrevice.fechaFinal = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };

    let res: ResApiInterface = await this._receptionService.getPendindgDocs(
      this.user,
      this.token,
      this.globalConvertSrevice.docSelect!.tipo_Documento,
      this.globalConvertSrevice.formatStrFilterDate(this.globalConvertSrevice.fechaInicial!),
      this.globalConvertSrevice.formatStrFilterDate(this.globalConvertSrevice.fechaFinal!),
    );

    this.globalConvertSrevice.isLoading = false;


    if (!res.status) {


     this.showError(res);

      return;

    }

    this.globalConvertSrevice.docsOrigin = res.response;


  }


  
  async showError(res: ResApiInterface) {

    let verificador = await this._notificationsService.openDialogActions(
      {
        title: this._translate.instant('pos.alertas.salioMal'),
        description: this._translate.instant('pos.alertas.error'),
        verdadero: this._translate.instant('pos.botones.informe'),
        falso: this._translate.instant('pos.botones.aceptar'),
      }
    );

    if (!verificador) return;

    let dateNow: Date = new Date(); //fecha del error

    //Crear error
    let error: ErrorInterface = {
      date: dateNow,
      description: res.response,
      storeProcedure: res.storeProcedure,
      url: res.url,
    }

    PreferencesService.error = error;

    this.globalConvertSrevice.mostrarError(9);

  }


}
