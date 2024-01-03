import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { LanguageInterface } from 'src/app/interfaces/language.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { indexDefaultLang, languagesProvider } from 'src/app/providers/languages.provider';
import { borraranDatos, cancelar, debeSeleccionar, noSeleccionado, ok, salioMal, tituloCerrar } from 'src/app/providers/mensajes.provider';
import { LocalSettingsService } from 'src/app/services/local-settings.service';
import { EventService } from 'src/app/services/event.service';
import { MensajesService } from 'src/app/services/mensajes.service';
import { RouteNamesService } from 'src/app/services/route.names.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { WidgetsService } from 'src/app/services/widgets.service';
import { DataUserService } from 'src/app/services/data-user.service';

@Component({
  selector: 'app-local-config',
  templateUrl: './local-config.component.html',
  styleUrls: ['./local-config.component.scss'],
  providers: [
    //inyeccion de servicios
    LocalSettingsService,
    WidgetsService
  ]
})
export class LocalConfigComponent {
  //Declaracion de variables
  nonSelect: string = ''; //frase que indica que no se ha seleccionado empresa o estacion
  isLoading: boolean = false; //pantalla de carga

  //empresa seleccionada y estacion seleccionada
  empresaSelect?: EmpresaInterface;
  estacionSelect?: EstacionInterface;

  regresar: boolean = true;

  //Idiomas disponibles de la aplicacion
  languages: LanguageInterface[] = languagesProvider;
  idioma: number = indexDefaultLang;

  constructor(
    //Instancia de servicios a utilizar
    private _router: Router,
    private _eventService: EventService,
    private translate: TranslateService,
    private _widgetsService: WidgetsService,
    public dataUserService: DataUserService,


  ) {
    if (dataUserService.estaciones.length == 1) {

      this.estacionSelect = dataUserService.estaciones[0];

    }

    if (dataUserService.empresas.length == 1) {

      this.empresaSelect = dataUserService.empresas[0]

    }

  }

  saveSettings() {
    console.log(this.dataUserService.token);
    
    console.log(this.dataUserService.estaciones);
    
    //Validar que se seleccione empresa y estacion
    if (!this.empresaSelect || !this.estacionSelect) {
      this._widgetsService.openSnackbar(this.translate.instant('pos.alertas.debeSeleccionar'), this.translate.instant('pos.alertas.ok'));
      return;
    };

    //Guardar empresa y estacion seleccionada en el Storage y navegar a Home
    this.dataUserService.selectedEmpresa = this.empresaSelect;
    this.dataUserService.selectedEstacion = this.estacionSelect;
    this._router.navigate([RouteNamesService.HOME]);
  }

  async cerrarSesion() {
    // //Cerrar sesion
    // let verificador = await this._widgetsService.openDialogActions(
    //   {
    //     title: MensajesService.findValueLrCode(tituloCerrar, this.activeLang),
    //     description: MensajesService.findValueLrCode(borraranDatos, this.activeLang),
    //     verdadero: MensajesService.findValueLrCode(ok, this.activeLang),
    //     falso: MensajesService.findValueLrCode(cancelar, this.activeLang)
    //   }
    // );

    // if (!verificador) return;

    localStorage.removeItem("token");
    localStorage.removeItem("name");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("name");

    //Regresar a Login
    this._router.navigate([RouteNamesService.LOGIN]);

    // Limpiar storage del navegador
    localStorage.clear();
    sessionStorage.clear();
  }

  //regresar a la pantalla anterior
  backHome(): void {
    // this.newItemEvent.emit(false);
    this._eventService.emitCustomEvent(false)
  };
}
