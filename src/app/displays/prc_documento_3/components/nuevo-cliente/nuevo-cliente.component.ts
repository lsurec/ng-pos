import { Component } from '@angular/core';
import { NotificationsService } from 'src/app/services/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { EventService } from 'src/app/services/event.service';
import { CuentaCorrentistaInterface } from '../../interfaces/cuenta-correntista.interface';
import { CuentaService } from '../../services/cuenta.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ClienteInterface } from '../../interfaces/cliente.interface';
import { FacturaService } from '../../services/factura.service';

@Component({
  selector: 'app-nuevo-cliente',
  templateUrl: './nuevo-cliente.component.html',
  styleUrls: ['./nuevo-cliente.component.scss'],
  providers: [
    CuentaService,
  ]
})
export class NuevoClienteComponent {

  nombre!: string;
  direccion!: string;
  nit!: string;
  telefono!: string;
  correo!: string;
  regresar: number = 3;

  isLoading: boolean = false;
  verError: boolean = false;

  constructor(
    private _notificationsServie: NotificationsService,
    private translate: TranslateService,
    private _eventService: EventService,
    private _cuentaService: CuentaService,
    private _facturaService: FacturaService,
    private _translate: TranslateService,
  ) {
    this._eventService.regresarNuevaCuenta$.subscribe((eventData) => {
      this.verError = false;
    });
  }



  validarCorreo(correo: string): boolean {
    // Expresión regular para validar correos electrónicos
    const expresionRegular = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    // Validar el correo con la expresión regular
    return expresionRegular.test(correo);
  };

  async guardar() {


    //TODO:Reportes de error

    //validar formulario
    if (!this.nombre || !this.direccion || !this.nit || !this.telefono || !this.correo) {
      this._notificationsServie.openSnackbar(this.translate.instant('pos.alertas.completar'));
      return
    }

    //Validar correo
    if (!this.validarCorreo(this.correo)) {
      this._notificationsServie.openSnackbar(this.translate.instant('pos.alertas.correoNoValido'));
      return;
    }

    //Crear cuenta

    //nueva cuneta
    let cuenta: CuentaCorrentistaInterface = {
      correo: this.correo,
      direccion: this.direccion,
      cuenta: 0,
      nit: this.nit,
      nombre: this.nombre,
      telefono: this.telefono
    }


    let user: string = PreferencesService.user;
    let token: string = PreferencesService.token;
    let empresa: number = PreferencesService.empresa.empresa;

    this.isLoading = true;

    //Usar servicio crear cuenta
    let resCuenta: ResApiInterface = await this._cuentaService.postCuenta(
      user,
      token,
      empresa,
      cuenta,
    )


    //Si el servicio falló
    if (!resCuenta.status) {

      this.isLoading = false;


      let verificador = await this._notificationsServie.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.informe'),
          falso: this._translate.instant('pos.botones.aceptar'),
        }
      );

      if (!verificador) return;

      this.mostrarError(resCuenta);

      return;

    }

    //buscar informacin de la cuenta  creada
    let infoCuenta: ResApiInterface = await this._cuentaService.getClient(
      user,
      token,
      empresa,
      cuenta.nit,
    );

    this.isLoading = false;


    if (!infoCuenta.response) {
      this.isLoading = false;

      this._notificationsServie.openSnackbar(this.translate.instant('pos.alertas.cuentaCreada'));


      let verificador = await this._notificationsServie.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.informe'),
          falso: this._translate.instant('pos.botones.aceptar'),
        }
      );

      if (!verificador) return;

      this.mostrarError(infoCuenta);

      return;
    }

    let cuentas: ClienteInterface[] = infoCuenta.response;

    if (cuentas.length == 0) {
      this._notificationsServie.openSnackbar(this.translate.instant('pos.alertas.cuentaCreada'));
      return;
    }

    if (cuentas.length == 1) {

      //seleccionar cuenta
      this._facturaService.cuenta = cuentas[0];
      this._facturaService.searchClient = this._facturaService.cuenta.factura_Nombre;

      this._notificationsServie.openSnackbar(this.translate.instant('pos.alertas.cuentaCreadaSeleccionada'));

      //regresar
      this._eventService.verDocumentoEvent(true);
      return;

    }


    cuentas.forEach(element => {
      if (element.factura_NIT == cuenta.nit) {
        //seleccionar cuenta
        this._facturaService.cuenta = element;
        this._facturaService.searchClient = this._facturaService.cuenta.factura_Nombre;

        this._notificationsServie.openSnackbar(this.translate.instant('pos.alertas.cuentaCreadaSeleccionada'));

        //regresar
        this._eventService.verDocumentoEvent(true);
        return;
      }
    });


  }

  goBack() {
    this._eventService.verDocumentoEvent(true);
  }

  mostrarError(res: ResApiInterface) {

    let dateNow: Date = new Date();

    let error = {
      date: dateNow,
      description: res.response,
      storeProcedure: res.storeProcedure,
      url: res.url,

    }

    PreferencesService.error = error;
    this.verError = true;
  }

}
