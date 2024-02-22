import { Component } from '@angular/core';
import { GlobalConvertService } from '../../services/global-convert.service';
import { DetailsOriginDocInterface } from '../../interfaces/details-origin-doc.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { ReceptionService } from '../../services/reception.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';

@Component({
  selector: 'app-convert-docs',
  templateUrl: './convert-docs.component.html',
  styleUrls: ['./convert-docs.component.scss']
})
export class ConvertDocsComponent {
  selectAll: boolean = false; // seleccionar todas las trasnsacciones

  user: string = PreferencesService.user;
  token: string = PreferencesService.token;
  

  constructor(
    public globalConvertSrevice: GlobalConvertService,
    private _receptionService:ReceptionService,

  ) {

  }


  async loadDaata(){
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

      this.globalConvertSrevice.mostrarError(12);

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

  //para selecionar todas las transacciones
  seleccionar() {
    // this.facturaService.montos.forEach(element => {
    //   element.checked = this.selectAllMontos; //asiganer valor del checkbox a las formas de pago
    // });
  }

  backPage() {
    if (this.globalConvertSrevice.docDestino == 0) {
      this.globalConvertSrevice.mostrarDocOrigen();
      return;
    }

    this.globalConvertSrevice.mostrarDocDestino()
  }
  

}
