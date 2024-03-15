import { ClienteInterface } from '../../interfaces/cliente.interface';
import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { components } from 'src/app/providers/componentes.provider';
import { CuentaService } from '../../services/cuenta.service';
import { DataUserService } from '../../services/data-user.service';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { EventService } from 'src/app/services/event.service';
import { FacturaService } from '../../services/factura.service';
import { MatSidenav } from '@angular/material/sidenav';
import { NotificationsService } from 'src/app/services/notifications.service';
import { PagoService } from '../../services/pago.service';
import { ParametroService } from '../../services/parametro.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { SerieService } from '../../services/serie.service';
import { TipoTransaccionService } from '../../services/tipos-transaccion.service';
import { TranslateService } from '@ngx-translate/core';
import { ReferenciaService } from '../../services/referencia.service';

@Component({
  selector: 'app-factura',
  templateUrl: './factura.component.html',
  styleUrls: ['./factura.component.scss'],
  providers: [
    SerieService,
    CuentaService,
    TipoTransaccionService,
    ParametroService,
    PagoService,
    ReferenciaService,
  ]
})
export class FacturaComponent implements OnInit {

  readonly regresar: number = 1; //id de la pnatalla
  cuenta?: ClienteInterface; //cuenta que se va a editar 
  vistaFactura: boolean = true; //mostrar mmodulo (tabs)
  nuevoCliente: boolean = false;  //mostrar pantalla para crear cuenta correntista
  actualizarCliente: boolean = false; //mostrar pantalla para actualizar cunata correntista
  vistaResumen: boolean = false;  //ver confirmacion del documento
  vistaHistorial: boolean = false;  //ver historial de docuemmntos recientes
  vistaInforme: boolean = false; //ver informe de errores

  user: string = PreferencesService.user; //usuario de la sesion
  empresa: EmpresaInterface = PreferencesService.empresa; //empresa de la sesion0
  estacion: EstacionInterface = PreferencesService.estacion; //estacion de la sesion
  tipoCambio: number = PreferencesService.tipoCambio; ///tipo cambio disponioble
  tipoDocumento?: number = this.facturaService.tipoDocumento; //tipo docuemnto seleccionado
  nombreDocumento: string = this.facturaService.documentoName; //Descripcion del tipo de documento

  //Abrir/Cerrar SideNav
  @ViewChild('sidenavend')
  sidenavend!: MatSidenav;

  tabDocummento: boolean = true; //contorlador para la pestaña documento
  tabDetalle: boolean = false;  //controlador para la pestaña de detalle
  tabPago: boolean = false; //Contorlador para la pestaña de pago


  constructor(
    //Instancia de los servicios que se van a utilizar
    private _notificationService: NotificationsService,
    private _eventService: EventService,
    public dataUserService: DataUserService,
    public facturaService: FacturaService,
    private _serieService: SerieService,
    private _cuentaService: CuentaService,
    private _tipoTransaccionService: TipoTransaccionService,
    private _parametroService: ParametroService,
    private _formaPagoService: PagoService,
    private _translate: TranslateService,
    private _referenciaService: ReferenciaService,
  ) {

    //sucripcion a eventos desde componentes hijo

    //Ver pantalla crear cuenta correntista
    this._eventService.verCrear$.subscribe((eventData) => {
      this.verNuevoCliente();
    });

    //ver pantalla actualizar cuenta correntista
    this._eventService.verActualizar$.subscribe((eventData) => {
      this.cuenta = eventData;
      this.verActualizarCliente();
    });

    //ver modulo factura
    this._eventService.verDocumento$.subscribe((eventData) => {
      this.verDocumento();
    });

    //ver modulo factura
    this._eventService.verResumen$.subscribe((eventData) => {
      this.verDocumento();
    });

    //Ver pantalla de hisrorial de documentos
    this._eventService.verHistorial$.subscribe((eventData) => {
      this.verHistorial();
    });

    //Ver pantalla de informe de errores
    this._eventService.verInformeError$.subscribe((eventData) => {
      this.verInformeError();
    });

  }


