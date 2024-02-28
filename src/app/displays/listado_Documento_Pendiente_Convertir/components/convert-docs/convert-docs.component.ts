import { Component } from '@angular/core';
import { GlobalConvertService } from '../../services/global-convert.service';
import { DetailOriginDocInterInterface, DetailOriginDocInterface } from '../../interfaces/detail-origin-doc.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { ReceptionService } from '../../services/reception.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { NotificationsService } from 'src/app/services/notifications.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TranslateService } from '@ngx-translate/core';
import { ParamConvertDocInterface } from '../../interfaces/param-convert-doc.interface';

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

  async convertDoc() {

    let traCheks: DetailOriginDocInterInterface[] = this.globalConvertSrevice.detailsOrigin.filter((transaction) => transaction.checked);

    if (traCheks.length == 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.seleccionar'));
      return
    }


    let verificador: boolean = await this._notificationsService.openDialogActions(
      {
        title: this._translate.instant('pos.documento.eliminar'),
        description: this._translate.instant('pos.documento.confirmar'),
        verdadero: this._translate.instant('pos.botones.aceptar'),
        falso: this._translate.instant('pos.botones.cancelar'),
      }
    );

    if (!verificador) return;

    this.globalConvertSrevice.isLoading = true;


    for (const tra of traCheks) {

      let resActualizar = await this._receptionService.postActualizar(
        this.user,
        this.token,
        tra.detalle.consecutivo_Interno,
        tra.disponibleMod,
      );

      if (!resActualizar.status) {
        this.globalConvertSrevice.isLoading = false;
        this.showError(resActualizar);
        return;
      }

    }

    let param: ParamConvertDocInterface = {
      pUserName: this.user,
      pO_Documento: this.globalConvertSrevice.docOriginSelect!.documento,
      pO_Tipo_Documento: this.globalConvertSrevice.docOriginSelect!.tipo_Documento,
      pO_Serie_Documento: this.globalConvertSrevice.docOriginSelect!.serie_Documento,
      pO_Empresa: this.globalConvertSrevice.docOriginSelect!.empresa,
      pO_Estacion_Trabajo: this.globalConvertSrevice.docOriginSelect!.estacion_Trabajo,
      pO_Fecha_Reg: this.globalConvertSrevice.docOriginSelect!.fecha_Reg,
      pD_Tipo_Documento: this.globalConvertSrevice.docDestinationSelect!.f_Tipo_Documento,
      pD_Serie_Documento: this.globalConvertSrevice.docDestinationSelect!.f_Serie_Documento,
      pD_Empresa: this.globalConvertSrevice.docOriginSelect!.empresa,
      pD_Estacion_Trabajo: this.globalConvertSrevice.docOriginSelect!.estacion_Trabajo,

    };


    let resConvert: ResApiInterface = await this._receptionService.postConvertir(
      this.token,
      param,
    );


    if (!resConvert.status) {
      this.globalConvertSrevice.isLoading = false;
      this.showError(resConvert);
      return;
    }


    this.globalConvertSrevice.docDestinoSelect = resConvert.response;

    await this.loadDetails();

    this.globalConvertSrevice.mostrarDetalleDocConversion()
    this.globalConvertSrevice.isLoading = false;
  }

  async loadDetails() {

    this.globalConvertSrevice.detialsDocDestination = [];

    let res: ResApiInterface = await this._receptionService.getDetallesDocDestino(
      this.token,
      this.user,
      this.globalConvertSrevice.docDestinoSelect!.documento,
      this.globalConvertSrevice.docDestinoSelect!.tipoDocumento,
      this.globalConvertSrevice.docDestinoSelect!.serieDocumento,
      this.globalConvertSrevice.docDestinoSelect!.empresa,
      this.globalConvertSrevice.docDestinoSelect!.localizacion,
      this.globalConvertSrevice.docDestinoSelect!.estacion,
      this.globalConvertSrevice.docDestinoSelect!.fechaReg,
    )


    if (!res.status) {
      this.globalConvertSrevice.isLoading = false;
      this.showError(res);
      return;
    }

    this.globalConvertSrevice.detialsDocDestination = res.response;



  }




  async loadData() {
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

      this.showError(res);
      return;


    }

    let deatlles: DetailOriginDocInterface[] = res.response;


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

    this.globalConvertSrevice.mostrarError(12);

    return;
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
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.enCero'));
    }

  }

  selectTra(index: number) {


    if (!this.globalConvertSrevice.detailsOrigin[index].checked) return;

    //verificar que la cantidad sea numerica
    if (UtilitiesService.convertirTextoANumero(this.globalConvertSrevice.detailsOrigin[index].disponibleMod.toString()) == null) {
      this.globalConvertSrevice.detailsOrigin[index].checked = false;
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.enCero'));
      return;
    }


    if (this.globalConvertSrevice.detailsOrigin[index].disponibleMod <= 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.enCero'));

      this.globalConvertSrevice.detailsOrigin[index].checked = false;
      return;
    }


    if (this.globalConvertSrevice.detailsOrigin[index].disponibleMod > this.globalConvertSrevice.detailsOrigin[index].detalle.disponible) {

      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.noMayor'));
      this.globalConvertSrevice.detailsOrigin[index].checked = false;

      return;
    }

    if (this.globalConvertSrevice.detailsOrigin[index].detalle.disponible == 0) {
      this.globalConvertSrevice.detailsOrigin[index].checked = false;
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.enCero'));
    }

  }

  backPage() {
    if (this.globalConvertSrevice.docDestino == 0) {
      this.globalConvertSrevice.mostrarDocOrigen();
      return;
    }

    this.globalConvertSrevice.mostrarDocDestino()
  }


  changeCantidad(detalle: DetailOriginDocInterInterface) {

    //verificar que la cantidad sea numerica
    if (UtilitiesService.convertirTextoANumero(detalle.disponibleMod.toString()) == null) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.cantidadPositiva'));
      detalle.checked = false;
      return;
    }

    if (detalle.disponibleMod <= 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.noCero'));
      detalle.checked = false;
      return;
    }


    if (detalle.disponibleMod > detalle.detalle.disponible) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.noMayor'));
      detalle.checked = false;

      return;
    }

    detalle.checked = true;
  }


}
