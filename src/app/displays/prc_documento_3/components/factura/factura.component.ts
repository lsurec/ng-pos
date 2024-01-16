import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NotificationsService } from 'src/app/services/notifications.service';
import { MatSidenav } from '@angular/material/sidenav';
import { EventService } from 'src/app/services/event.service';
import { ClienteInterface } from '../../interfaces/cliente.interface';
import { DataUserService } from '../../services/data-user.service';
import { components } from 'src/app/providers/componentes.provider';
import { FacturaService } from '../../services/factura.service';
import { SerieService } from '../../services/serie.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { CuentaService } from '../../services/cuenta.service';
import { TipoTransaccionService } from '../../services/tipos-transaccion.service';
import { ParametroService } from '../../services/parametro.service';
import { PagoService } from '../../services/pago.service';
import { TranslateService } from '@ngx-translate/core';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';

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
  ]
})
export class FacturaComponent implements OnInit {

  @Output() newItemEvent = new EventEmitter<boolean>();

  regresar: number = 1;
  cuenta?: ClienteInterface;
  vistaFactura: boolean = true;
  nuevoCliente: boolean = false;
  actualizarCliente: boolean = false;
  vistaResumen: boolean = false;
  vistaHistorial: boolean = false;
  vistaInforme: boolean = false;

  user: string = PreferencesService.user;
  empresa: EmpresaInterface = PreferencesService.empresa;
  estacion: EstacionInterface = PreferencesService.estacion;
  url: string = PreferencesService.baseUrl;
  tipoCambio: number = PreferencesService.tipoCambio;
  tipoDocumento: number = this.facturaService.tipoDocumento!;
  nombreDocumento: string = this.facturaService.documentoName;

  //Abrir/Cerrar SideNav
  @ViewChild('sidenavend')
  sidenavend!: MatSidenav;

  tabDocummento: boolean = true;
  tabDetalle: boolean = false;
  tabPago: boolean = false;


  constructor(
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
  ) {

    this._eventService.verCrear$.subscribe((eventData) => {
      this.verNuevoCliente();
    });

    this._eventService.verActualizar$.subscribe((eventData) => {
      this.cuenta = eventData;
      this.verActualizarCliente();
    });

    this._eventService.verDocumento$.subscribe((eventData) => {
      this.verDocumento();
    });

    this._eventService.verResumen$.subscribe((eventData) => {
      this.verDocumento();
    });

    this._eventService.verHistorial$.subscribe((eventData) => {
      this.verHistorial();
    });

    this._eventService.verInformeError$.subscribe((eventData) => {
      this.verInformeError();
    });

  }


  ngOnInit(): void {


    this.loadData();

  }

  showDocumento() {
    this.tabDocummento = true;
    this.tabDetalle = false;
    this.tabPago = false;
  }

  showDetalle() {
    this.tabDocummento = false;
    this.tabDetalle = true;
    this.tabPago = false;
  }
  showPago() {
    this.tabDocummento = false;
    this.tabDetalle = false;
    this.tabPago = true;
  }

  async newDoc() {

    let verificador: boolean = await this._notificationService.openDialogActions(
      {
        title: this._translate.instant('pos.alertas.eliminar'),
        description: this._translate.instant('pos.alertas.perderDatos'),
        verdadero: this._translate.instant('pos.botones.aceptar'),
        falso: this._translate.instant('pos.botones.cancelar'),
      }
    );

    if (!verificador) return;

    this.facturaService.vendedor = undefined;
    this.facturaService.cuenta = undefined;
    this.facturaService.montos = [];
    this.facturaService.traInternas = [];
    this.facturaService.selectAllTra = false;
    this.facturaService.subtotal = 0;
    this.facturaService.cargo = 0;
    this.facturaService.descuento = 0;
    this.facturaService.total = 0;
    this.facturaService.saldo = 0;
    this.facturaService.cambio = 0;
    this.facturaService.pagado = 0;

    if (this.facturaService.series.length == 1) {
      this.facturaService.serie = this.facturaService.series[0];
    } else {
      this.facturaService.serie = undefined
    }



    this.showDocumento();
    this.facturaService.saveDocLocal();

  }


