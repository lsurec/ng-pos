import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { LoginInterface } from 'src/app/interfaces/login.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { UserInterface } from 'src/app/interfaces/user.interface';
import { ApiService } from 'src/app/services/api.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { GlobalRestaurantService } from '../../services/global-restaurant.service';
import { LoginService } from 'src/app/services/login.service';
import { TipoAccionService } from 'src/app/services/tipo-accion.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ErrorInterface } from 'src/app/interfaces/error.interface';

@Component({
  selector: 'app-permisions',
  templateUrl: './permisions.component.html',
  styleUrls: ['./permisions.component.scss'],
  providers: [
    LoginService,
    TipoAccionService,
  ]
})
export class PermisionsComponent {

  clave: string = "";
  nombre: string = "";

  constructor(
    private _translate: TranslateService,
    public dialogRef: MatDialogRef<PermisionsComponent>,
    private _notificationService: NotificationsService,
    public restauranteService: GlobalRestaurantService,
    private _loginService: LoginService,
    private _tipoAccionService: TipoAccionService,
  ) {
  }

  cancelar() {
    this.dialogRef.close();
  }

  async ingresar() {
    //Sino hay usuario ni contrase;a mostrar notificacion de que debe completar
    if (!this.nombre || !this.clave) {
      this._notificationService.openSnackbar(this._translate.instant('pos.alertas.completar'));
      return
    }

    //Interface de credenciales
    let formValues: UserInterface = {
      pass: this.clave,
      user: this.nombre
    };

    //antes de ejecutarse
    this.restauranteService.isLoading = true;

    const apiLogin = () => this._loginService.postLogin(formValues);

    let res: ResApiInterface = await ApiService.apiUse(apiLogin);; //consumo del api


    ///Si el servico se ejecuta mal mostar menaje
    if (!res.status) {
      //TODO:Pantalla de error
      this.restauranteService.isLoading = false;

      this.showError(res);
      this.dialogRef.close();

      return;
    };

    //Si el servicio se ejucuto ben
    //Obtener la respuesta del api login
    let resLogin: LoginInterface = res.response;
    //si algo esta incorrecto mostrar mensaje

    if (!resLogin.success) {
      this.restauranteService.isLoading = false;
      this._notificationService.openSnackbar(this._translate.instant('pos.alertas.incorrecto'));
      return;
    };

    //validar tipo accion
    const apiTipoAccion = () => this._tipoAccionService.getTipoAccion(
      45, //45 transaccion, 32 mesa
      resLogin.user,
      resLogin.message,
    );

    let resTipoAccion = await ApiService.apiUse(apiTipoAccion);


    if (!resTipoAccion.status) {

      //TODO:Pantalla de error
      this.restauranteService.isLoading = false;

      this.showError(resTipoAccion);
      this.dialogRef.close();
      return;
    };

    this.restauranteService.isLoading = false;


    if (!resTipoAccion.response["data"]) {

      this._notificationService.openSnackbar(`El usuario ${this.nombre} no tiene permisos para esta accion`) //TODO:Translate
      return;

    }

    //Retornar true para navegar a traslado
    this.dialogRef.close(true);

  }


  async showError(res: ResApiInterface) {

    //Diaogo de confirmacion
    let verificador = await this._notificationService.openDialogActions(
      {
        title: this._translate.instant('pos.alertas.salioMal'),
        description: this._translate.instant('pos.alertas.error'),
        verdadero: this._translate.instant('pos.botones.informe'),
        falso: this._translate.instant('pos.botones.aceptar'),
      }
    );

    //Cancelar
    if (!verificador) return;

    let dateNow: Date = new Date(); //fecha del error

    //Crear error
    let error: ErrorInterface = {
      date: dateNow,
      description: res.response,
      storeProcedure: res.storeProcedure,
      url: res.url,
    }

    //Guardar error
    PreferencesService.error = error;

    //TODO:mostrar pantalla de error

    this.restauranteService.verError = true;

    return;
  }

}
