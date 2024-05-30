import { ClienteInterface } from '../../interfaces/cliente.interface';
import { Component, OnInit } from '@angular/core';
import { CuentaCorrentistaInterface } from '../../interfaces/cuenta-correntista.interface';
import { CuentaService } from '../../services/cuenta.service';
import { EventService } from 'src/app/services/event.service';
import { FacturaService } from '../../services/factura.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { TranslateService } from '@ngx-translate/core';
import { GrupoCuentaInterface } from '../../interfaces/grupo-cuenta.interface';

@Component({
  selector: 'app-nuevo-cliente',
  templateUrl: './nuevo-cliente.component.html',
  styleUrls: ['./nuevo-cliente.component.scss'],
  providers: [
    CuentaService,
  ]
})
export class NuevoClienteComponent implements OnInit {

  //datos para la nueva cuenta
  nombre!: string;
  direccion!: string;
  nit!: string;
  telefono!: string;
  correo!: string;
  regresar: number = 3;

  //Pantalla de carga
  isLoading: boolean = false;
  //ver informe de errores
  verError: boolean = false;

  user: string = PreferencesService.user; //Usuario de la sesion
  token: string = PreferencesService.token; //token de la sesion

  //grupo cuenta disponible
  gruposCuenta: GrupoCuentaInterface [] = [];

  constructor(
    //instancias de los servicios necesarios
    private _notificationsServie: NotificationsService,
    private translate: TranslateService,
    private _eventService: EventService,
    private _cuentaService: CuentaService,
    private _facturaService: FacturaService,
    private _translate: TranslateService,
  ) {

    //suscripcion a sventos desde componente hijo
    //eventos desde infrome de arror
    this._eventService.regresarNuevaCuenta$.subscribe((eventData) => {
      this.verError = false;
    });
  }

  ngOnInit(): void {
  this.loadData();
    
  }

  async loadData(){
    //Consumo tipo cuneta

    this.tipoCuenta = undefined;

    this.gruposCuenta = [];

    this.isLoading   = true;
    let resGrupoCuenta = await this._cuentaService.getGrupoCuenta(this.user,this.token);

    this.isLoading = false;

    //Si el servicio falló
    if (!resGrupoCuenta.status) {



      let verificador = await this._notificationsServie.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.informe'),
          falso: this._translate.instant('pos.botones.aceptar'),
        }
      );

      if (!verificador) return;

      this.mostrarError(resGrupoCuenta);

      return;

    }


    this.gruposCuenta = resGrupoCuenta.response;


    
  }

  tipoCuenta?: GrupoCuentaInterface;



  //funcion que valida que un correo ee¿lectronico sea valido
  validarCorreo(correo: string): boolean {
    // Expresión regular para validar correos electrónicos
    const expresionRegular = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    // Validar el correo con la expresión regular
    return expresionRegular.test(correo);
  };

  //ceear nueva cuenta
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

     //Validar Grupo Cuenta
     if (!this.validarCorreo(this.correo)) {
      //TODO:Translate
      this._notificationsServie.openSnackbar("Seleccione un tipo de cuenta");
      return;
    }

    //nueva cuneta
    let cuenta: CuentaCorrentistaInterface = {
      correo: this.correo,
      direccion: this.direccion,
      cuenta: 0,
      cuentaCuenta:"",
      nit: this.nit,
      nombre: this.nombre,
      telefono: this.telefono,
      grupoCuenta:this.tipoCuenta!.grupo_Cuenta,
      
    }


    let user: string = PreferencesService.user; //usuario de la sesion
    let token: string = PreferencesService.token; //token de la sesion
    let empresa: number = PreferencesService.empresa.empresa; //empresa de la sesion

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

    // si falló la buqueda de la cuenta creada
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

    //coincidencias con la cuenta creada
    let cuentas: ClienteInterface[] = infoCuenta.response;

    //si no se encontró ninguna cuenta
    if (cuentas.length == 0) {
      this._notificationsServie.openSnackbar(this.translate.instant('pos.alertas.cuentaCreada'));
      return;
    }

    // si solo se encontró una coincidencia
    if (cuentas.length == 1) {

      //seleccionar cuenta
      this._facturaService.cuenta = cuentas[0];
      this._facturaService.searchClient = this._facturaService.cuenta.factura_Nombre;

      this._notificationsServie.openSnackbar(this.translate.instant('pos.alertas.cuentaCreadaSeleccionada'));

      //regresar
      this._eventService.verDocumentoEvent(true);
      return;

    }

    //Si hay mas de una coincidencia
    cuentas.forEach(element => {
      //Busar la primera cuenta que tenga el mismo nit
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

  //regresar a modulo de facturacion
  goBack() {
    this._eventService.verDocumentoEvent(true);
  }

  //mostrar pantalla de informe de error
  mostrarError(res: ResApiInterface) {

    //fecha y hora actual
    let dateNow: Date = new Date();

    //infrome de error
    let error = {
      date: dateNow,
      description: res.response,
      storeProcedure: res.storeProcedure,
      url: res.url,

    }

    //guardar error
    PreferencesService.error = error;

    //ver pantalla de informe de errores
    this.verError = true;
  }

}
