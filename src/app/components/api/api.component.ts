import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { HelloService } from 'src/app/services/hello.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { RouteNamesService } from 'src/app/services/route.names.service';
import { WidgetsService } from 'src/app/services/widgets.service';

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
    private _widgetsService: WidgetsService,
    private _helloService: HelloService,
    private translate: TranslateService,
  ) {
  }


  regresar() {
    this._router.navigate([RouteNamesService.LOGIN]);
  }


  async save() {


    if (!this.url) {
      this._widgetsService.openSnackbar(this.translate.instant('pos.url.noValida'), this.translate.instant('pos.ajustes.aceptar'))
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
      this._widgetsService.openSnackbar(this.translate.instant('pos.url.noValida'), this.translate.instant('pos.ajustes.aceptar'))

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
      this._widgetsService.openSnackbar("Algo salió mal, intentalo mas tarder.", "Ok");
      return;
    }

    this._widgetsService.openSnackbar("Url configurada correctamente.", "Ok");



    PreferencesService.baseUrl = result;

    this._router.navigate([RouteNamesService.LOGIN]);


  }

}
