import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { components } from 'src/app/providers/componentes.provider';
import { EventService } from 'src/app/services/event.service';
import { LocalSettingsService } from 'src/app/services/local-settings.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { PreferencesService } from 'src/app/services/preferences.service';

@Component({
  selector: 'app-selected-configuration',
  templateUrl: './selected-configuration.component.html',
  styleUrls: ['./selected-configuration.component.scss'],
  providers: [
    LocalSettingsService
  ]
})
export class SelectedConfigurationComponent implements OnInit {

  //empresas y estaciones de trabajo
  selectedEmpresa?: EmpresaInterface;
  selectedEstacion?: EstacionInterface;
  isLoading: boolean = false;
  regresar: number = 7;
  verInformeError: boolean = false;

  //empresas y estaciones
  empresas: EmpresaInterface[] = [];
  estaciones: EstacionInterface[] = [];

  constructor(
    private _eventService: EventService,
    private _notificationsService: NotificationsService,
    private _localSettingsService: LocalSettingsService,
    private _translate: TranslateService,

  ) {

    this._eventService.regresarConfiguracionSeleccionada$.subscribe((eventData) => {
      this.verInformeError = false;
    });

  };

  ngOnInit(): void {
    this.loadData();
  }

  //Cerrar sesion
  async cerrarSesion(): Promise<void> {
    this._notificationsService.showCloseSesionDialog();

  };
  backHome(): void {
    // this.newItemEvent.emit(false);

    components.forEach(element => {
      element.visible = false;
    });

    this._eventService.emitCustomEvent(false)
  };

  async loadData() {
    let user = PreferencesService.user;
    let token = PreferencesService.token;


    this.isLoading = true;
    // //Consumo de servicios
    let resEmpresas: ResApiInterface = await this._localSettingsService.getEmpresas(user, token);
    //Si el servico se ejecuta mal mostar mensaje
    if (!resEmpresas.status) {
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

      this.mostrarError(resEmpresas);

      return;
    }


    //Guardar Emoresas obtenidas
    this.empresas = resEmpresas.response;

    let resEstacion: ResApiInterface = await this._localSettingsService.getEstaciones(user, token);

    this.isLoading = false;

    if (!resEstacion.status) {
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

      this.mostrarError(resEstacion);
      return;
    }

    this.estaciones = resEstacion.response;

    for (let index = 0; index < this.empresas.length; index++) {
      const element = this.empresas[index];
      if (element.empresa == PreferencesService.empresa.empresa) {
        this.selectedEmpresa = element;
        break;
      }
    }


    for (let index = 0; index < this.estaciones.length; index++) {
      const element = this.estaciones[index];
      if (element.estacion_Trabajo == PreferencesService.estacion.estacion_Trabajo) {
        this.selectedEstacion = element;
        break;
      }
    }

  }

  //visualizar pantalla de error
  mostrarError(res: ResApiInterface) {

    //fecha actual
    let dateNow: Date = new Date();

    //Detalles del error
    let error = {
      date: dateNow,
      description: res.response,
      storeProcedure: res.storeProcedure,
      url: res.url,

    }

    //guardar error en preferencias
    PreferencesService.error = error;

    //ver pantalla de error
    this.verInformeError = true;
  }

}
