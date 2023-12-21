import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { LanguageInterface } from 'src/app/interfaces/language.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { languagesProvider, indexDefaultLang } from 'src/app/providers/languages.provider';
import { ok, salioMal } from 'src/app/providers/mensajes.provider';
import { ConfiguracionLocalService } from 'src/app/services/configuracion-local.service';
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
    ConfiguracionLocalService,
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
    private _empresa: ConfiguracionLocalService,
    private _estacion: ConfiguracionLocalService,
  ) {

    //Cargar Datos
    this.loadData();
  }

  async loadData(): Promise<void> {

    //Verificar si hay una sesion con token iniciada
    //temporizador para ver la pantalla de ccarga de datos (LOGO)
    setTimeout(() => {
      

      if (!PreferencesService.lang) {
        this._router.navigate([RouteNamesService.LANGUAGE]);
        return
      }
  
      if (PreferencesService.theme == "1") {
        this._router.navigate([RouteNamesService.THEME]);
        return
      }

      if (!PreferencesService.token) {
        this._router.navigate([RouteNamesService.LOGIN]);
        return;
      }
    }, 1000);


    //Consumo de servicios
    let resEmpresas: ResApiInterface = await this._empresa.getEmpresas();
    //Si el servico se ejecuta mal mostar mensaje
    if (!resEmpresas.status) {
      this._widgetsService.openSnackbar("csac", "ok");
      console.error(resEmpresas.response);
      console.error(resEmpresas.storeProcedure);
      //si algo sale mal ira a la pantalla de no encontrado
      this._router.navigate(['/notFound']);
      return
    };

    //Guardar Empresas obtenidas
    this.empresas = resEmpresas.response;

    //Consumo de api
    let resEstaciones: ResApiInterface = await this._estacion.getEstaciones();
    //Si el servico se ejecuta mal mostar mensaje
    if (!resEstaciones.status) {
      this._widgetsService.openSnackbar("csac", "ok");
      console.error(resEstaciones.response);
      console.error(resEstaciones.storeProcedure);
      //si algo sale mal ira a la pantalla de no encontrado
      this._router.navigate(['/notFound']);
      return
    };

    //Guardar Estaciones obtenidas
    this.estaciones = resEstaciones.response;
    // this.estaciones.push(this.estaciones[0]);

    //Si las listas tienen mas de un elemento mostrar pantalla de configuracion local
    if (this.empresas.length > 1 || this.estaciones.length > 1) {
      //mostrar listas con propiedades
      this._shared.empresas = this.empresas;
      this._shared.estaciones = this.estaciones;
      this._router.navigate(['/station']);
      return;
    };

    // Guardar la etaciones
    PreferencesService.empresa = JSON.stringify(this.empresas[0]);
    PreferencesService.estacion = JSON.stringify(this.estaciones[0]);

    //Navegar a pantalla principal (Home)
    this._router.navigate(['/home']);
  };

}