  async loadData() {

    this.facturaService.series = []
    this.facturaService.serie = undefined;
    this.facturaService.vendedores = [];
    this.facturaService.vendedor = undefined;
    this.facturaService.tiposTransaccion = [];
    this.facturaService.parametros = [];
    this.facturaService.formasPago = [];
    this.facturaService.cuenta = undefined;
    this.facturaService.montos = [];
    this.facturaService.traInternas = [];
    this.facturaService.selectAllTra = false;
    this.facturaService.subtotal = 0;
    this.facturaService.cargo = 0;
    this.facturaService.descuento = 0;
    this.facturaService.total = 0;
    this.facturaService.saldo = 0;
    this.facturaService.cambio = 0;
    this.facturaService.pagado = 0;


    this.showDocumento();



    //Si no hay tipo de documento validar
    if (!this.facturaService.tipoDocumento) {
      this.verError({
        response: "No se ha asigando un tipo de documento al display. Comunicate con el departamento de soporte.",
        status:false,
      })
      return;
    }

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

    if (!resSeries.status) {
      this.facturaService.isLoading = false;
      this.verError(resSeries);
      return;
    }

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

      if (!resVendedor.status) {
        this.facturaService.isLoading = false;
        this.verError(resVendedor);

        return;
      }

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

      if (!resTransaccion.status) {
        this.facturaService.isLoading = false;
        this.verError(resTransaccion);

        return;
      }

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

      if (!resParametro.status) {
        this.facturaService.isLoading = false;
        this.verError(resParametro);

        return;
      }

      this.facturaService.parametros = resParametro.response;

      //Buscar formas de pago
      let resFormaPago: ResApiInterface = await this._formaPagoService.getFormas(
        token,
        empresa,
        serie,
        documento,
      );

      if (!resFormaPago.status) {
        this.facturaService.isLoading = false;

        this.verError(resFormaPago);

        return;

      }

      this.facturaService.formasPago = resFormaPago.response;

    }

    this.facturaService.isLoading = false;

    this.facturaService.loadDocDave();


  }



  verNuevoCliente() {
    this.nuevoCliente = true;
    this.actualizarCliente = false;
    this.vistaFactura = false;
    this.vistaResumen = false;
    this.vistaHistorial = false;
    this.vistaInforme = false;
  }

  verActualizarCliente() {
    this.actualizarCliente = true;
    this.nuevoCliente = false;
    this.vistaFactura = false;
    this.vistaResumen = false;
    this.vistaHistorial = false;
    this.vistaInforme = false;
  }

  verDocumento() {
    this.vistaFactura = true;
    this.actualizarCliente = false;
    this.nuevoCliente = false;
    this.vistaResumen = false;
    this.vistaHistorial = false;
    this.vistaInforme = false;
  }

  verResumen() {

    //Si no hay serie seleccionado mostrar mensaje
    if (!this.facturaService.serie) {
      // TODO:Translate
      this._notificationService.openSnackbar("No se ha seleccionado una serie.");
      return;
    }

    //Si no hay cliente seleccioando mostrar mensaje
    if (!this.facturaService.cuenta) {
      // TODO:Translate
      this._notificationService.openSnackbar("No se ha seleccionado un cliente.");
      return;
    }


    //si hay vendedores debe seleconarse uno
    if (this.facturaService.vendedores.length > 0) {
      //Si no hay cliente seleccioando mostrar mensaje
      if (!this.facturaService.vendedor) {
        // TODO:Translate
        this._notificationService.openSnackbar("No se ha seleccionado un vendedor.");
        return;
      }
    }

    //si no hay transacciones mostrar mensaje
    if (this.facturaService.traInternas.length == 0) {
      // TODO:Translate
      this._notificationService.openSnackbar("No se han agregado transacciones.");
      return;
    }

    //si hay formas de pago validar quye se agregue alguna
    if (this.facturaService.serie && this.facturaService.formasPago.length > 0) {
      if (this.facturaService.montos.length == 0) {
        // TODO:Translate
        this._notificationService.openSnackbar("No se ha agregado ningun pago.");
        return;
      }


      // si no se ha pagado el total mostrar mensaje
      if (this.facturaService.saldo > 0) {
        // TODO:Translate
        this._notificationService.openSnackbar("Tinene un saldo pendiente de pagar.");
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

  verHistorial() {
    this.vistaHistorial = true;
    this.vistaResumen = false;
    this.vistaFactura = false;
    this.actualizarCliente = false;
    this.nuevoCliente = false;
    this.vistaInforme = false;

  }

  verInformeError() {
    this.vistaInforme = true;
    this.vistaHistorial = false;
    this.vistaResumen = false;
    this.vistaFactura = false;
    this.actualizarCliente = false;
    this.nuevoCliente = false;
  }


  goBack(): void {
    // this.newItemEvent.emit(false);
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

    let dateNow: Date = new Date();

    let error = {
      date: dateNow,
      description: res.response,
      storeProcedure: res.storeProcedure,
      url: res.url,

    }

    PreferencesService.error = error;
    this.verInformeError();
  }


}
