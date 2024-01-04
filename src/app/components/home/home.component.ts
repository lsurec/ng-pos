import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AplicacionesInterface } from 'src/app/interfaces/aplicaciones.interface';
import { ComponentesInterface } from 'src/app/interfaces/components.interface';
import { DisplaysInterface } from 'src/app/interfaces/displays.interface';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { LanguageInterface } from 'src/app/interfaces/language.interface';
import { MenuDataInterface, MenuInterface } from 'src/app/interfaces/menu.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { components } from 'src/app/providers/componentes.provider';
import { indexDefaultLang, languagesProvider } from 'src/app/providers/languages.provider';
import { activo, borraranDatos, cancelar, inactivo, noAsignado, ok, salioMal, tituloCerrar } from 'src/app/providers/mensajes.provider';
import { EventService } from 'src/app/services/event.service';
import { MenuService } from 'src/app/services/menu.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { RouteNamesService } from 'src/app/services/route.names.service';
import { ThemeService } from 'src/app/services/theme.service';
import { WidgetsService } from 'src/app/services/widgets.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  // Inyectar servicios
  providers: [
    WidgetsService,
    MenuService,
  ]
})
export class HomeComponent {

  //token y usuario
  user = PreferencesService.user;
  token = PreferencesService.token;

  //Abrir/Cerrar SideNav
  @ViewChild('sidenav')
  sidenav!: MatSidenav;
  @ViewChild('sidenavend')
  sidenavend!: MatSidenav;

  //Variables para inputs
  isLoading: boolean = false;
  vistaActiva: number = 1; //boton de vista activa
  primerDiaSemana: number = 0;

  //empresas y estaciones de trabajo
  selectedEmpresa!: EmpresaInterface;
  selectedEstacion!: EstacionInterface;

  //Ver configuraciones y detalles del usuario
  temas: boolean = false;
  detallesUsuario: boolean = true;
  ajustes: boolean = false;
  idiomas: boolean = false;
  btnRegresar: boolean = false;
  tema: string = '';

  //Subir contenido
  showGoUpButton: boolean = false;
  showScrollHeight: number = 400; //En cuantos pixeles se va a mostrar el boton
  hideScrollHeight: number = 200; //en cuantos se va a ocultar

  ///LENGUAJES: Opciones lenguajes
  activeLang: LanguageInterface;
  idioma: number = indexDefaultLang;
  languages: LanguageInterface[] = languagesProvider;
  temaOscuro: boolean = false;
  //Guardar el nombre del usuario
  userName: string = '';

  aplicaciones: AplicacionesInterface[] = [];
  displays: DisplaysInterface[] = [];
  vistaMenu: string = '';

  //Variables para mostrar componentes segun el menu
  components: ComponentesInterface[] = components;

  hideHome: boolean = false;

  //MENU
  clickedItem?: number;
  menuData: MenuDataInterface[] = [];
  menu: MenuInterface[] = []; // lista de menu completo
  // menu activo que el usuario ve en pantalla
  menuActive: MenuInterface[] = [];
  // Ruta en la que el usuario esta navegando
  routeMenu: MenuInterface[] = [];
  hover: Boolean = false;
  indiceSeleccionado: number = 0;
  // Mostrar componente datos de usuario


  
  constructor(
    //Declaracion de variables privadas
    private _router: Router,
    private _menu: MenuService,
    private translate: TranslateService,
    private _eventService: EventService,
    private _widgetsService: WidgetsService,
    private themeService: ThemeService
  ) {

    this._eventService.customEvent$.subscribe((eventData) => {
      this.viewHome(eventData);
    });

    //obtener nombre de usuario de la sesión
    // this.userName = UserService.getUser().toUpperCase();

    // localStorage.clear();
    // sessionStorage.clear();

    //Funcion que carga datos
    this.loadData();

    //Agregar evento scroll
    window.addEventListener('scroll', this.scrollEvent, true);

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

    this.temaOscuro = themeService.isDarkTheme;

    if (this.temaOscuro == true) {
      this.tema = this.translate.instant('pos.home.activo');
    } else {
      this.tema = this.translate.instant('pos.home.inactivo');
    }
  };

