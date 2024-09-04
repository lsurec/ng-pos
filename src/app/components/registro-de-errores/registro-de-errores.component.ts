import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ErrorService } from 'src/app/services/error.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { EventService } from 'src/app/services/event.service';
import { ErrorLogInterface } from 'src/app/interfaces/error-log.interface';
import { NotificationsService } from 'src/app/services/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { DetalleErrorComponent } from '../detalle-error/detalle-error.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-registro-de-errores',
  templateUrl: './registro-de-errores.component.html',
  styleUrls: ['./registro-de-errores.component.scss'],
  providers: [
    ErrorService,
  ]
})
export class RegistroDeErroresComponent implements OnInit {

  isLoading: boolean = false;
  verError: boolean = false;
  token: string = PreferencesService.token;
  errors: ErrorLogInterface[] = [];
  readonly regresar: number = 16; //id de la pantlla

  constructor(
    private _errorService: ErrorService,
    private _eventService: EventService,
    private _notificationsService: NotificationsService,
    private _translate: TranslateService,
    private _dialog: MatDialog,
  ) {

    this._eventService.verErrores$.subscribe((eventData) => {
      this.verError = false;
    });

  }


  ngOnInit(): void {
    this.loadData();
  }

  async loadData() {

    this.isLoading = true;


    let resApi: ResApiInterface = await this._errorService.getError(this.token);


    if (!resApi.status) {

      this.isLoading = false;

      let verificador = await this._notificationsService.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.informe'),
          falso: this._translate.instant('pos.botones.aceptar'),
        }
      );

      if (!verificador) return;

      this.mostrarError(resApi);

      return;
    }

    this.errors = [];
    this.errors = resApi.response;

    this.isLoading = false;
  }

  //Abrir/Cerrar SideNav
  // @ViewChild('sidenav')
  // sidenav!: MatSidenav;
  @ViewChild('sidenavend')
  sidenavend!: MatSidenav;


  //Abrir cerrar Sidenav
  close(reason: string) {
    // this.sidenav.close();
    this.sidenavend.close();
  }

  pantallaError() {
    this.verError = true;
  }

  //motstrar oantalla de informe de error
  mostrarError(res: ResApiInterface) {

    //Fecha y hora ctual
    let dateNow: Date = new Date();

    //informe de error
    let error = {
      date: dateNow,
      description: res.response,
      storeProcedure: res.storeProcedure,
      url: res.url,

    }

    //guardra error
    PreferencesService.error = error;

    //mmostrar pantalla de informe de error
    this.verError = true;
  }

  //regresear a menu (pantalla de inicio)
  goBack(): void {
    this._eventService.verHomeEvent(false);
  }

  detalles(error: ErrorLogInterface) {
    //abre el dialogo
    this._dialog.open(DetalleErrorComponent, {
      data: error,
    });
  }


}
