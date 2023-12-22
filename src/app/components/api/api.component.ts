import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PreferencesService } from 'src/app/services/preferences.service';
import { RouteNamesService } from 'src/app/services/route.names.service';
import { WidgetsService } from 'src/app/services/widgets.service';

@Component({
  selector: 'app-api',
  templateUrl: './api.component.html',
  styleUrls: ['./api.component.scss']
})
export class ApiComponent {

  url!: string;

  urlStorage: string = PreferencesService.baseUrl;

  constructor(
    private _router: Router,
    private _widgetsService: WidgetsService,
    private translate: TranslateService,
  ) {
  }

  ngOnInit(): void {
    if (PreferencesService.baseUrl) {
      this.urlStorage = PreferencesService.baseUrl;
      this.url = '';
    }
  };

  guardar(): void {

    if (!this.url) {
      this._widgetsService.openSnackbar(this.translate.instant('pos.url.noValida'), this.translate.instant('pos.ajustes.aceptar'));
      return
    }
    this._router.navigate([RouteNamesService.LOGIN]);
    PreferencesService.baseUrl = this.url;
  }


  regresar() {
    this._router.navigate([RouteNamesService.LOGIN]);
  }

  cambiar() {

    if (!this.url) {
      PreferencesService.baseUrl = this.urlStorage;
      this._widgetsService.openSnackbar(this.translate.instant('pos.url.noValida'), this.translate.instant('pos.ajustes.aceptar'))
      return
      this._router.navigate([RouteNamesService.LOGIN]);
    } else {
      PreferencesService.baseUrl = this.url;
      this._router.navigate([RouteNamesService.LOGIN]);
    }

  }

}