  //cuando la informacion de los detalles esta vacia
  resolveObject(objeto: any): string {
    if (objeto == null)
      return this.translate.instant('pos.home.noAsignado');
    return objeto;
  };

  capitalizarTexto(texto: string): string {
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLocaleLowerCase();
  };

  //Abrir cerrar Sidenav
  close(reason: string): void {
    this.sidenav.close();
    this.sidenavend.close();
  };

  //Obtener nombre 
  getNameByLanguageRegion(data: LanguageInterface): string | undefined {
    const { names } = data;
    const languageRegion = names.find((item) => item.lrCode === `${this.activeLang.lang}-${this.activeLang.reg}`);
    return languageRegion ? languageRegion.name : undefined;
  };

  //Asigna un nuevo lenguaje
  changeLang(lang: number): void {
    this.idioma = lang;
    this.activeLang = languagesProvider[lang];
    this.translate.use(this.activeLang.lang);
    PreferencesService.lang = JSON.stringify(lang);
    this.verDetalles();
  };

  //Cargar datos
  async loadData(): Promise<void> {
    //Cargando en true
    this.isLoading = true;
    await this.loadDataMenu();
    //Cargando en false
    this.isLoading = false;
  };

  //Escuchando scroll en todos los elementos
  scrollEvent = (event: any): void => {
    const number = event.srcElement.scrollTop; //Donde inicia el scroll

    //verificar que el scrool se ejecute dentro de la calse container_main
    if (event.srcElement.className == "container_main") {
      //evakuar si el scroll esta en la cantidad de pixeles para mostrar el boton
      if (number > this.showScrollHeight) {
        this.showGoUpButton = true; //MMostatr boton
      } else if (number < this.hideScrollHeight) {
        this.showGoUpButton = false; //ocultar boton
      };
    };
  };

