import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { NotificationsService } from 'src/app/services/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { RouteNamesService } from 'src/app/services/route.names.service';
import { EventService } from 'src/app/services/event.service';
import { CuentaCorrentistaInterface } from '../../interfaces/cuenta-correntista';
import { CuentaService } from '../../services/cuenta.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';

@Component({
  selector: 'app-nuevo-cliente',
  templateUrl: './nuevo-cliente.component.html',
  styleUrls: ['./nuevo-cliente.component.scss'],
  providers:[
    CuentaService,
  ]
})
export class NuevoClienteComponent {

  nombre!: string;
  direccion!: string;
  nit!: string;
  telefono!: string;
  correo!: string;

  isLoading: boolean = false;

  constructor(
    private _notificationsService: NotificationsService,
    private translate: TranslateService,
    private _eventService: EventService,
    private _cuentaService:CuentaService,
  ) {
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
      this._notificationsService.openSnackbar(this.translate.instant('pos.alertas.completar'));
      return
    }

    //Validar correo
    if(!this.validarCorreo(this.correo)){
      //TODO:Translate
      this._notificationsService.openSnackbar("El correo ingresado no es valido");
      return;
    }

    //Crear cuenta
    
    //nueva cuneta
    let cuenta: CuentaCorrentistaInterface = {
      correo: this.correo,
      direccion: this.direccion,
      id: 0,
      nit: this.nit,
      nombre: this.nombre,
      telefono: this.telefono
    }

    
    let user: string = PreferencesService.user;
    let token: string = PreferencesService.token;
    let empresa: number = PreferencesService.empresa.empresa;
    
    this.isLoading = true;
    
    //Usar servicio crear cuenta
    let resCuenta:ResApiInterface = await this._cuentaService.postCuenta(
      user,
      token,
      empresa,
      cuenta,
    )

    //Si el servicio falló
    if(!resCuenta.status){
      this.isLoading = false;
      this._notificationsService.showErrorAlert(resCuenta);
      return;
    }

    //buscar informacin de la cuenta  creada
    let infoCuenta:ResApiInterface = await this._cuentaService.getClient(
      user,
      token,
      empresa,
      cuenta.nit,
    );

    if(!infoCuenta.response){
      this._notificationsService.showErrorAlert(infoCuenta);
      return;
    }


    //regresar
    this._eventService.verDocumentoEvent(true);
    
  }

  goBack() {
    this._eventService.verDocumentoEvent(true);
  }

}
