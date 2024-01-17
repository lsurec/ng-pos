import { Component, EventEmitter, Output } from '@angular/core';
import { FiltroInterface } from '../../interfaces/filtro.interface';
import { ClienteInterface } from '../../interfaces/cliente.interface';
import { MatDialog } from '@angular/material/dialog';
import { ClientesEncontradosComponent } from '../clientes-encontrados/clientes-encontrados.component';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { RouteNamesService } from 'src/app/services/route.names.service';
import { EventService } from 'src/app/services/event.service';
import { FacturaService } from '../../services/factura.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { CuentaService } from '../../services/cuenta.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { TipoTransaccionService } from '../../services/tipos-transaccion.service';
import { ParametroService } from '../../services/parametro.service';
import { PagoService } from '../../services/pago.service';
import { ErrorInterface } from 'src/app/interfaces/error.interface';

@Component({
  selector: 'app-documento',
  templateUrl: './documento.component.html',
  styleUrls: ['./documento.component.scss'],
  providers: [
    CuentaService,
    TipoTransaccionService,
    ParametroService,
    PagoService,
  ]
})
export class DocumentoComponent {


  @Output() newItemEvent = new EventEmitter<string>();

  switchState: boolean = false;
  searchText!: string;


  user: string = PreferencesService.user;
  token: string = PreferencesService.token;
  empresa: number = PreferencesService.empresa.empresa;
  estacion: number = PreferencesService.estacion.estacion_Trabajo;
  documento: number = this.facturaService.tipoDocumento!;


  constructor(
    private _dialog: MatDialog,
    private _translate: TranslateService,
    private _eventService: EventService,
    public facturaService: FacturaService,
    private _cuentaService: CuentaService,
    private _notificationService: NotificationsService,
    private _tipoTransaccionService: TipoTransaccionService,
    private _parametroService: ParametroService,
    private _formaPagoService: PagoService,
  ) {
  }


  changeVendedor() {
    this.facturaService.saveDocLocal();

  }

  async changeSerie() {

    //cargar datos que dependen de la serie 
    let serie: string = this.facturaService.serie!.serie_Documento;

    this.facturaService.isLoading = true;

    //buscar vendedores
    let resVendedor: ResApiInterface = await this._cuentaService.getSeller(
      this.user,
      this.token,
      this.documento,
      serie,
      this.empresa,
    )


    if (!resVendedor.status) {

      this.facturaService.isLoading = false;




      let verificador = await this._notificationService.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.informe'),
          falso: this._translate.instant('pos.botones.aceptar'),
        }
      );

      if (!verificador) return;

      this.verError(resVendedor);

