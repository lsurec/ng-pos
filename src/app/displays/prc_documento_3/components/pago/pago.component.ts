import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { EventService } from 'src/app/services/event.service';
import { FacturaService } from '../../services/factura.service';
import { FormaPagoInterface } from '../../interfaces/forma-pago.interface';
import { MontoIntreface } from '../../interfaces/monto.interface';
import { NotificationsService } from 'src/app/services/notifications.service';
import { PagoComponentService } from '../../services/pago-component.service';
import { PagoService } from '../../services/pago.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-pago',
  templateUrl: './pago.component.html',
  styleUrls: ['./pago.component.scss'],
  providers: [
    PagoService,
  ]
})
export class PagoComponent implements OnInit {

  //para seleciconar el valor del texto del input
  @ViewChild('montoInput') montoInput?: ElementRef;

  user: string = PreferencesService.user; //usuario de la sesion
  token: string = PreferencesService.token; //token de la sesion
  empresa: number = PreferencesService.empresa.empresa; //empresa de la sesion 
  estacion: number = PreferencesService.estacion.estacion_Trabajo; //Estacion de la sesion
  documento: number = this.facturaService.tipoDocumento!; //Tipo de documento del modulo

  //seleccionar toas lasnformas de apgo agregadas
  selectAllMontos: boolean = false;


  constructor(
    //Instacnias de los servicios
    private _translate: TranslateService,
    private _notificationsService: NotificationsService,
    public facturaService: FacturaService,
    private _pagoService: PagoService,
    public pagoComponentService: PagoComponentService,
    private _eventService: EventService,

  ) {

  }

  //ver pantalla informe de error
  verError(res: ResApiInterface) {

    //fehc y hora ctual
    let dateNow: Date = new Date();

    //informe del error
    let error = {
      date: dateNow,
      description: res.response,
      storeProcedure: res.storeProcedure,
      url: res.url,

    }

    //guardar erorr
    PreferencesService.error = error;

    //ver informe de error
    this._eventService.verInformeErrorEvent(true);
  }

  //ver formas de pago
  viewPayments() {
    //reiniciar vlores
    this.facturaService.calculateTotales(); //valvulat tor¿toales
    this.pagoComponentService.autorizacion = ""; //campo autorizacion en blanco
    this.pagoComponentService.referencia = ""; //campo refrencia en blanco
    this.pagoComponentService.cuentas = []; //Vaciar ceuntas bancarias
    this.pagoComponentService.bancos = []; //vaciar bancos diponibles
    this.pagoComponentService.banco = undefined; //banco seleccionado vacio
    this.pagoComponentService.cuentaSelect = undefined; //ceunta bancaria seleccionad avacia
    this.pagoComponentService.forms = false; //oculatar formularios

    this.facturaService.formasPago = this.facturaService.formasPago.map((pago, index) => ({
      ...pago,
      select: index === 0
    }));
  }

  ngOnInit() {
    this.facturaService.formasPago = this.facturaService.formasPago.map((pago, index) => ({
      ...pago,
      select: index === 0
    }));
  }


  pagoSelect: number = 0;

  //Navegar en la formas de pago
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    this.pagoSelect = this.facturaService.formasPago.findIndex(pago => pago.select);
    if (key === 'arrowdown') {
      event.preventDefault();
      const nextIndex = (this.pagoSelect + 1) % this.facturaService.formasPago.length;
      this.facturaService.formasPago[this.pagoSelect].select = false;
      this.facturaService.formasPago[nextIndex].select = true;
    } else if (key === 'arrowup') {
      event.preventDefault();
      const prevIndex = (this.pagoSelect - 1 + this.facturaService.formasPago.length) % this.facturaService.formasPago.length;
      this.facturaService.formasPago[this.pagoSelect].select = false;
      this.facturaService.formasPago[prevIndex].select = true;
    }

