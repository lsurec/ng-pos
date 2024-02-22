import { Component } from '@angular/core';
import { components } from 'src/app/providers/componentes.provider';
import { EventService } from 'src/app/services/event.service';
import { GlobalConvertService } from '../../services/global-convert.service';
import { ReceptionService } from '../../services/reception.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { DestinationDocInterface } from '../../interfaces/destination-doc.interface';
import { DetailsDestDocsComponent } from '../details-dest-docs/details-dest-docs.component';
import { DetailsOriginDocInterface } from '../../interfaces/details-origin-doc.interface';

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

      return;

    }

    let deatlles:DetailsOriginDocInterface[] = res.response;


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

      return;

    }

    this.globalConvertSrevice.docsDestination = res.response;
  }


}