      return;

    }


    this.facturaService.vendedores = resVendedor.response;

    //si solo hay un vendedor seleccionarlo por defecto
    if (this.facturaService.vendedores.length == 1) {
      this.facturaService.vendedor = this.facturaService.vendedores[0];
      this.facturaService.saveDocLocal();

    }

    //Buscar tipos transaccion
    let resTransaccion: ResApiInterface = await this._tipoTransaccionService.getTipoTransaccion(
      this.user,
      this.token,
      this.documento,
      serie,
      this.empresa,
    );

    if (!resTransaccion.status) {

      this.facturaService.isLoading = false;


      let verificador = await this._notificationService.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.informe'),
          falso: this._translate.instant('pos.botones.aceptar'),
        }
      );

      if (!verificador) return;

      this.verError(resTransaccion);

      return;

    }

    this.facturaService.tiposTransaccion = resTransaccion.response;

    //Buscar parametros del documento
    let resParametro: ResApiInterface = await this._parametroService.getParametro(
      this.user,
      this.token,
      this.documento,
      serie,
      this.empresa,
      this.estacion,
    )

    if (!resParametro.status) {

      this.facturaService.isLoading = false;




      let verificador = await this._notificationService.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.informe'),
          falso: this._translate.instant('pos.botones.aceptar'),
        }
      );

      if (!verificador) return;

      this.verError(resParametro);

      return;

    }

    this.facturaService.parametros = resParametro.response;

    this.facturaService.montos = [];
    this.facturaService.traInternas = [];

    //Buscar formas de pago
    let resFormaPago: ResApiInterface = await this._formaPagoService.getFormas(
      this.token,
      this.empresa,
      serie,
      this.documento,
    );


    if (!resFormaPago.status) {

      this.facturaService.isLoading = false;




      let verificador = await this._notificationService.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.informe'),
          falso: this._translate.instant('pos.botones.aceptar'),
        }
      );

      if (!verificador) return;

      this.verError(resFormaPago);

      return;

    }

    this.facturaService.isLoading = false;


    this.facturaService.formasPago = resFormaPago.response;


  }

  // Función para manejar el cambio de estado del switch
  setCF(): void {
    this.switchState = !this.switchState;

    if (this.switchState) {
      this.facturaService.cuenta = {
        cuenta_Correntista: 1,
        cuenta_Cta: "1",
        factura_Nombre: "CONSUMIDOR FINAL",
        factura_NIT: "C/F",
        factura_Direccion: "CIUDAD",
        cC_Direccion: "Ciudad",
        des_Cuenta_Cta: "C/F",
        direccion_1_Cuenta_Cta: "Ciudad",
        eMail: "",
        telefono: "",
        limite_Credito: 10000000.00,
        permitir_CxC: true,


      }

      this._notificationService.openSnackbar(this._translate.instant('pos.alertas.cuentaSeleccionada'));
      this.facturaService.saveDocLocal();


    } else {
      this.facturaService.cuenta = undefined;
      this.facturaService.saveDocLocal();

    }
  }

  verError(res: ResApiInterface) {

    let dateNow: Date = new Date();

    let error = {
      date: dateNow,
      description: res.response,
      storeProcedure: res.storeProcedure,
      url: res.url,

    }


    PreferencesService.error = error;
    this._eventService.verInformeErrorEvent(true);
  }


  // Función de filtrado
  async buscarCliente() {

    //Validar que el componente 
    if (!this.searchText) {
      this._notificationService.openSnackbar(this._translate.instant('pos.alertas.ingreseCaracter'));
      return;
    }

    // Limpiar la lista de registros antes de cada búsqueda
    this.facturaService.isLoading = true;

    let resCuenta: ResApiInterface = await this._cuentaService.getClient(
      this.user,
      this.token,
      this.empresa,
      this.searchText,
    );

    this.facturaService.isLoading = false;

    if (!resCuenta.status) {

      this.facturaService.isLoading = false;




      let verificador = await this._notificationService.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.informe'),
          falso: this._translate.instant('pos.botones.aceptar'),
        }
      );

      if (!verificador) return;

      this.verError(resCuenta);

      return;

    }
    let cuentas: ClienteInterface[] = resCuenta.response;


    //si no hay coicidencias mostrar mensaje
    if (cuentas.length == 0) {
      this._notificationService.openSnackbar(this._translate.instant('pos.alertas.sinCoincidencias'));
      return;
    }


    //si solo hay uno seleccioanrlo
    if (cuentas.length == 1) {
      this.facturaService.cuenta = cuentas[0];
      this._notificationService.openSnackbar(this._translate.instant('pos.alertas.cuentaSeleccionada'));
      this.facturaService.saveDocLocal();

      return;
    }

    //si hay mas de una coicidencia mostrar dialogo
    let estado = this._dialog.open(ClientesEncontradosComponent, { data: cuentas })
    estado.afterClosed().subscribe(result => {
      if (result) {

        let cliente: ClienteInterface = result[0];
        this.facturaService.cuenta = cliente;

        this._notificationService.openSnackbar(this._translate.instant('pos.alertas.cuentaSeleccionada'));
        this.facturaService.saveDocLocal();

      }
    })



  }

  agregarCliente() {
    this._eventService.verCrearEvent(true);
    // this.verNuevoCliente.emit(true);
  }

  actualizar() {
    this._eventService.verActualizarEvent(this.facturaService.cuenta!);
    // this.verActualizarCliente.emit(true);
  }


}
