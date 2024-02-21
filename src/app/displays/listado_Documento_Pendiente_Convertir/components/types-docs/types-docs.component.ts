import { Component, OnInit } from '@angular/core';
import { GlobalConvertService } from '../../services/global-convert.service';
import { components } from 'src/app/providers/componentes.provider';
import { EventService } from 'src/app/services/event.service';
import { TypesDocConvertInterface } from '../../interfaces/types-doc-convert.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ReceptionService } from '../../services/reception.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ErrorInterface } from 'src/app/interfaces/error.interface';

@Component({
  selector: 'app-types-docs',
  templateUrl: './types-docs.component.html',
  styleUrls: ['./types-docs.component.scss']
})
export class TypesDocsComponent implements OnInit {

  user: string = PreferencesService.user; //Usuario de la sesion
  token: string = PreferencesService.token; //token de la sesion


  constructor(
    public globalConvertSrevice: GlobalConvertService,
    private _eventService: EventService,
    private _receptionService: ReceptionService,

  ) {

  }

  ngOnInit(): void {



  }

  isLoading() {
    this.globalConvertSrevice.verTiposDocConversion = !this.globalConvertSrevice.verDetalleDocConversion;
    this.globalConvertSrevice.isLoading = !this.globalConvertSrevice.isLoading;
    this.globalConvertSrevice.showError = false;
    this.globalConvertSrevice.verDocOrigen = false;
    this.globalConvertSrevice.verDocDestino = false;
    this.globalConvertSrevice.verDocConversion = false;
    this.globalConvertSrevice.verDetalleDocConversion = false;
  }


  async loadData() {

    this.globalConvertSrevice.docs = [];

    this.isLoading();

    let res: ResApiInterface = await this._receptionService.getTiposDoc(
      this.user,
      this.token,
    );
    this.isLoading();


    if (!res.status) {


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

  goOrigin(doc: TypesDocConvertInterface) {


    this.globalConvertSrevice.docSelect = doc;

    this.globalConvertSrevice.mostrarDocOrigen();
    this.globalConvertSrevice.screen = "";


  }

}