  ngOnInit(): void {

    //cargar datos necearios al inicio de la aplicacion
    this.loadData();

  }

  //mostrar pestaña doccumento
  showDocumento() {
    this.tabDocummento = true;
    this.tabDetalle = false;
    this.tabPago = false;
  }

  //mostrar pestaña detalle
  showDetalle() {
    this.tabDocummento = false;
    this.tabDetalle = true;
    this.tabPago = false;
  }

  //mostrar pestaña pagos
  showPago() {
    this.tabDocummento = false;
    this.tabDetalle = false;
    this.tabPago = true;
  }

  //nuevo documento
  async newDoc() {

    //Dialofo de confirmacion
    let verificador: boolean = await this._notificationService.openDialogActions(
      {
        title: this._translate.instant('pos.alertas.eliminar'),
        description: this._translate.instant('pos.alertas.perderDatos'),
        verdadero: this._translate.instant('pos.botones.aceptar'),
        falso: this._translate.instant('pos.botones.cancelar'),
      }
    );

    if (!verificador) return;

    //limpiar todos los datos relacionados al documennto
    this.facturaService.cuenta = undefined; //cuneta correntista seleccionada
    this.facturaService.montos = []; //cargo abonos agregaods al documento
    this.facturaService.traInternas = []; //transacciones agregadas al documento
    this.facturaService.selectAllTra = false; //sleeccionar todas las transaciones (false)
    this.facturaService.subtotal = 0; //reniciar subtotal del documento
    this.facturaService.cargo = 0;  //reiniciar cargos el documento
    this.facturaService.descuento = 0;  //reiniciar descuentos del documento
    this.facturaService.total = 0;  //reiniciar toral del documenmto
    this.facturaService.saldo = 0;  //reiniciar saldo del documento
    this.facturaService.cambio = 0; //reiniciar cambio del documento
    this.facturaService.pagado = 0; //reiniciar monto pagado del
    this.facturaService.tipoReferencia = undefined;
    this.facturaService.fechaEntrega = undefined;
    this.facturaService.fechaRecoger = undefined;
    this.facturaService.fechaIni = undefined;
    this.facturaService.fechaFin = undefined;
    this.facturaService.refContacto = undefined;
    this.facturaService.refDescripcion = undefined;
    this.facturaService.refDireccionEntrega = undefined;
    this.facturaService.refObservacion = undefined;

    //si hay solo una serie disponoble
    if (this.facturaService.series.length == 1) {
      //seleccionar la serie
      this.facturaService.serie = this.facturaService.series[0];
    } else {
      //si hay mas de una no seleccionar ninguna
      this.facturaService.serie = undefined
    }


    //si hay solo una tipo referencia disponoble
    if (this.facturaService.tiposReferencia.length == 1) {
      //seleccionar la tipo referencia
      this.facturaService.tipoReferencia = this.facturaService.tiposReferencia[0];
    } else {
      //si hay mas de una no seleccionar ninguna
      this.facturaService.tipoReferencia = undefined
    }

    //si solo un vendedor dipsonible
    if (this.facturaService.vendedores.length == 1) {
      //seleccionar el vendedor
      this.facturaService.vendedor = this.facturaService.vendedores[0];

    } else {
      //si hay mas de uno no sleccionarlo
      this.facturaService.vendedor = undefined; //

    }

    //Mostrar tab documento (primer pestaña)
    this.showDocumento();

    //limpiar documento local 
    PreferencesService.documento = "";

  }

