import { Component } from '@angular/core';
import { GlobalConvertService } from '../../services/global-convert.service';
import { DetailsOriginDocInterInterface, DetailsOriginDocInterface } from '../../interfaces/details-origin-doc.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { ReceptionService } from '../../services/reception.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { NotificationsService } from 'src/app/services/notifications.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TranslateService } from '@ngx-translate/core';

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
    private _receptionService: ReceptionService,
    private _notificationsService: NotificationsService,
    private _translate: TranslateService,

  ) {

  }


  async loadDaata() {
    this.globalConvertSrevice.isLoading = true;

    let res: ResApiInterface = await this._receptionService.getDetallesDocOrigen(
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

    let deatlles: DetailsOriginDocInterface[] = res.response;


    this.globalConvertSrevice.detailsOrigin = [];

    deatlles.forEach(element => {
      this.globalConvertSrevice.detailsOrigin.push(
        {
          checked: false,
          detalle: element,
          disponibleMod: element.disponible,
        }
      );
    });

  }

  //para selecionar todas las transacciones
  seleccionar() {

    let count = 0;

    this.globalConvertSrevice.detailsOrigin.forEach(element => {
      if (element.detalle.disponible == 0) {
        count++;
      } else {
        element.checked = this.selectAll;
      }
    });


    if (count > 0 && this.selectAll) {
      //TODO:Translate
      this._notificationsService.openSnackbar("Las transacciones con disponibilidad 0 no serán seleccionadas.");
    }

  }

  selectTra(index: number) {


    if (!this.globalConvertSrevice.detailsOrigin[index].checked) return;

    //verificar que la cantidad sea numerica
    if (UtilitiesService.convertirTextoANumero(this.globalConvertSrevice.detailsOrigin[index].disponibleMod.toString()) == null) {
      this.globalConvertSrevice.detailsOrigin[index].checked = false;
      //TODO:Translate

      this._notificationsService.openSnackbar("Las transacciones con disponibilidad 0 no serán seleccionadas.");
      return;
    }

    
    if ( this.globalConvertSrevice.detailsOrigin[index].disponibleMod <= 0) {
      //TODO:Translate
      this._notificationsService.openSnackbar("Las transacciones con disponibilidad 0 no serán seleccionadas.");

       this.globalConvertSrevice.detailsOrigin[index].checked = false;
      return;
    }


    if ( this.globalConvertSrevice.detailsOrigin[index].disponibleMod >  this.globalConvertSrevice.detailsOrigin[index].detalle.disponible) {
      //TODO:Translate
      this._notificationsService.openSnackbar("La cantidad autorizada no puede ser mayor a la cantidad disponible");
       this.globalConvertSrevice.detailsOrigin[index].checked = false;

      return;
    }

    if (this.globalConvertSrevice.detailsOrigin[index].detalle.disponible == 0) {
      this.globalConvertSrevice.detailsOrigin[index].checked = false;
      //TODO:Translate

      this._notificationsService.openSnackbar("Las transacciones con disponibilidad 0 no serán seleccionadas.");
    }

  }

  backPage() {
    if (this.globalConvertSrevice.docDestino == 0) {
      this.globalConvertSrevice.mostrarDocOrigen();
      return;
    }

    this.globalConvertSrevice.mostrarDocDestino()
  }


  changeCantidad(detalle: DetailsOriginDocInterInterface) {

    //verificar que la cantidad sea numerica
    if (UtilitiesService.convertirTextoANumero(detalle.disponibleMod.toString()) == null) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.cantidadPositiva'));
      detalle.checked = false;
      return;
    }

    if (detalle.disponibleMod <= 0) {
      //TODO:Translate
      this._notificationsService.openSnackbar("La cantidad autorizada no puede ser 0");
      detalle.checked = false;
      return;
    }


    if (detalle.disponibleMod > detalle.detalle.disponible) {
      //TODO:Translate
      this._notificationsService.openSnackbar("La cantidad autorizada no puede ser mayor a la cantidad disponible");
      detalle.checked = false;

      return;
    }

    detalle.checked = true;
  }


}
