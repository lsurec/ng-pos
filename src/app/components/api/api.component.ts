import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ClipboardService } from 'src/app/services/clipboard.service';
import { HelloService } from 'src/app/services/hello.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { RouteNamesService } from 'src/app/services/route.names.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-api',
  templateUrl: './api.component.html',
  styleUrls: ['./api.component.scss'],
  providers: [HelloService]
})
export class ApiComponent {

  url!: string;
  urlStorage: string = PreferencesService.baseUrl;
  isLoading: boolean = false;

  constructor(
    private _router: Router,
    private _notificationService: NotificationsService,
    private _helloService: HelloService,
    private translate: TranslateService,
    private _clipboardService: ClipboardService,
    private _location: Location
  ) {
  }


  copyToClipboard() {
    this._clipboardService.copyToClipboard(PreferencesService.baseUrl);
    //TODO:Translate
    this._notificationService.openSnackbar("Url copiada al portapapeles.");
  }


  goBack() { 

    this._location.back()
  }

  async save() {


    if (!this.url) {
      this._notificationService.openSnackbar(this.translate.instant('pos.alerta.noValida'));
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
      this._notificationService.openSnackbar(this.translate.instant('pos.alerta.noValida'));
      return;
    }

    // Buscar el último índice donde se encuentra "/api/"
    const lastIndex = this.url.lastIndexOf(separator);

    // Eliminar el resto de la URL después del último "/api/"
    let result = this.url.substring(0, lastIndex + separator.length);


    this.isLoading = true;
    let res: ResApiInterface = await this._helloService.getHello(result);
    this.isLoading = false;


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

      let error: ErrorInterface = {
        date: dateNow,
        description: res.response,
        storeProcedure: res.storeProcedure,
        url: res.url,

      }

      PreferencesService.error = error;
      this._router.navigate([RouteNamesService.ERROR]);

      return;
    }

    this._notificationService.openSnackbar(this.translate.instant('pos.alerta.urlCorrecta'));

    PreferencesService.baseUrl = result;

    this._router.navigate([RouteNamesService.LOGIN]);
  }

}
