import { Component } from '@angular/core';
import { NotificationsService } from 'src/app/services/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { PagoInterface } from '../../interfaces/pagos.interface';
import { PagoService } from '../../services/pago.service';
import { FormaPagoInterface } from '../../interfaces/forma-pago.interface';
import { FacturaService } from '../../services/factura.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { BancoInterface } from '../../interfaces/banco.interface';
import { CuentaBancoInterface } from '../../interfaces/cuenta-banco.interface';
import { PagoComponentService } from '../../services/pogo-component.service';

@Component({
  selector: 'app-pago',
  templateUrl: './pago.component.html',
  styleUrls: ['./pago.component.scss'],
  providers: [
    PagoService,
  ]
})
export class PagoComponent {


  saldo: number = 10;

  monto: string = "0";
  autorizacion!: string;
  referencia!: string


  user: string = PreferencesService.user;
  token: string = PreferencesService.token;
  empresa: number = PreferencesService.empresa.empresa;
  estacion: number = PreferencesService.estacion.estacion_Trabajo;
  documento: number = this.facturaService.tipoDocumento!;

  pagosAgregados: PagoInterface[] = [];
  eliminarPagos: boolean = false;

  cuentaSelect?: CuentaBancoInterface;


  tipos: boolean = true;
  efectivo: boolean = false;
  mastercard: boolean = false;
  visa: boolean = false;
  cheque: boolean = false;


  constructor(
    private _widgetsService: NotificationsService,
    private _translate: TranslateService,
    private _notificationsService: NotificationsService,
    public facturaService: FacturaService,
    private _pagoService: PagoService,
    public pagoComponentService: PagoComponentService,
  ) {

  }


  viewPayments() {
    this.pagoComponentService.forms = false;
  }

  async viewForms(payment: FormaPagoInterface) {

    this.pagoComponentService.pago = payment;

    //validar que haya una cuenta seleccionada
    if (!this.facturaService.cuenta) {
      //TODO:Translate
      this._notificationsService.openSnackbar("Seleccione una cuenta para el documento ante de agregar una forma de pago.");
      return;
    }

    //validar si la forma de pago es cuenta corriente el suuario debe tener permitias cuentas por cobrar
    if (!this.facturaService.cuenta.permitir_CxC && payment.cuenta_Corriente) {
      //TODO:Translate
      this._notificationsService.openSnackbar("La cuenta asignada al documento no tiene permitidas cuentas por cobrar.");
      return;
    }

    //Si la forma de pago es cuenta por cobrar y el usuario tiene permitida la opcion
    if (payment.cuenta_Corriente && this.facturaService.cuenta.permitir_CxC) {
      //validar llimite de credito
      if (this.facturaService.total > (this.facturaService.cuenta.limite_Credito) ?? 0) {
        //TODO:Translate
        this._notificationsService.openSnackbar("El total del documento supera el limmite de credito de la cuenta asignada al documento.");
        return;
      }
    }


    //No mostrar formulario si no hay montos pendientes de pago
    if (this.facturaService.total == 0) {
      //TODO:Translate
      this._notificationsService.openSnackbar("El total a pagar es 0.");
      return;
    }

    if (this.saldo == 0) {
      //TODO:Translate
      this._notificationsService.openSnackbar("El saldo a pagar es 0.");
      return;
    }

    //si el banco se requiere cargarlos
    if (payment.banco) {

      this.pagoComponentService.bancos = [];

      this.facturaService.isLoading = true;
      let resBancos: ResApiInterface = await this._pagoService.getBancos(
        this.user,
        this.token,
        this.empresa,
      );
      this.facturaService.isLoading = false;


      if (!resBancos.status) {
        this._notificationsService.showErrorAlert(resBancos);
        return;
      }

      this.pagoComponentService.bancos = resBancos.response;


    }


    this.pagoComponentService.forms = true;

  }


  async changeBanco() {

    this.pagoComponentService.cuentas = [];

    this.facturaService.isLoading = true;


    let resCuentas: ResApiInterface = await this._pagoService.getCuentasBanco(
      this.user,
      this.token,
      this.empresa,
      this.pagoComponentService.banco!.banco,
    );

    this.facturaService.isLoading = false;

    if (!resCuentas.status) {
      this._notificationsService.showErrorAlert(resCuentas);
      return;
    }

    this.pagoComponentService.cuentas = resCuentas.response;




  }

  agregarMonto() {

  }


  verTipos() {
    this.tipos = true;
    this.efectivo = false;
    this.mastercard = false;
    this.visa = false;
    this.cheque = false;
  }

  verEfectivo() {
    this.efectivo = true;
    this.tipos = false;
    this.mastercard = false;
    this.visa = false;
    this.cheque = false;
  }

  verMastercard() {
    this.mastercard = true;
    this.tipos = false;
    this.efectivo = false;
    this.visa = false;
    this.cheque = false;
  }

  verVisa() {
    this.visa = true;
    this.tipos = false;
    this.efectivo = false;
    this.mastercard = false;
    this.cheque = false;
  }

  verCheque() {
    this.cheque = true;
    this.tipos = false;
    this.efectivo = false;
    this.mastercard = false;
    this.visa = false;
  }

  tipoPago!: string;



  seleccionar() {
    for (let index = 0; index < this.pagosAgregados.length; index++) {
      const element = this.pagosAgregados[index];
      element.checked = this.eliminarPagos;
    }
  }

  // Función para manejar la eliminación de pagos seleccionados
  async eliminarPagosSeleccionados() {
    let pagosSeleccionados: PagoInterface[] = this.pagosAgregados.filter((pago) => pago.checked);

    if (pagosSeleccionados.length == 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.seleccionar'));
      return
    }

    let verificador: boolean = await this._notificationsService.openDialogActions(
      {
        title: this._translate.instant('pos.alertas.eliminar'),
        description: this._translate.instant('pos.alertas.perderDatos'),
        verdadero: this._translate.instant('pos.botones.aceptar'),
        falso: this._translate.instant('pos.botones.cancelar'),
      }
    );

    if (!verificador) return;
    // Realiza la lógica para eliminar los pagos seleccionados, por ejemplo:
    this.pagosAgregados = this.pagosAgregados.filter((pago) => !pago.checked);
    // También puedes realizar otras acciones necesarias aquí
  }
}

