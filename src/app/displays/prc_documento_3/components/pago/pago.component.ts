import { Component } from '@angular/core';
import { NotificationsService } from 'src/app/services/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { BancosInterface, PagoInterface } from '../../interfaces/pagos.interface';

@Component({
  selector: 'app-pago',
  templateUrl: './pago.component.html',
  styleUrls: ['./pago.component.scss']
})
export class PagoComponent {

  pagosAgregados: PagoInterface[] = [];
  eliminarPagos: boolean = false;

  pagos: PagoInterface[] = [
    { id: 1, nombre: "EFECTIVO" },
    { id: 2, nombre: "MASTERCARD" },
    { id: 3, nombre: "VISA" },
    { id: 4, nombre: "CHEQUE" },
  ];

  bancos: BancosInterface[] = [
    { id: 1, nombre: "Banco Industrial" },
    { id: 2, nombre: "Banco Rural" },
    { id: 3, nombre: "Banco G&T Continental" },
    { id: 4, nombre: "Banco Agromercantil" },
    { id: 5, nombre: "BAC" },
  ];

  tipos: boolean = true;
  efectivo: boolean = false;
  mastercard: boolean = false;
  visa: boolean = false;
  cheque: boolean = false;

  total: number = 165;
  autorizacion!: string;
  referencia!: string

  constructor(
    private _widgetsService: NotificationsService,
    private _translate: TranslateService,
    private _notificationsService: NotificationsService,

  ) {

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
  bancoSelect!: BancosInterface;

  verPago(tipo: PagoInterface) {

    if (tipo.id == 1 && tipo.nombre == this.pagos[0].nombre) {
      this.tipoPago = tipo.nombre;
      this.verEfectivo();
    }

    if (tipo.id == 2 && tipo.nombre == this.pagos[1].nombre) {
      this.tipoPago = tipo.nombre;
      this.verMastercard();
    }

    if (tipo.id == 3 && tipo.nombre == this.pagos[2].nombre) {
      this.tipoPago = tipo.nombre;
      this.verVisa();
    }

    if (tipo.id == 4 && tipo.nombre == this.pagos[3].nombre) {
      this.tipoPago = tipo.nombre;
      this.verCheque();
    }
  }

  pagarEfectivo() {

    if (!this.total) {
      this._widgetsService.openSnackbar(this._translate.instant('pos.alertas.completar'));
      return
    } else {

      let pago: PagoInterface = {
        id: 1,
        nombre: this.tipoPago,
        monto: this.total,
        checked: false
      }
      this.pagosAgregados.push(pago);

      this._widgetsService.openSnackbar(this._translate.instant('pos.alertas.tipoPago'));
      this.verTipos();
    }
  }

  pagarVisa() {
    if (!this.autorizacion || !this.referencia) {
      this._widgetsService.openSnackbar(this._translate.instant('pos.alertas.completar'));
      return
    } else {

      let pago: PagoInterface = {
        id: 1,
        nombre: this.tipoPago,
        monto: this.total,
        autorizacion: this.autorizacion,
        referencia: this.referencia
      }

      this.pagosAgregados.push(pago);

      console.log(this.pagosAgregados);


      this._widgetsService.openSnackbar(this._translate.instant('pos.alertas.tipoPago'));
      this.verTipos();
    }
  }

  pagarMasterCard() {
    if (!this.autorizacion || !this.referencia) {
      this._widgetsService.openSnackbar(this._translate.instant('pos.alertas.completar'));
      return
    } else {
      let pago: PagoInterface = {
        id: 1,
        nombre: this.tipoPago,
        monto: this.total,
        autorizacion: this.autorizacion,
        referencia: this.referencia
      }

      this.pagosAgregados.push(pago);

      this._widgetsService.openSnackbar(this._translate.instant('pos.alertas.tipoPago'));
      this.verTipos();
    }
  }

  pagarCheque() {
    if (!this.referencia) {
      this._widgetsService.openSnackbar(this._translate.instant('pos.alertas.completar'));
      return
    }
    if (!this.referencia || !this.bancoSelect) {
      this._widgetsService.openSnackbar(this._translate.instant('pos.alertas.banco'));
    } else {
      let pago: PagoInterface = {
        id: 1,
        nombre: this.tipoPago,
        monto: this.total,
        autorizacion: this.autorizacion,
        referencia: this.referencia,
        banco: this.bancoSelect.nombre
      }

      this.pagosAgregados.push(pago);
      this._widgetsService.openSnackbar(this._translate.instant('pos.alertas.tipoPago'));
      this.verTipos();
    }

  }

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

