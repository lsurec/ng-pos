import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { RouteNamesService } from 'src/app/services/route.names.service';
import { StorageService } from 'src/app/services/storage.service';
import { WidgetsService } from 'src/app/services/widgets.service';

@Component({
  selector: 'app-api',
  templateUrl: './api.component.html',
  styleUrls: ['./api.component.scss']
})
export class ApiComponent {

  url!: string;

  urlStorage: string = StorageService.baseUrl;

  constructor(
    private _router: Router,
    private _widgetsService: WidgetsService,
    private translate: TranslateService,
  ) {
  }

  ngOnInit(): void {
    if (StorageService.baseUrl) {
      this.urlStorage = StorageService.baseUrl;
      this.url = '';
    }
  };

  guardar(): void {

    if (!this.url) {
      this._widgetsService.openSnackbar(this.translate.instant('pos.url.noValida'), this.translate.instant('pos.ajustes.aceptar'));
      return
    }
    this._router.navigate([RouteNamesService.LOGIN]);
    StorageService.baseUrl = this.url;
  }


  regresar() {
    this._router.navigate([RouteNamesService.LOGIN]);
  }

  cambiar() {

    if (!this.url) {
      StorageService.baseUrl = this.urlStorage;
      this._widgetsService.openSnackbar(this.translate.instant('pos.url.noValida'), this.translate.instant('pos.ajustes.aceptar'))
      return
      this._router.navigate([RouteNamesService.LOGIN]);
    } else {
      StorageService.baseUrl = this.url;
      this._router.navigate([RouteNamesService.LOGIN]);
    }

  }

}
