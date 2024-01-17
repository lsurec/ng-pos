import { Component } from '@angular/core';
import { NotificationsService } from 'src/app/services/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { PagoService } from '../../services/pago.service';
import { FormaPagoInterface } from '../../interfaces/forma-pago.interface';
import { FacturaService } from '../../services/factura.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { PagoComponentService } from '../../services/pogo-component.service';
import { MontoIntreface } from '../../interfaces/monto.interface';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-pago',
  templateUrl: './pago.component.html',
  styleUrls: ['./pago.component.scss'],
  providers: [
    PagoService,
  ]
})
export class PagoComponent {



  user: string = PreferencesService.user;
  token: string = PreferencesService.token;
  empresa: number = PreferencesService.empresa.empresa;
  estacion: number = PreferencesService.estacion.estacion_Trabajo;
  documento: number = this.facturaService.tipoDocumento!;

  selectAllMontos: boolean = false;


  constructor(
    private _translate: TranslateService,
    private _notificationsService: NotificationsService,
    public facturaService: FacturaService,
    private _pagoService: PagoService,
    public pagoComponentService: PagoComponentService,
    private _eventService: EventService,

  ) {

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

  viewPayments() {
    this.pagoComponentService.forms = false;
  }

  async viewForms(payment: FormaPagoInterface) {

    this.pagoComponentService.pago = payment;

    //validar que haya una cuenta seleccionada
    if (!this.facturaService.cuenta) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.seleccionarCuenta'));
      return;
    }

    //validar si la forma de pago es cuenta corriente el suuario debe tener permitias cuentas por cobrar
    if (!this.facturaService.cuenta.permitir_CxC && payment.cuenta_Corriente) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.noCuentasPorCobrar'));
      return;
    }

    //Si la forma de pago es cuenta por cobrar y el usuario tiene permitida la opcion
    if (payment.cuenta_Corriente && this.facturaService.cuenta.permitir_CxC) {
      //validar llimite de credito
      if (this.facturaService.total > (this.facturaService.cuenta.limite_Credito) ?? 0) {
        this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.superaLimite'));
        return;
      }
    }

    //No mostrar formulario si no hay montos pendientes de pago
    if (this.facturaService.total == 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.totalPagar'));
      return;
    }

    if (this.facturaService.saldo == 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.saldoPagar'));
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

        this.facturaService.isLoading = false;
        let verificador = await this._notificationsService.openDialogActions(
          {
            title: this._translate.instant('pos.alertas.salioMal'),
            description: this._translate.instant('pos.alertas.error'),
            verdadero: this._translate.instant('pos.botones.informe'),
            falso: this._translate.instant('pos.botones.aceptar'),
          }
        );
  
        if (!verificador) return;
  
        this.verError(resBancos);
  
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

      this.facturaService.isLoading = false;


      let verificador = await this._notificationsService.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.informe'),
          falso: this._translate.instant('pos.botones.aceptar'),
        }
      );

      if (!verificador) return;

      this.verError(resCuentas);

      return;

    }

    this.pagoComponentService.cuentas = resCuentas.response;




  }

  convertirTextoANumero(texto: string): number | null {
    // Verificar si la cadena es un número
    const esNumero = /^\d+(\.\d+)?$/.test(texto);

    if (esNumero) {
      // Realizar la conversión a número
      return parseFloat(texto);
      // Si quieres convertir a un número entero, puedes usar parseInt(texto) en lugar de parseFloat.
    } else {
      // Retornar null si la cadena no es un número
      return null;
    }
  }


  agregarMonto() {

    //validar monto que sea numerico


    if (!this.pagoComponentService.monto) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.completarFormulario'));
      return;

    }


    if (this.convertirTextoANumero(this.pagoComponentService.monto) == null) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.valorNumerico'));
      return;
    }



    if (this.pagoComponentService.pago!.autorizacion) {
      if (!this.pagoComponentService.autorizacion) {
        this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.completarFormulario'));
        return;
      }

    }

    if (this.pagoComponentService.pago!.referencia) {
      if (!this.pagoComponentService.referencia) {
        this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.completarFormulario'));
        return;
      }

    }


    if (this.pagoComponentService.pago!.banco) {
      if (!this.pagoComponentService.banco) {
        this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.seleccionarBanco'));
        return;
      }


      if (this.pagoComponentService.cuentas.length > 0) {
        if (!this.pagoComponentService.cuentaSelect) {
          this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.cuetaBanco'));
          return;
        }
      }
    }

    let monto = this.convertirTextoANumero(this.pagoComponentService.monto);
    let diference: number = 0;

    //Calcualar si hay diferencia (Cambio)
    if (monto! > this.facturaService.saldo) {
      diference = monto! - this.facturaService.saldo;
      monto = this.facturaService.saldo;
    }

    let auth: string = this.pagoComponentService.pago!.autorizacion ? this.pagoComponentService.autorizacion : "";
    let ref: string = this.pagoComponentService.pago!.referencia ? this.pagoComponentService.referencia : "";

    this.facturaService.addMonto(
      {
        checked: this.selectAllMontos,
        amount: monto!,
        authorization: auth,
        reference: ref,
        payment: this.pagoComponentService.pago!,
        bank: this.pagoComponentService.banco,
        account: this.pagoComponentService.cuentaSelect,
        difference: diference,
      }
    );

    this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.pagoAgregado'));

    //clear data
    this.pagoComponentService.autorizacion = "",
      this.pagoComponentService.referencia = "",
      this.pagoComponentService.cuentas = [];
    this.pagoComponentService.bancos = [];
    this.pagoComponentService.banco = undefined;
    this.pagoComponentService.cuentaSelect = undefined;
    this.pagoComponentService.forms = false;

  }


  seleccionar() {
    this.facturaService.montos.forEach(element => {
      element.checked = this.selectAllMontos;
    });

  }

  // Función para manejar la eliminación de pagos seleccionados
  async eliminarPagosSeleccionados() {
    let montosSeleccionados: MontoIntreface[] = this.facturaService.montos.filter((monto) => monto.checked);

    if (montosSeleccionados.length == 0) {
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
    this.facturaService.montos = this.facturaService.montos.filter((monto) => !monto.checked);


    this.facturaService.calculateTotalesPago();

    this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.montosEliminados'));
  }
}