    if (key === "enter") {
      this.viewForms(this.facturaService.formasPago[this.pagoSelect]);
    }
  }


  //ver fommulario para la forma de pago
  async viewForms(payment: FormaPagoInterface) {

    // Reset select property for all items
    this.facturaService.formasPago.forEach(p => p.select = false);
    // Set select property of clicked item to true
    payment.select = true;

    //seleccionar forma de poago
    this.pagoComponentService.pago = payment;

    //validar que haya una cuenta correntista seleccionada
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

    //validar que haya un saldo pendiente de pago
    if (this.facturaService.saldo == 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.saldoPagar'));
      return;
    }

    //si el banco se requiere cargarlos
    if (payment.banco) {

      //linmpoiar lista de bancos
      this.pagoComponentService.bancos = [];

      this.facturaService.isLoading = true;

      //Buscar bancos disponibles
      let resBancos: ResApiInterface = await this._pagoService.getBancos(
        this.user,
        this.token,
        this.empresa,
      );

      this.facturaService.isLoading = false;

      // si alfo salio mal
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

    //ver formulario para la forma de pago
    this.pagoComponentService.forms = true;

    setTimeout(() => {
      this.focusAndSelectText();
    }, 0);

  }


  //Cambiar de banco
  async changeBanco() {

    //limpiar lista dew cuentas bancarias
    this.pagoComponentService.cuentas = [];

    this.facturaService.isLoading = true;

    //buscar cuentas bancarias
    let resCuentas: ResApiInterface = await this._pagoService.getCuentasBanco(
      this.user,
      this.token,
      this.empresa,
      this.pagoComponentService.banco!.banco,
    );

    this.facturaService.isLoading = false;

    //si algo salio mal
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

    //Cuentas bancarias disponibles
    this.pagoComponentService.cuentas = resCuentas.response;
  }

  //converit un texto a nummero+
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

  //agregar una forma de pago
  agregarMonto() {

    //validar exitsa un mono
    if (!this.pagoComponentService.monto) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.completarFormulario'));
      return;

    }

    //validar que el monto sea numerico
    if (this.convertirTextoANumero(this.pagoComponentService.monto) == null) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.valorNumerico'));
      return;
    }


    //si la autorizacion es requerida validar que se agregada
    if (this.pagoComponentService.pago!.autorizacion) {
      if (!this.pagoComponentService.autorizacion) {
        this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.completarFormulario'));
        return;
      }

    }

    //si la referencia es reuqerida validar que sea agregada
    if (this.pagoComponentService.pago!.referencia) {
      if (!this.pagoComponentService.referencia) {
        this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.completarFormulario'));
        return;
      }
    }

    //Si la forma de poago requiere banco validar que esté seleccionadop
    if (this.pagoComponentService.pago!.banco) {
      if (!this.pagoComponentService.banco) {
        this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.seleccionarBanco'));
        return;
      }


      //si el banco es requerido y existen cuentas bancarias validar que se seleccione uno
      if (this.pagoComponentService.cuentas.length > 0) {
        if (!this.pagoComponentService.cuentaSelect) {
          this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.cuetaBanco'));
          return;
        }
      }
    }

    //converitr monto a numero
    let monto = this.convertirTextoANumero(this.pagoComponentService.monto);

    //Cambio
    let diference: number = 0;

    //Calcualar si hay diferencia (Cambio)
    if (monto! > this.facturaService.saldo) {
      diference = monto! - this.facturaService.saldo;
      monto = this.facturaService.saldo;
    }

    //auroizacion vacia si no se reuqiere
    let auth: string = this.pagoComponentService.pago!.autorizacion ? this.pagoComponentService.autorizacion : "";

    //referencia vacia si no se requiere
    let ref: string = this.pagoComponentService.pago!.referencia ? this.pagoComponentService.referencia : "";


    //agregar cargo abono
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

    //despues de agregar la forma de pago limpiar todos los datos relacionados para evitar datos incorrectos
    this.pagoComponentService.autorizacion = "";
    this.pagoComponentService.referencia = "";
    this.pagoComponentService.cuentas = [];
    this.pagoComponentService.bancos = [];
    this.pagoComponentService.banco = undefined;
    this.pagoComponentService.cuentaSelect = undefined;
    this.pagoComponentService.forms = false;

  }


  //seleccionar o no, todas las formmas de pago
  seleccionar() {
    this.facturaService.montos.forEach(element => {
      element.checked = this.selectAllMontos; //asiganer valor del checkbox a las formas de pago
    });

  }

  // Función para manejar la eliminación de pagos seleccionados
  async eliminarPagosSeleccionados() {
    //buscar formas de pagos seleccioandas
    let montosSeleccionados: MontoIntreface[] = this.facturaService.montos.filter((monto) => monto.checked);

    //Alerta al intentar eliminar pagos sin tener seleccionada ninguna
    if (montosSeleccionados.length == 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.seleccionar'));
      return
    }

    //Dialogo de confirmacion
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

    //calcular totales
    this.facturaService.calculateTotalesPago();

    this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.montosEliminados'));
  }

  selectText() {
    if (this.pagoComponentService.monto && this.pagoComponentService.forms) {
      this.focusAndSelectText();
    }
  }


  ngAfterViewInit() {
    if (this.pagoComponentService.monto && this.pagoComponentService.forms) {
      this.focusAndSelectText();
    }
  }

  focusAndSelectText() {
    const inputElement = this.montoInput!.nativeElement;
    inputElement.focus();

    // Añade un pequeño retraso antes de seleccionar el texto
    setTimeout(() => {
      inputElement.setSelectionRange(0, inputElement.value.length);
    }, 0);
  }
}

