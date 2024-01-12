import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { FiltroInterface } from '../../interfaces/filtro.interface';
import { Router } from '@angular/router';
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

  cuenta?: ClienteInterface;
  vistaFactura: boolean = true;
  nuevoCliente: boolean = false;
  actualizarCliente: boolean = false;
  vistaResumen: boolean = false;
  vistaHistorial: boolean = false;
  //Abrir/Cerrar SideNav
  @ViewChild('sidenav')
  sidenav!: MatSidenav;
  @ViewChild('sidenavend')
  sidenavend!: MatSidenav;

  tabAcitve = "document"

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

  }
  ngOnInit(): void {
    this.loadData();

  }


  //TODO:Refresh limpia primero toadas las variables
  async loadData() {
    //Si no hay tipo de documento validar
    if (!this.facturaService.tipoDocumento) {
      //TODO: show retry view
      this._notificationService.openSnackbar("No se ha asigando un tipo de documento al display. Comunicate con el departamento de soporte.");
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
      this._notificationService.showErrorAlert(resSeries);
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
        this._notificationService.showErrorAlert(resVendedor);
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
        this._notificationService.showErrorAlert(resTransaccion);
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
        this._notificationService.showErrorAlert(resParametro);
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

        this._notificationService.showErrorAlert(resFormaPago);
        return;

      }

      this.facturaService.formasPago = resFormaPago.response;

    }

    this.facturaService.isLoading = false;



  }

  close(reason: string) {
    this.sidenav.close();
    this.sidenavend.close();
  }


  verNuevoCliente() {
    this.nuevoCliente = true;
    this.actualizarCliente = false;
    this.vistaFactura = false;
    this.vistaResumen = false;
    this.vistaHistorial = false;
  }

  verActualizarCliente() {
    this.actualizarCliente = true;
    this.nuevoCliente = false;
    this.vistaFactura = false;
    this.vistaResumen = false;
    this.vistaHistorial = false;
  }

  verDocumento() {
    this.vistaFactura = true;
    this.actualizarCliente = false;
    this.nuevoCliente = false;
    this.vistaResumen = false;
    this.vistaHistorial = false;
  }

  verResumen() {
    this.vistaResumen = true;
    this.vistaFactura = false;
    this.actualizarCliente = false;
    this.nuevoCliente = false;
    this.vistaHistorial = false;
  }

  verHistorial() {
    this.vistaHistorial = true;
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
}