  //cargar datos necesarios
  async loadData() {

    //limpiar datos del modulo
    this.facturaService.series = [] //Vaciar series
    this.facturaService.serie = undefined;  //no seleccionar serie
    this.facturaService.vendedores = [];  //Vaciar lista cuenta correntista ref
    this.facturaService.vendedor = undefined; //no seleccionar cuenta correntusta ref
    this.facturaService.tiposTransaccion = [];  //limpiar tipos de transaccion
    this.facturaService.parametros = [];  //limpiar parametros
    this.facturaService.formasPago = [];  //limpiar formas de pago
    this.facturaService.cuenta = undefined; //no seleccionar cuenta correntista
    this.facturaService.montos = [];  //limpiar cargo abono agregados al documento
    this.facturaService.traInternas = []; //limpoiar transaciones agregadas al documento
    this.facturaService.selectAllTra = false; //No seleccionar todas las transacciones
    this.facturaService.subtotal = 0; //reniciar subtotla del documento
    this.facturaService.cargo = 0;  //reiniciar cargos del documento
    this.facturaService.descuento = 0;  //reiniciar descuentos del documento
    this.facturaService.total = 0;  //reinicar total del documento
    this.facturaService.saldo = 0;  //reiniciar saldo por pagar del documento
    this.facturaService.cambio = 0; //reniciare cambio del documento
    this.facturaService.pagado = 0; //reinciiar montos oagados del documento
    this.facturaService.tipoReferencia = undefined;
    this.facturaService.fechaEntrega = undefined;
    this.facturaService.fechaRecoger = undefined;
    this.facturaService.fechaIni = undefined;
    this.facturaService.fechaFin = undefined;
    this.facturaService.refContacto = undefined;
    this.facturaService.refDescripcion = undefined;
    this.facturaService.refDireccionEntrega = undefined;
    this.facturaService.refObservacion = undefined;


    //Seleccionar primera pestaña (petssña documento)
    this.showDocumento();

    //Si no hay tipo de documento validar
    if (!this.facturaService.tipoDocumento) {
      this.verError({
        response: this._translate.instant('pos.factura.sin_tipo_documento'),
        status: false,
      })
      return;
    }

    //Datos de la sesion
    let user: string = PreferencesService.user;
    let token: string = PreferencesService.token;
    let empresa: number = PreferencesService.empresa.empresa;
    let estacion: number = PreferencesService.estacion.estacion_Trabajo;
    let documento: number = this.facturaService.tipoDocumento;

    this.facturaService.isLoading = true;

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
      this.facturaService.isLoading = false;
      this.verError(resSeries);
      return;
    }

    //Series disponobles
    this.facturaService.series = resSeries.response;

    //si solo hay una serie seleccionarla por defecto;
    if (this.facturaService.series.length == 1) {
      //seleccionar serie
      this.facturaService.serie = this.facturaService.series[0];
      let serie: string = this.facturaService.serie.serie_Documento;

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
        this.facturaService.isLoading = false;
        this.verError(resVendedor);

        return;
      }

      //cuntas correntista ref disponibles
      this.facturaService.vendedores = resVendedor.response;

      //si solo hay un vendedor seleccionarlo por defecto
      if (this.facturaService.vendedores.length == 1) {
        this.facturaService.vendedor = this.facturaService.vendedores[0];
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
        this.facturaService.isLoading = false;
        this.verError(resTransaccion);

        return;
      }

      //tioos de trabnsaccion disponibles
      this.facturaService.tiposTransaccion = resTransaccion.response;

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
        this.facturaService.isLoading = false;
        this.verError(resParametro);

