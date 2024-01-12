import { Component } from '@angular/core';
import { NotificationsService } from 'src/app/services/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { PagoService } from '../../services/pago.service';
import { FormaPagoInterface } from '../../interfaces/forma-pago.interface';
import { FacturaService } from '../../services/factura.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { BancoInterface } from '../../interfaces/banco.interface';
import { CuentaBancoInterface } from '../../interfaces/cuenta-banco.interface';
import { PagoComponentService } from '../../services/pogo-component.service';
import { MontoIntreface } from '../../interfaces/monto.interface';

@Component({
  selector: 'app-pago',
  templateUrl: './pago.component.html',
  styleUrls: ['./pago.component.scss'],
  providers: [
    PagoService,
  ]
})
export class PagoComponent {

  autorizacion!: string;
  referencia!: string

  user: string = PreferencesService.user;
  token: string = PreferencesService.token;
  empresa: number = PreferencesService.empresa.empresa;
  estacion: number = PreferencesService.estacion.estacion_Trabajo;
  documento: number = this.facturaService.tipoDocumento!;

  selectAllMontos: boolean = false;

  cuentaSelect?: CuentaBancoInterface;


  constructor(
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

    if (this.facturaService.saldo == 0) {
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
      //TODO:translate
      this._notificationsService.openSnackbar("Rellena el formulario para continuar.");
      return;

    }


    if (this.convertirTextoANumero(this.pagoComponentService.monto) == null) {
      //TODO:translate
      this._notificationsService.openSnackbar("El valor para el cargo o descuento debe ser numerica o positiva.");
      return;
    }



    if (this.pagoComponentService.pago!.autorizacion) {
      if (!this.autorizacion) {
        //TODO:translate
        this._notificationsService.openSnackbar("Rellena el formulario para continuar.");
        return;
      }

    }

    if (this.pagoComponentService.pago!.referencia) {
      if (!this.referencia) {
        //TODO:translate
        this._notificationsService.openSnackbar("Rellena el formulario para continuar.");
        return;
      }

    }


    if (this.pagoComponentService.pago!.banco) {
      if (!this.pagoComponentService.banco) {
        //TODO:translate
        this._notificationsService.openSnackbar("Selecciona un banco para continuar.");
        return;
      }


      if (this.pagoComponentService.cuentas.length > 0) {
        if (this.cuentaSelect) {
          //TODO:translate
          this._notificationsService.openSnackbar("Selecciona una cuenta para continuar.");
          return;
        }
      }
    }
    
    let monto = this.convertirTextoANumero(this.pagoComponentService.monto);
    let diference:number = 0;

    //Calcualar si hay diferencia (Cambio)
    if(monto! > this.facturaService.saldo){
      diference = monto! - this.facturaService.saldo;
      monto = this.facturaService.saldo;      
    }

    let auth:string = this.pagoComponentService.pago!.autorizacion ? this.autorizacion : "";
    let ref:string = this.pagoComponentService.pago!.referencia ? this.referencia : "";

    this.facturaService.addMonto(
      {
        checked: this.selectAllMontos,
        amount:monto!,
        authorization:auth,
        reference: ref,
        payment: this.pagoComponentService.pago!,
        bank: this.pagoComponentService.banco,
        account: this.cuentaSelect,
        difference: diference, 
      }
    );

    //TODO:Translate
    this._notificationsService.openSnackbar("Pago agregado correctamente.");
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

    //TODO:Translate
    this._notificationsService.openSnackbar("Montos eliminados correctamente.");
  }
}

