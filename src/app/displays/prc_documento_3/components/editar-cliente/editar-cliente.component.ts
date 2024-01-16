import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { RouteNamesService } from 'src/app/services/route.names.service';
import { Location } from '@angular/common';
import { EventService } from 'src/app/services/event.service';
import { ClienteInterface } from '../../interfaces/cliente.interface';
import { NotificationsService } from 'src/app/services/notifications.service';
import { CuentaCorrentistaInterface } from '../../interfaces/cuenta-correntista';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { CuentaService } from '../../services/cuenta.service';
import { FacturaService } from '../../services/factura.service';


@Component({
  selector: 'app-editar-cliente',
  templateUrl: './editar-cliente.component.html',
  styleUrls: ['./editar-cliente.component.scss'],
  providers: [
    CuentaService
  ]
})
export class EditarClienteComponent implements OnInit {
  @Input() cuenta?: ClienteInterface; // decorate the property with @Input()
  regresar: number = 2;

  nombre?: string;
  direccion?: string;
  nit?: string;
  telefono?: string;
  correo?: string;

  isLoading: boolean = false;
  verError: boolean = false;

  constructor(
    private _location: Location,
    private _notificationsService: NotificationsService,
    private translate: TranslateService,
    private _router: Router,
    private _eventService: EventService,
    private _cuentaService: CuentaService,
    public _facturaService: FacturaService,

  ) {
    this._eventService.regresarEditarCliente$.subscribe((eventData) => {
      this.verError = false;
    });

  }

  ngOnInit(): void {


    this.nombre = this.cuenta?.factura_Nombre,
      this.direccion = this.cuenta?.factura_Direccion,
      this.nit = this.cuenta?.factura_NIT,
      this.telefono = this.cuenta?.telefono,
      this.correo = this.cuenta?.eMail;

  }

  //regresar a la pantalla anterior
  goBack() {
    this._eventService.verDocumentoEvent(true);
  }

  verSalioMal() {
    this.verError = true;
  }

  validarCorreo(correo: string): boolean {
    // Expresión regular para validar correos electrónicos
    const expresionRegular = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    // Validar el correo con la expresión regular
    return expresionRegular.test(correo);
  };

  async guardar() {
    if (!this.nombre || !this.direccion || !this.nit || !this.telefono || !this.correo) {
      console.log("validacion");

      this._notificationsService.openSnackbar(this.translate.instant('pos.alertas.completar'));
      return
    }

    //Validar correo
    if (!this.validarCorreo(this.correo)) {
      //TODO:Translate
      this._notificationsService.openSnackbar("El correo ingresado no es valido");
      return;
    }

    //Crear cuenta

    //nueva cuneta
    let cuenta: CuentaCorrentistaInterface = {
      correo: this.correo,
      direccion: this.direccion,
      id: this.cuenta!.cuenta_Correntista,
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
      this._notificationsService.showErrorAlert(resCuenta);
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

      //TODO: translate
      this._notificationsService.openSnackbar("Se actualizó la cuenta, pero ocurrió un error al seleccioanarla.");
      console.error(infoCuenta);

      return;
    }

    let cuentas: ClienteInterface[] = infoCuenta.response;

    if (cuentas.length == 0) {
      //TODO:translate
      this._notificationsService.openSnackbar("Se actualizó la cuenta, pero ocurrió un error al seleccioanarla.");
      return;
    }

    if (cuentas.length == 1) {

      //seleccionar cuenta
      this._facturaService.cuenta = cuentas[0];

      //TODO translate
      this._notificationsService.openSnackbar("Cuenta actualizada y seleccioanda correctamente.");

      //regresar
      this._eventService.verDocumentoEvent(true);

      return;

    }


    cuentas.forEach(element => {
      if (element.factura_NIT == cuenta.nit) {
        //seleccionar cuenta
        this._facturaService.cuenta = element;

        //TODO translate
        this._notificationsService.openSnackbar("Cuenta actualizada y seleccioanda correctamente.");

        //regresar
        this._eventService.verDocumentoEvent(true);
        return;
      }
    });
  }

}
