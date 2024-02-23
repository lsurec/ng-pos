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

@Component({
  selector: 'app-destination-docs',
  templateUrl: './destination-docs.component.html',
  styleUrls: ['./destination-docs.component.scss']
})
export class DestinationDocsComponent {


  user: string = PreferencesService.user;
  token: string = PreferencesService.token;
  

  constructor(
    public globalConvertSrevice: GlobalConvertService,
    private _receptionService:ReceptionService,
    private _notificationsService: NotificationsService,
    private _translate: TranslateService,
  ) {

  }


  async selectDestino(destino:DestinationDocInterface){
    this.globalConvertSrevice.docDestinationSelect = destino;
    await this.loadDetailsOrigin();
    this.globalConvertSrevice.mostrarDocConversion();
  }

  async loadDetailsOrigin(){

    this.globalConvertSrevice.isLoading = true;

    let res : ResApiInterface = await this._receptionService.getDetallesDocOrigen(
      this.token,
      this.user,
      this.globalConvertSrevice.docOriginSelect!.documento,
      this.globalConvertSrevice.docOriginSelect!.tipo_Documento,
      this.globalConvertSrevice.docOriginSelect!.serie_Documento,
      this.globalConvertSrevice.docOriginSelect!.empresa,
      this.globalConvertSrevice.docOriginSelect!.localizacion,
      this.globalConvertSrevice.docOriginSelect!.estacion_Trabajo,
      this.globalConvertSrevice.docOriginSelect!.fecha_Reg,

      )

    this.globalConvertSrevice.isLoading = false;


    
    if (!res.status) {


     this.showError(res);

      return;

    }

    let deatlles:DetailOriginDocInterface[] = res.response;


    this.globalConvertSrevice.detailsOrigin = [];

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

  async loadData(){
    this.globalConvertSrevice.isLoading = true;

    let res: ResApiInterface = await this._receptionService.getDestinationDocs(
      this.user,
      this.token,
      this.globalConvertSrevice.docOriginSelect!.tipo_Documento,
      this.globalConvertSrevice.docOriginSelect!.serie_Documento,
      this.globalConvertSrevice.docOriginSelect!.empresa,
      this.globalConvertSrevice.docOriginSelect!.estacion_Trabajo,
    );

    this.globalConvertSrevice.isLoading = false;

    if (!res.status) {


      this.showError(res);


      return;

    }

    this.globalConvertSrevice.docsDestination = res.response;
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

    this.globalConvertSrevice.mostrarError(11);

  }


}
