import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { LanguageInterface } from 'src/app/interfaces/language.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { languagesProvider, indexDefaultLang } from 'src/app/providers/languages.provider';
import { ok, salioMal } from 'src/app/providers/mensajes.provider';
import { LocalSettingsService } from 'src/app/services/local-settings.service';
import { MensajesService } from 'src/app/services/mensajes.service';
import { RouteNamesService } from 'src/app/services/route.names.service';
import { SharedService } from 'src/app/services/shared.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { WidgetsService } from 'src/app/services/widgets.service';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss'],
  providers: [
    //Inyctar servicios
    LocalSettingsService,
    WidgetsService,
  ]
})
export class SplashComponent {

  //Lista de empresas y estaciones
  empresas: EmpresaInterface[] = [];
  estaciones: EstacionInterface[] = [];

  constructor(
    private _router: Router,
    private _shared: SharedService,
    private translate: TranslateService,
    private _widgetsService: WidgetsService,
    private _empresa: LocalSettingsService,
    private _estacion: LocalSettingsService,
  ) {

    //Cargar Datos
    this.loadData();
  }

  async loadData(): Promise<void> {


    if (!PreferencesService.lang) {
      setTimeout(() => {
        this._router.navigate([RouteNamesService.LANGUAGE]);
      }, 1000);
      return;
    }

    if (!PreferencesService.theme) {
      setTimeout(() => {
        this._router.navigate([RouteNamesService.THEME]);
      }, 1000);
      return;
    }

    if (!PreferencesService.token) {
      setTimeout(() => {
        this._router.navigate([RouteNamesService.LOGIN]);
      }, 1000);
      return;
    }



    // //Consumo de servicios
    // let resEmpresas: ResApiInterface = await this._empresa.getEmpresas();
    // //Si el servico se ejecuta mal mostar mensaje
    // if (!resEmpresas.status) {
    //   this._widgetsService.openSnackbar(this.translate.instant('pos.alertas.salioMal'), this.translate.instant('pos.alertas.ok'));
    //   console.error(resEmpresas.response);
    //   console.error(resEmpresas.storeProcedure);
    //   //si algo sale mal ira a la pantalla de no encontrado
    //   this._router.navigate(['/notFound']);
    //   return
    // };

    // //Guardar Empresas obtenidas
    // this.empresas = resEmpresas.response;

    // //Consumo de api
    // let resEstaciones: ResApiInterface = await this._estacion.getEstaciones();
    // //Si el servico se ejecuta mal mostar mensaje
    // if (!resEstaciones.status) {
    //   this._widgetsService.openSnackbar(this.translate.instant('pos.alertas.salioMal'), this.translate.instant('pos.alertas.ok'));
    //   console.error(resEstaciones.response);
    //   console.error(resEstaciones.storeProcedure);
    //   //si algo sale mal ira a la pantalla de no encontrado
    //   this._router.navigate(['/notFound']);
    //   return
    // };

    // //Guardar Estaciones obtenidas
    // this.estaciones = resEstaciones.response;
    // // this.estaciones.push(this.estaciones[0]);

    // //Si las listas tienen mas de un elemento mostrar pantalla de configuracion local
    // if (this.empresas.length > 1 || this.estaciones.length > 1) {
    //   //mostrar listas con propiedades
    //   this._shared.empresas = this.empresas;
    //   this._shared.estaciones = this.estaciones;
    //   this._router.navigate(['/station']);
    //   return;
    // }



  }
}
