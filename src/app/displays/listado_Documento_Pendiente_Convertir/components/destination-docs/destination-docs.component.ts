import { Component } from '@angular/core';
import { GlobalConvertService } from '../../services/global-convert.service';
import { ReceptionService } from '../../services/reception.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { DestinationDocInterface } from '../../interfaces/destination-doc.interface';
import { DetailOriginDocInterface } from '../../interfaces/detail-origin-doc.interface';
import { TranslateService } from '@ngx-translate/core';
import { NotificationsService } from 'src/app/services/notifications.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-destination-docs',
  templateUrl: './destination-docs.component.html',
  styleUrls: ['./destination-docs.component.scss']
})
export class DestinationDocsComponent {


  user: string = PreferencesService.user; //usuario de la sesion
  token: string = PreferencesService.token; //token de la sesion
  

  constructor(
    //instancia de los servicios
    public globalConvertSrevice: GlobalConvertService,
    private _receptionService:ReceptionService,
    private _notificationsService: NotificationsService,
    private _translate: TranslateService,
  ) {

  }

  //Seleccionar documemnto destino
  async selectDestino(destino:DestinationDocInterface){
    //asiganr documento destino
    this.globalConvertSrevice.docDestinationSelect = destino;
    //buscar detalles del docuemnto origen
    await this.loadDetailsOrigin();
    //mostarr documento conversion (pantalla)
    this.globalConvertSrevice.mostrarDocConversion();
  }

  //Cargar detalles del documento origen
  async loadDetailsOrigin(){

    //iniciar caraga
    this.globalConvertSrevice.isLoading = true;


    const apiDetalleOrigen = ()=> this._receptionService.getDetallesDocOrigen(
      this.token,
      this.user,
      this.globalConvertSrevice.docOriginSelect!.documento,
      this.globalConvertSrevice.docOriginSelect!.tipo_Documento,
      this.globalConvertSrevice.docOriginSelect!.serie_Documento,
      this.globalConvertSrevice.docOriginSelect!.empresa,
      this.globalConvertSrevice.docOriginSelect!.localizacion,
      this.globalConvertSrevice.docOriginSelect!.estacion_Trabajo,
      this.globalConvertSrevice.docOriginSelect!.fecha_Reg,

      );

    //Uso del servicio para obtener detalles dle documento origen
    let res : ResApiInterface = await ApiService.apiUse(apiDetalleOrigen);

      //finalizar caraga
    this.globalConvertSrevice.isLoading = false;

    //Si el servicio falló mostrar error
    if (!res.status) {

     this.showError(res);
      return;
    }

    //Respuesta del servicio
    let deatlles:DetailOriginDocInterface[] = res.response;


    //impiar datos que pudieran existir
    this.globalConvertSrevice.detailsOrigin = [];

    //armar nuevo objeto con check oara poder seleccioanrlo
    deatlles.forEach(element => {
      this.globalConvertSrevice.detailsOrigin.push(
        {
          checked:false,
          detalle:element,
          disponibleMod:element.disponible,
        }
      );
    });
    

  }


  //cargar datos iniciales
  async loadData(){
    //iniciar proceso
    this.globalConvertSrevice.isLoading = true;


    const apiDocDestino = ()=> this._receptionService.getDestinationDocs(
      this.user,
      this.token,
      this.globalConvertSrevice.docOriginSelect!.tipo_Documento,
      this.globalConvertSrevice.docOriginSelect!.serie_Documento,
      this.globalConvertSrevice.docOriginSelect!.empresa,
      this.globalConvertSrevice.docOriginSelect!.estacion_Trabajo,
    );

    //buscar documentos destino
    let res: ResApiInterface = await ApiService.apiUse(apiDocDestino);

    //finalizar carga
    this.globalConvertSrevice.isLoading = false;

    //si el servicio fallo mostrar error
    if (!res.status) {
      this.showError(res);
      return;
    }

    //Respuest del servicio
    this.globalConvertSrevice.docsDestination = res.response;
  }


  //mostrar error
  async showError(res: ResApiInterface) {

    //Dialogo de confirmacion
    let verificador = await this._notificationsService.openDialogActions(
      {
        title: this._translate.instant('pos.alertas.salioMal'),
        description: this._translate.instant('pos.alertas.error'),
        verdadero: this._translate.instant('pos.botones.informe'),
        falso: this._translate.instant('pos.botones.aceptar'),
      }
    );

    //cancelar
    if (!verificador) return;

    //Objeto error
    let dateNow: Date = new Date(); //fecha del error

    //Crear error
    let error: ErrorInterface = {
      date: dateNow,
      description: res.response,
      storeProcedure: res.storeProcedure,
      url: res.url,
    }

    //guardar error
    PreferencesService.error = error;

    //mostrar informe de error en pantalla
    this.globalConvertSrevice.mostrarError(11);

  }

}
