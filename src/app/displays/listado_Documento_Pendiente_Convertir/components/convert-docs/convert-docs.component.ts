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
import { FacturaService } from 'src/app/displays/prc_documento_3/services/factura.service';
import { DataUserService } from 'src/app/displays/prc_documento_3/services/data-user.service';
import { SerieService } from 'src/app/displays/prc_documento_3/services/serie.service';
import { CuentaService } from 'src/app/displays/prc_documento_3/services/cuenta.service';
import { TipoTransaccionService } from 'src/app/displays/prc_documento_3/services/tipos-transaccion.service';
import { ParametroService } from 'src/app/displays/prc_documento_3/services/parametro.service';
import { PagoService } from 'src/app/displays/prc_documento_3/services/pago.service';
import { ReferenciaService } from 'src/app/displays/prc_documento_3/services/referencia.service';

@Component({
  selector: 'app-convert-docs',
  templateUrl: './convert-docs.component.html',
  styleUrls: ['./convert-docs.component.scss'],
  providers: [
    SerieService,
    CuentaService,
    TipoTransaccionService,
    ParametroService,
    PagoService,
    ReferenciaService,
  ],
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
    private _facturaService: FacturaService,
    private _dataUserService: DataUserService,
    private _serieService: SerieService,
    private _cuentaService: CuentaService,
    private _tipoTransaccionService: TipoTransaccionService,
    private _parametroService: ParametroService,
    private _formaPagoService: PagoService,
    private _referenciaService: ReferenciaService,
  ) {

  }

  async editDoc() {


    //empty data in screen
    this._facturaService.clearData();


    //set t ipo documento and descripcion tipo docuemnto
    this._dataUserService.nameDisplay = this.globalConvertSrevice.docOriginSelect!.documento_Decripcion;
    this._facturaService.tipoDocumento = this.globalConvertSrevice.docOriginSelect!.tipo_Documento;

    //Datos de la sesion
    let user: string = this.globalConvertSrevice.docOriginSelect!.usuario;
    let token: string = PreferencesService.token;
    let empresa: number = this.globalConvertSrevice.docOriginSelect!.empresa;
    let estacion: number = this.globalConvertSrevice.docOriginSelect!.estacion_Trabajo;
    let documento: number = this._facturaService.tipoDocumento;


    //TODO: Cargar en conversion
    this._facturaService.isLoading = true;

    //set serie documento
    //Buscar series
    let resSeries: ResApiInterface = await this._serieService.getSerie(
      user,
      token,
      documento,
      empresa,
      estacion,
    );

    //si algo salio al
    if (!resSeries.status) {
      this._facturaService.isLoading = false;
      //TODO: Show error 
      console.log(resSeries);
      

      // this.verError(resSeries);
      return;
    }

    //Series disponobles
    this._facturaService.series = resSeries.response;




    let indexSerie: number = -1;

    for (let i = 0; i < this._facturaService.series.length; i++) {
      const element = this._facturaService.series[i];

      if (element.serie_Documento == this.globalConvertSrevice.docOriginSelect?.serie_Documento) {
        indexSerie = i;
        break;
      }
    }


    if (indexSerie == -1) {
      ///TODO: Si no existe no navegar
      console.log("No existe la serie");

      return;

    }


    this._facturaService.serie = this._facturaService.series[indexSerie];


    //si solo hay una serie seleccionarla por defecto;
    if (this._facturaService.series.length == 1) {
      //seleccionar serie



      let serie: string = this._facturaService.serie.serie_Documento;

      //buscar vendedores
      let resVendedor: ResApiInterface = await this._cuentaService.getSeller(
        user,
        token,
        documento,
        serie,
        empresa,
      )

      //si algo salió mal mostrar error
      if (!resVendedor.status) {
        //TODO: Show error 

        this._facturaService.isLoading = false;
        // this.verError(resVendedor);
      console.log(resVendedor);


        return;
      }

      //cuntas correntista ref disponibles
      this._facturaService.vendedores = resVendedor.response;


      //Validar cuenta ref si existe
      if (this.globalConvertSrevice.docOriginSelect?.cuenta_Correntista_Ref) {

        let indexCtaRef = -1;
        for (let i = 0; i < this._facturaService.vendedores.length; i++) {
          const element = this._facturaService.vendedores[i];

          if (element.cuenta_Correntista == this.globalConvertSrevice.docOriginSelect.cuenta_Correntista_Ref) {
            indexCtaRef = i;
            break;
          }

        }


        if (indexCtaRef == -1) {
          //TODO: Mostrar mensjae}
          console.log("No eciste cuenat ref");
          
          //TODO: Reinventar
          // return;
        }


        this._facturaService.vendedor = this._facturaService.vendedores[indexCtaRef];


      }




      //Buscar tipos transaccion
      let resTransaccion: ResApiInterface = await this._tipoTransaccionService.getTipoTransaccion(
        user,
        token,
        documento,
        serie,
        empresa,
      );

      //si algo salio mal
      if (!resTransaccion.status) {

      console.log(resTransaccion);


        //TODO:Error
        // this._facturaService.isLoading = false;
        // this.verError(resTransaccion);

        return;
      }

      //tioos de trabnsaccion disponibles
      this._facturaService.tiposTransaccion = resTransaccion.response;

      //Buscar parametros del documento
      let resParametro: ResApiInterface = await this._parametroService.getParametro(
        user,
        token,
        documento,
        serie,
        empresa,
        estacion,
      )

      //si algo salio mal
      if (!resParametro.status) {
        //TODO:Error
        console.log(resParametro);
        

        // this._facturaService.isLoading = false;
        // this.verError(resParametro);

        return;
      }

      //Parammetros disponibles
      this._facturaService.parametros = resParametro.response;

      //Buscar formas de pago
      let resFormaPago: ResApiInterface = await this._formaPagoService.getFormas(
        token,
        empresa,
        serie,
        documento,
      );

      //si algo salio mal
      if (!resFormaPago.status) {

        //TODO:Error

        console.log(resFormaPago);
        
        // this._facturaService.isLoading = false;

        // this.verError(resFormaPago);

        return;

      }

      //Formas de pago disponobles
      this._facturaService.formasPago = resFormaPago.response;

    }


    //TODO:Buscar referencia, observaciones y fechas para caragarlas

    if (this._facturaService.valueParametro(58)) {

      this._facturaService.tipoReferencia = undefined;
      this._facturaService.tiposReferencia = [];


      let resTipoRefencia: ResApiInterface = await this._referenciaService.getTipoReferencia(user, token);


      //si algo salio mal
      if (!resTipoRefencia.status) {

        console.log(resTipoRefencia);
        

        //TODO:Error
        // this._facturaService.isLoading = false;


        // this.verError(resTipoRefencia);

        return;

      }


      this._facturaService.tiposReferencia = resTipoRefencia.response;


      if (this._facturaService.tiposReferencia.length == 1) {
        this._facturaService.tipoReferencia = this._facturaService.tiposReferencia[0];
      }

    }

    //TODO:Cargarr
    this._facturaService.isLoading = false;




    this._facturaService.traInternas = [];


    this.globalConvertSrevice.detailsOrigin.forEach(element => {
      this._facturaService.traInternas.push(
        {
          precioCantidad: 0,
          precipDia: 0,
          isChecked: false,
          bodega: undefined,
          producto: {
            des_Producto: element.detalle.producto,
            des_Unidad_Medida: "",
            producto: 1,
            producto_Id: element.detalle.id,
            tipo_Producto: 1,
            unidad_Medida: 1,


          },
          precio: undefined!,
          cantidad: element.disponibleMod,
          total: 0,
          cargo: 0,
          descuento: 0,
          operaciones: [],
        }
      );
    });

    console.log("PAso por aqui");
    
    this.globalConvertSrevice.editDoc = true;

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
