//Utilidades de angular
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { Location } from '@angular/common';

//Servicio de translate para traducciones
import { TranslateService } from '@ngx-translate/core';

//Interfaces que se estan utilizando 
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';

//Servicios que se estan utilizando
import { HelloService } from 'src/app/services/hello.service';
import { ClipboardService } from 'src/app/services/clipboard.service';
import { RouteNamesService } from 'src/app/services/route.names.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { NotificationsService } from 'src/app/services/notifications.service';

@Component({
  selector: 'app-api',
  templateUrl: './api.component.html',
  styleUrls: ['./api.component.scss'],
  providers: [
    //Inyeccion de servicios
    HelloService
  ]
})
export class ApiComponent {
  //Declaracion de variables
  url!: string; //Alamacenara la url de las apis 
  urlStorage: string = PreferencesService.baseUrl; //Contiene la url guardada en el storage.
  isLoading: boolean = false;

  constructor(
    //Instancia de servicios a utilizar
    private _router: Router,
    private _location: Location,
    private translate: TranslateService,
    private _helloService: HelloService,
    private _clipboardService: ClipboardService,
    private _notificationService: NotificationsService,
  ) {
  }

  //Copia la URL base al portapapeles.
  copyToClipboard(): void {
    this._clipboardService.copyToClipboard(PreferencesService.baseUrl);
    //muestra un mensaje indicnado que ha copiiado la url
    this._notificationService.openSnackbar(this.translate.instant('pos.alertas.urlCopiada'));
  }

  //Regresa a la pagina o pantalla anterior
  goBack(): void {
    this._location.back();
  }

  //Verificar la url y guardarla si es valida
  async save(): Promise<void> {
    //Si la url esta vacia muestra una alerta 
    if (!this.url) {
      this._notificationService.openSnackbar(this.translate.instant('pos.alertas.noValida'));
      return;
    }

    // La URL debe contener al menos un "/api/" para ser una URL válida
    let separator = "/api/";

    // Convertir la URL a minúsculas
    this.url = this.url.toLowerCase();

    // Verificar si la URL contiene "/api/"
    let containsApi = this.url.includes(separator);

    // Si no contiene "/api/", mostrar un mensaje y devolver undefined
    if (!containsApi) {
      this._notificationService.openSnackbar(this.translate.instant('pos.alertas.noValida'));
      return;
    }

    // Buscar el último índice donde se encuentra "/api/"
    const lastIndex = this.url.lastIndexOf(separator);

    // Eliminar el resto de la URL después del último "/api/"
    let result = this.url.substring(0, lastIndex + separator.length);

    //Mostrar pantalla de carga
    this.isLoading = true;

    //Consumo de api que verifica que todo esta funcionando bien.
    let res: ResApiInterface = await this._helloService.getHello(result);
    //Ocultar pantalla de carga
    this.isLoading = false;

    //Si algo salio mal abre el dialogo indicando que algo salio mal
    if (!res.status) {
      let verificador = await this._notificationService.openDialogActions(
        {
          title: this.translate.instant('pos.alertas.salioMal'),
          description: this.translate.instant('pos.alertas.error'),
          verdadero: this.translate.instant('pos.botones.informe'),
          falso: this.translate.instant('pos.botones.aceptar'),
        }
      );

      if (!verificador) return;

      let dateNow: Date = new Date();

      //Ver Informe del error
      let error: ErrorInterface = {
        date: dateNow,
        description: res.response,
        storeProcedure: res.storeProcedure,
        url: res.url,
      }

      //Guardar el error en preferencias de usuario
      PreferencesService.error = error;
      //Redirigir a la pagina de informes de errores
      this._router.navigate([RouteNamesService.ERROR]);

      return;
    }

    //Notificacion que indica que la url esta correcta
    this._notificationService.openSnackbar(this.translate.instant('pos.alertas.urlCorrecta'));

    //Guardar la url en las preferencias del usuario 
    PreferencesService.baseUrl = result;

    //Dirigirse al Login
    this._router.navigate([RouteNamesService.LOGIN]);
  }

}
