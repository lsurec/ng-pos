import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PreferencesService } from './services/preferences.service';
import { LanguageInterface } from './interfaces/language.interface';
import { languagesProvider, indexDefaultLang } from './providers/languages.provider';
import { ThemeService } from './services/theme.service';
import { ColoresInterface } from './interfaces/filtro.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  //Idiomas disponibles para la aplicacion
  languages: LanguageInterface[] = languagesProvider;
  activeLang: LanguageInterface;
  idioma: number = indexDefaultLang;

  constructor(
    private translate: TranslateService,
    private themeService: ThemeService,

  ) {
    //Buscar y obtener el leguaje guardado en el servicio  
    let getLanguage = PreferencesService.lang;
    if (!getLanguage) {
      this.activeLang = languagesProvider[indexDefaultLang];
      this.translate.setDefaultLang(this.activeLang.lang);
    } else {
      //sino se encuentra asignar el idioma por defecto
      this.idioma = +getLanguage;
      this.activeLang = languagesProvider[this.idioma];
      this.translate.setDefaultLang(this.activeLang.lang);
    };

    //buscar y asignar tema
    if (PreferencesService.theme == '1') {
      this.themeService.isDarkTheme = true;
      this.themeService.updateTheme();
    }

    //tamaño de fuente
    let getFontSize: string = PreferencesService.fontSizeStorage;

    if (!getFontSize) {
      themeService.globalFontSize = "14px";
    } else {
      themeService.globalFontSize = getFontSize;
    }

    //color de fondo
    let getColorFondo: string = PreferencesService.fondoApp;

    if (!getColorFondo) {
      themeService.fondo = "#FEF5E7";
    } else {
      themeService.fondo = getColorFondo;
    }

    //color de fondo
    let getColor: string = PreferencesService.colorApp;

    if (!getColor) {
      themeService.color = "#134895";
    } else {
      themeService.color = getColor;
    }

  }

  //1px solid #c1bfbf

  ngOnInit(): void {

    //color de fondo
    let getColor: string = PreferencesService.colorApp;

    if (!getColor) {
      this.themeService.color = "#134895";
      PreferencesService.colorApp = this.themeService.color;

    } else {
      this.themeService.color = getColor;
      PreferencesService.colorApp = this.themeService.color;

    }

    // Obtener el valor de globalFontSize del servicio y establecerlo como una variable CSS
    document.documentElement.style.setProperty('--global-font-size', this.themeService.globalFontSize);
    document.documentElement.style.setProperty('--global-color-fondo', this.themeService.fondo);
    document.documentElement.style.setProperty('--global-color', this.themeService.color);
    document.documentElement.style.setProperty('--seleccionado2', "#5d6d6c");
    document.documentElement.style.setProperty('--blanco', "#fff");
    document.documentElement.style.setProperty('--texto-boton', "#cdc7c7");
    document.documentElement.style.setProperty('--gris', "#777");
    document.documentElement.style.setProperty('--negro', "#000000");
    document.documentElement.style.setProperty('--requerido', "rgba(0, 0, 0, 0.05)");
    document.documentElement.style.setProperty('--error', "#cc4141");
    document.documentElement.style.setProperty('--mas-contenido', "0px -3px 10px 1.5px rgba(0, 0, 0, 0.2)");
    document.documentElement.style.setProperty('--hover', "#ebebeb");
    document.documentElement.style.setProperty('--pestana', "#555");
    document.documentElement.style.setProperty('--dias', "#a9a9a9");
    document.documentElement.style.setProperty('--activa-p', "#ffa500");




    //Nuevos estilos para tema claro
    document.documentElement.style.setProperty('--primario-oscuro', this.oscuro.primario);
    document.documentElement.style.setProperty('--fondo-oscuro', this.oscuro.fondo);
    document.documentElement.style.setProperty('--bloques-oscuro', this.oscuro.bloques);
    document.documentElement.style.setProperty('--seleccionado-oscuro', this.oscuro.seleccionado);
    document.documentElement.style.setProperty('--descuento-oscuro', this.oscuro.descuento);
    document.documentElement.style.setProperty('--cargo-oscuro', this.oscuro.cargo);
    document.documentElement.style.setProperty('--saldo-oscuro', this.oscuro.saldo);
    document.documentElement.style.setProperty('--scroll-oscuro', this.oscuro.scroll);
    document.documentElement.style.setProperty('--bordes-oscuro', this.oscuro.bordes);
    document.documentElement.style.setProperty('--navegacion-oscuro', this.oscuro.navegacion);
    document.documentElement.style.setProperty('--sombra-oscuro', this.oscuro.sombra);
    document.documentElement.style.setProperty('--pestana-oscuro', this.oscuro.pestana);
    document.documentElement.style.setProperty('--iconos-oscuro', this.oscuro.iconos);
    document.documentElement.style.setProperty('--boton-ico-oscuro', this.oscuro.botonIcono);
    document.documentElement.style.setProperty('--placeholder-oscuro', this.oscuro.placeholder);

    //Tema Claro
    document.documentElement.style.setProperty('--primario-claro', this.claro.primario);
    document.documentElement.style.setProperty('--fondo-claro', this.claro.fondo);
    document.documentElement.style.setProperty('--bloques-claro', this.claro.bloques);
    document.documentElement.style.setProperty('--seleccionado-claro', this.claro.seleccionado);
    document.documentElement.style.setProperty('--descuento-claro', this.claro.descuento);
    document.documentElement.style.setProperty('--cargo-claro', this.claro.cargo);
    document.documentElement.style.setProperty('--saldo-claro', this.claro.saldo);
    document.documentElement.style.setProperty('--scroll-claro', this.claro.scroll);
    document.documentElement.style.setProperty('--bordes-claro', this.claro.bordes);
    document.documentElement.style.setProperty('--navegacion-claro', this.claro.navegacion);
    document.documentElement.style.setProperty('--sombra-claro', this.claro.sombra);
    document.documentElement.style.setProperty('--pestana-claro', this.claro.pestana);
    document.documentElement.style.setProperty('--iconos-claro', this.claro.iconos);
    document.documentElement.style.setProperty('--boton-ico-claro', this.claro.botonIcono);
    document.documentElement.style.setProperty('--placeholder-claro', this.claro.placeholder);

  }

  claro: ColoresInterface = {
    primario: "#134895",
    fondo: "#FEF5E7",
    bloques: "rgba(0, 0, 0, 0.03)",
    seleccionado: "#777",
    descuento: "#ce1414",
    cargo: "#25a704",
    saldo: "#134895",
    scroll: "#134895",
    bordes: "rgba(0, 0, 0, 0.12)",
    navegacion: "#f0f0f0",
    sombra: "0px 1px 0px 1px rgba(0, 0, 0, 0.1)",
    pestana: "#134895",
    iconos: "#777",
    botonIcono: "#fffff",
    seleccionado2: "#5d6d6c",
    placeholder: "rgba(0, 0, 0, 0.502)"
  }


  oscuro: ColoresInterface = {
    primario: "#134895",
    fondo: "#302f2f",
    bloques: "rgba(127, 121, 121, 0.31)",
    seleccionado: "#5f5f5f",
    descuento: "#ff3a3a",
    cargo: "#44ff14",
    saldo: "#8fbcfe",
    scroll: "#635f5f",
    bordes: "#8a8484",
    navegacion: "#252323",
    sombra: "0px 1px 0px 1px rgba(164, 164, 164, 0.29)",
    pestana: "#df9722",
    iconos: "#c4c4c4",
    botonIcono: "#c4c4c4",
    seleccionado2: "#5d6d6c",
    placeholder: "#eef0f3e0"
  };


}
