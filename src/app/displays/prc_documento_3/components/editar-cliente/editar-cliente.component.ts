import { ClienteInterface } from '../../interfaces/cliente.interface';
import { Component, Input, OnInit } from '@angular/core';
import { CuentaCorrentistaInterface, TipoCuentaInterface } from '../../interfaces/cuenta-correntista.interface';
import { CuentaService } from '../../services/cuenta.service';
import { EventService } from 'src/app/services/event.service';
import { FacturaService } from '../../services/factura.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-editar-cliente',
  templateUrl: './editar-cliente.component.html',
  styleUrls: ['./editar-cliente.component.scss'],
  providers: [
    CuentaService
  ]
})
export class EditarClienteComponent implements OnInit {
  @Input() cuenta?: ClienteInterface; //Ceunta que se va a editar 
  readonly regresar: number = 2; //id de la pantalla

  //datos de la cuenta que se va a editar
  nombre?: string;
  direccion?: string;
  nit?: string;
  telefono?: string;
  correo?: string;

  isLoading: boolean = false; //pantalla de carga0
  verError: boolean = false; //informe de errores

  constructor(
    //Instancias de los servicios
    private _notificationsServie: NotificationsService,
    private translate: TranslateService,
    private _eventService: EventService,
    private _cuentaService: CuentaService,
    public _facturaService: FacturaService,
    private _translate: TranslateService,

  ) {
    //suscriopciona  eventos desde commponentes hijo

    //ocultar pantalla de error
    this._eventService.regresarEditarCliente$.subscribe((eventData) => {
      this.verError = false;
    });

  }


  tipoCuenta?: TipoCuentaInterface;

  tiposCuentas: TipoCuentaInterface[] = [
    {
      id: 1,
      nombre: "Cuenta 1"
    },
    {
      id: 2,
      nombre: "Cuenta 2"
    },
    {
      id: 3,
      nombre: "Cuenta 3"
    },
    {
      id: 4,
      nombre: "Cuenta 4"
    }
  ];

  ngOnInit(): void {

    //datos de la cuenta que se va a actualizar
    this.nombre = this.cuenta?.factura_Nombre;
    this.direccion = this.cuenta?.factura_Direccion;
    this.nit = this.cuenta?.factura_NIT;
    this.telefono = this.cuenta?.telefono;
    this.correo = this.cuenta?.eMail;

  }

  //regresar a la pantalla anterior
  goBack() {
    this._eventService.verDocumentoEvent(true);
  }

  //mostrar pantalla de informe de errores
  mostrarError(res: ResApiInterface) {

    //Fecha y hora actual
    let dateNow: Date = new Date();

    //informe de error
    let error = {
      date: dateNow,
      description: res.response,
      storeProcedure: res.storeProcedure,
      url: res.url,

    }

    //guardar error
    PreferencesService.error = error;

    //mostrar pantalla de error
    this.verError = true;
  }

  //Validar correo electronico
  validarCorreo(correo: string): boolean {
    // Expresión regular para validar correos electrónicos
    const expresionRegular = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    // Validar el correo con la expresión regular
    return expresionRegular.test(correo);
  };

  //Editar cliente
  async guardar() {

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


    //objeto cuenta
    let cuenta: CuentaCorrentistaInterface = {
      correo: this.correo,
      direccion: this.direccion,
      cuenta: this.cuenta!.cuenta_Correntista,
      nit: this.nit,
      nombre: this.nombre,
      telefono: this.telefono
    }


    //dtaos de la sesion
    let user: string = PreferencesService.user;
    let token: string = PreferencesService.token;
    let empresa: number = PreferencesService.empresa.empresa;

    this.isLoading = true;

    //Usar servicio para actualizar cuenta
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


    //buscar informacin de la cuenta  actualizada
    let infoCuenta: ResApiInterface = await this._cuentaService.getClient(
      user,
      token,
      empresa,
      cuenta.nit,
    );

    this.isLoading = false;

    //si algo salio mal
    if (!infoCuenta.response) {

      this.isLoading = false;


      this._notificationsServie.openSnackbar(this.translate.instant('pos.alertas.cuentaActualizada'));

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

    //coinicdencias encontradas
    let cuentas: ClienteInterface[] = infoCuenta.response;

    //si no se enontro ninguna coincidencia 
    if (cuentas.length == 0) {
      this._notificationsServie.openSnackbar(this.translate.instant('pos.alertas.cuentaActualizada'));
      return;
    }

    //si sooo hay una coicidencia seleccionarla
    if (cuentas.length == 1) {

      //seleccionar cuenta
      this._facturaService.cuenta = cuentas[0];
      this._facturaService.searchClient = this._facturaService.cuenta.factura_Nombre;


      this._notificationsServie.openSnackbar(this.translate.instant('pos.alertas.cuentaActualizadaSeleccionada'));

      //regresar
      this._eventService.verDocumentoEvent(true);

      return;

    }

    //si hay mas coincidencias 
    cuentas.forEach(element => {
      //Seleccionar la primera donde el nit sea igual 
      if (element.factura_NIT == cuenta.nit) {
        //seleccionar cuenta
        this._facturaService.cuenta = element;

        this._facturaService.searchClient = this._facturaService.cuenta.factura_Nombre;


        this._notificationsServie.openSnackbar(this.translate.instant('pos.alertas.cuentaActualizadaSeleccionada'));

        //regresar
        this._eventService.verDocumentoEvent(true);
        return;
      }
    });
  }

}