  //Evento del scroll
  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.scrollEvent, true);
  };

  //Vista de Calendario
  viewHome(value: boolean): void {
    this.hideHome = value;
  };
  //Cerrar sesion
  async cerrarSesion(): Promise<void> {
    let verificador: boolean = await this._widgetsService.openDialogActions(
      {
        title: this.translate.instant('pos.home.tituloCerrar'),
        description: this.translate.instant('pos.home.borraranDatos'),
        verdadero: this.translate.instant('pos.botones.aceptar'),
        falso: this.translate.instant('pos.botones.cancelar'),
      }
    );

    if (!verificador) return;
    
    PreferencesService.closeSession();

    //Regresar a Login
    this._router.navigate([RouteNamesService.LOGIN]);

  };

  // Funcion para llamar datos para el menu (Application y Display)
  async loadDataMenu(): Promise<void> {

    //TODO:remplazar
    let resApplication: ResApiInterface = await this._menu.getAplicaciones(this.user, this.token);

    //se ejecuta en caso de que algo salga mal al obtener los datos.
    if (!resApplication.status) {
      this._widgetsService.openSnackbar(this.translate.instant('pos.alertas.salioMal'));
      console.log(resApplication.response);
      console.log(resApplication.storeProcedure);
      return;
    };

    //guardar aplicaciones
    let applicationList: AplicacionesInterface[] = resApplication.response;
    //crear objetos para guardar Displays de cada aplicacion
    applicationList.forEach(element => {

      let itemMenu: MenuDataInterface = {
        application: element,
        displays: []
      };
      //guardo datos sin ordenar
      this.menuData.push(
        itemMenu
      );
    });

    // For asyncrono para obtener los displays.
    for (const item of this.menuData) {
      // TODO:Reemplazar
      //consumo de api que busca los displays de una applicaicon
      let resDisplay: ResApiInterface = await this._menu.getDisplays(this.user, this.token, item.application.application)

      //se ejecuta en caso de que algo salga mal
      if (!resDisplay.status) {
        this._widgetsService.openSnackbar(this.translate.instant('pos.alertas.salioMal'));
        console.error(resDisplay.response);
        console.error(resDisplay.storeProcedure);

        return;
      };
      //asignar displays a cada aplicacion 
      let displayList: DisplaysInterface[] = resDisplay.response;
      item.displays = displayList;
    };

    // Ejecuta funcion que separa displays
    this.separarDisplay();
  };

  //separar los displays de cada aplicacion 
  separarDisplay(): void {
    //  Funcion para separar Display Padre (nodo1) de el resto de Displays
    this.menuData.forEach(app => {
      // Las listas se declaran dentro del foreach para que en cada iteracion se vuelvan a declarar vacias
      let padres: MenuInterface[] = [];
      let hijos: MenuInterface[] = [];

      app.displays.forEach(display => {
        // Item que contiene la estructura de arbol de una application
        let nodo: MenuInterface = {
          id: display.user_Display,
          name: display.name,
          idChild: !(display.user_Display) ? display.user_Display : null,
          idFather: !isNaN(display.user_Display_Father) ? display.user_Display_Father : null,
          route: "", //TODO: asignar ruta
          children: [],
          // Colores configurables para la seleccion de menu.
          colorBackground: display.colorBackground ?? "#FFFFFF", // Color para background de la pantalla.
          colorSelected: display.colorSelected ?? "#134895", // Color al para objeto seleccionado.
          colorFontNotSelect: display.colorFontNotSelect ?? "#000000", //Color para fuente normal(no seleccionada).
          colorFontSelect: display.colorFontSelect ?? "#FFFFFF", //Color para fuente al ser seleccionada.
          colorMargenSelect: display.colorMargenSelect ?? "#df9722", // Color del la linea izquierda de seleccion del menu.
        };

        // Separa y agrega los displays a dos listas.
        if (!display.user_Display_Father) {
          hijos.push(nodo);
        } else {
          padres.push(nodo)
        };
      });

      //armar nodos el forma de albol
      let itemMenuApp: MenuInterface = {
        id: app.application.application,
        name: app.application.description,
        idFather: null,
        idChild: null,
        route: '',
        children: this.asignarNodos(padres, hijos),
        // Colores parmetrizables para el menu.
        colorBackground: app.application.colorBackground ?? "#FFFFFF", // Color para background de la pantalla.
        colorSelected: app.application.colorSelected ?? "#134895", // Color seleccion objeto
        colorFontNotSelect: app.application.colorFontNotSelect ?? "#000000", //Color para fuente normal(no seleccionada)
        colorFontSelect: app.application.colorFontSelect ?? "#FFFFFF", //Color para fuente Seleccionada
        colorMargenSelect: app.application.colorMargenSelect ?? "#df9722", // Color del la linea izquierda de seleccion del menu
      };

      //asignar nodos de una aplicacion al menu
      this.menu.push(
        itemMenuApp
      );
    });

    //Asignar nuevo contenido (vista activa)
    this.changeMenuActive(this.menu);

    // estructura primer elemento del arbol de navegacion
    let primerElemento: MenuInterface = {
      id: 0,
      idFather: null,
      idChild: null,
      name: "Inicio",
      route: '',
      children: this.menu,
    };
    //Asignar recorrido de elementos
    this.addRouteMenu(primerElemento);
  };

  addRouteMenu(menu: MenuInterface) {
    this.routeMenu.push(menu)
  };

  viewContent(itemMenu: MenuInterface) {
    this.clickedItem = itemMenu.id;
    if (itemMenu.children.length == 0) {

      //Oculta el contenido de todos los componentes de la lista
      this.components.forEach(component => {
        component.visible = false;
      });

      this.hideHome = true;

      //recorremos la lista qeu tiene todos los componentes
      for (let index = 0; index < this.components.length; index++) {
        const selectedComponent = this.components[index];
        //si el nombre del componente seleccionado conincide con algun componente agregado a la lista.
        if (selectedComponent.id == itemMenu.name) {
          //hacerlo visible
          this.components[index].visible = true;
          return;
        };
      };

      //recorremos la lista qeu tiene todos los componentes
      for (let index = 0; index < this.components.length; index++) {
        const selectedComponent = this.components[index];
        //sino se encuentra el componente que coincida con el componente seleccionado
        if (selectedComponent.id == "En Construccion") {
          //mostrar componente de: "Componente en Construccion"
          this.components[index].visible = true;
          break;
        };
      };
      return;
    };

    this.changeMenuActive(itemMenu.children); this.addRouteMenu(itemMenu);
  };

  changeMenuActive(menuActive: MenuInterface[]): void {
    // limpiar lista de menu activo
    this.menuActive = [];
    //Asigna el menu que recibe como parametro.
    this.menuActive = menuActive;
  };

  // Cambiar ruta de elemento navegacion del menu.
  changeRouteActive(index: number) {

    if (this.routeMenu.length - 1 == 0) {
      this.vistaMenu = ''
    } else {
      this.vistaMenu = this.routeMenu[index].name;
    };

    if (this.routeMenu.length - 1 > index) {
      //elimina ultimo item seleciconado.
      this.routeMenu.splice(this.routeMenu.length - 1, 1)
      //vacia contenido actual de la lista para seleccionar un nuevo elemento.
      this.menuActive = [];
      //Cambia el contenido activo.
      this.changeMenuActive(this.routeMenu[index].children);
      //Nueva seleccion activa.
      this.changeRouteActive(index);
    };
  };

  //TODO: verificar de forma inversa
  //Asigna los nodos padres e hijos.
  asignarNodos(padres: MenuInterface[], hijos: MenuInterface[]) {
    for (let indexPadre = padres.length - 1; indexPadre >= 0; indexPadre--) {
      const padre = padres[indexPadre];
      for (let indexHijo = hijos.length - 1; indexHijo >= 0; indexHijo--) {
        const hijo = hijos[indexHijo];
        if (padre.idChild == hijo.idFather) {
          padre.children.push(hijo);
          hijos.splice(indexHijo, 1);
          this.asignarNodos(padre.children, hijos);
        };
      };
    };
    return padres;
  };

  toggleTheme(): void {

    this.themeService.isDarkTheme = this.temaOscuro;
    this.themeService.updateTheme();

    // this.temaOscuro ? StorageService.tema = '1' : StorageService.tema = '0';
    if (this.temaOscuro == true) {
      PreferencesService.theme = '1';
      this.tema = this.translate.instant('pos.home.activo');
    } else {
      PreferencesService.theme = '0';
      this.tema = this.translate.instant('pos.home.inactivo');
    }
    this.verDetalles();
  }

  //Mostrar pantalla de "AJUSTES" y mantener ocultas todas las demas
  verAjustes(): void {
    this.ajustes = true;
    this.detallesUsuario = false;

    this.idiomas = false;
  };

  verTema() {
    this.temas = true;
    this.ajustes = false;
    this.detallesUsuario = false;

    this.idiomas = false;
  }

  //Mostrar pantalla de "MENU" y mantener ocultas todas las demas
  verMenu(): void {
    this.ajustes = true;
    this.detallesUsuario = false;

    this.idiomas = false;
  };

  //Mostrar pantalla de "DETALLES DE USUARIO" y mantener ocultas todas las demas
  verDetalles(): void {
    this.detallesUsuario = true;
    this.ajustes = false;
    this.idiomas = false;
    this.temas = false;
  };

  //Mostrar pantalla de "LENGUAJES" y mantener ocultas todas las demas
  verLenguajes(): void {
    this.idiomas = true;
    this.ajustes = false;
    this.detallesUsuario = false;
  };

  //Ocultar boton de continuar y mostrarlo cuando se regrese
  verContinuar(): void {
    this.btnRegresar = true;
  };
}