        return;
      }

      //Parammetros disponibles
      this.facturaService.parametros = resParametro.response;

      //Buscar formas de pago
      let resFormaPago: ResApiInterface = await this._formaPagoService.getFormas(
        token,
        empresa,
        serie,
        documento,
      );

      //si algo salio mal
      if (!resFormaPago.status) {
        this.facturaService.isLoading = false;

        this.verError(resFormaPago);

        return;

      }

      //Formas de pago disponobles
      this.facturaService.formasPago = resFormaPago.response;

    }


    if (this.facturaService.valueParametro(58)) {

      this.facturaService.tipoReferencia = undefined;
      this.facturaService.tiposReferencia = [];


      let resTipoRefencia: ResApiInterface = await this._referenciaService.getTipoReferencia(user, token);


      //si algo salio mal
      if (!resTipoRefencia.status) {
        this.facturaService.isLoading = false;

        this.verError(resTipoRefencia);

        return;

      }


      this.facturaService.tiposReferencia = resTipoRefencia.response;


      if (this.facturaService.tiposReferencia.length == 1) {
        this.facturaService.tipoReferencia = this.facturaService.tiposReferencia[0];
      }

    }

    this.facturaService.isLoading = false;

    //cargar documento guardado localmente
    this.facturaService.loadDocDave();
  }


  //ver oabtalal crear cuenta correntista
  verNuevoCliente() {
    this.nuevoCliente = true;
    this.actualizarCliente = false;
    this.vistaFactura = false;
    this.vistaResumen = false;
    this.vistaHistorial = false;
    this.vistaInforme = false;
  }

  //ver pabtralla editar cuenta coprrenitsta
  verActualizarCliente() {
    this.actualizarCliente = true;
    this.nuevoCliente = false;
    this.vistaFactura = false;
    this.vistaResumen = false;
    this.vistaHistorial = false;
    this.vistaInforme = false;
  }

  //ver modulo de factura
  verDocumento() {
    this.vistaFactura = true;
    this.actualizarCliente = false;
    this.nuevoCliente = false;
    this.vistaResumen = false;
    this.vistaHistorial = false;
    this.vistaInforme = false;
  }

  //Confirmar documento
  verResumen() {

    //Si no hay serie seleccionado mostrar mensaje
    if (!this.facturaService.serie) {
      this._notificationService.openSnackbar(this._translate.instant('pos.alertas.sinSerie'));
      return;
    }

    //Si no hay cliente seleccioando mostrar mensaje
    if (!this.facturaService.cuenta) {
      this._notificationService.openSnackbar(this._translate.instant('pos.alertas.sinCliente'));
      return;
    }


    //si hay vendedores debe seleconarse uno
    if (this.facturaService.vendedores.length > 0) {
      //Si no hay cliente seleccioando mostrar mensaje
      if (!this.facturaService.vendedor) {
        this._notificationService.openSnackbar(this._translate.instant('pos.alertas.sinVendedor'));
        return;
      }
    }

    //si no hay transacciones mostrar mensaje
    if (this.facturaService.traInternas.length == 0) {
      this._notificationService.openSnackbar(this._translate.instant('pos.alertas.sinTransacciones'));
      return;
    }

    //si hay formas de pago validar quye se agregue alguna
    if (this.facturaService.serie && this.facturaService.formasPago.length > 0) {
      if (this.facturaService.montos.length == 0) {
        this._notificationService.openSnackbar(this._translate.instant('pos.alertas.sinPagos'));
        return;
      }

      // si no se ha pagado el total mostrar mensaje
      if (this.facturaService.saldo > 0) {
        this._notificationService.openSnackbar(this._translate.instant('pos.alertas.saldoPendiente'));
        return;
      }
    }

    //ir a resumen
    this.vistaResumen = true;
    this.vistaFactura = false;
    this.actualizarCliente = false;
    this.nuevoCliente = false;
    this.vistaHistorial = false;
    this.vistaInforme = false;
  }

  //ver histirial de documentos recienetes
  verHistorial() {
    this.vistaHistorial = true;
    this.vistaResumen = false;
    this.vistaFactura = false;
    this.actualizarCliente = false;
    this.nuevoCliente = false;
    this.vistaInforme = false;
  }

  //ver informe de erroes
  verInformeError() {
    this.vistaInforme = true;
    this.vistaHistorial = false;
    this.vistaResumen = false;
    this.vistaFactura = false;
    this.actualizarCliente = false;
    this.nuevoCliente = false;
  }

  //regresear a menu (pantalla de inicio)
  goBack(): void {
    components.forEach(element => {
      element.visible = false;
    });

    this._eventService.emitCustomEvent(false);
  }

  //Abrir cerrar Sidenav
  close(reason: string) {
    this.sidenavend.close();
  }


  //verError
  verError(res: ResApiInterface) {

    //fehca y hora ctual
    let dateNow: Date = new Date();

    //informe de error
    let error = {
      date: dateNow,
      description: res.response,
      storeProcedure: res.storeProcedure,
      url: res.url,

    }

    //guardar error
    PreferencesService.error = error;

    //ver pantlla d error
    this.verInformeError();
  }

}
