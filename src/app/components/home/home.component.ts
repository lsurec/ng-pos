import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { TranslateService } from '@ngx-translate/core';
import { AplicacionesInterface } from 'src/app/interfaces/aplicaciones.interface';
import { ComponentesInterface } from 'src/app/interfaces/components.interface';
import { DisplayInterface } from 'src/app/interfaces/displays.interface';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { LanguageInterface } from 'src/app/interfaces/language.interface';
import { MenuDataInterface, MenuInterface } from 'src/app/interfaces/menu.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { components } from 'src/app/providers/componentes.provider';
import { indexDefaultLang, languagesProvider } from 'src/app/providers/languages.provider';
import { EventService } from 'src/app/services/event.service';
import { MenuService } from 'src/app/services/menu.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ThemeService } from 'src/app/services/theme.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { DataUserService } from 'src/app/displays/prc_documento_3/services/data-user.service';
import { FacturaService } from 'src/app/displays/prc_documento_3/services/factura.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  // Inyectar servicios
  providers: [
    NotificationsService,
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
  tema!: number;

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

  vistaMenu: string = '';

  //Variables para mostrar componentes segun el menu
  components: ComponentesInterface[] = components;

  hideHome: boolean = false;

  //MENU
  clickedItem?: number;
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
    private _menu: MenuService,
    private translate: TranslateService,
    private _eventService: EventService,
    private _notificationsService: NotificationsService,
    private themeService: ThemeService,
    private _dataUserService: DataUserService,
    public facturaService: FacturaService,
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
      this.tema = 1;
    } else {
      this.tema = 0;
    }

    this.userName = PreferencesService.user.toUpperCase();
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
   this._notificationsService.showCloseSesionDialog();

  };

  // Funcion para llamar datos para el menu (Application y Display)
  async loadDataMenu(): Promise<void> {

    //limpiar datos
    this.menuActive = [];
    this.routeMenu = [];
    this.menu = [];


    let menuData: MenuDataInterface[] = [];


    let resApp: ResApiInterface = await this._menu.getAplicaciones(this.user, this.token);

    //se ejecuta en caso de que algo salga mal al obtener los datos.
    if (!resApp.status) {
      //TODO:Mostrar pantalla reintentar
      this._notificationsService.showErrorAlert(resApp)
      return;
    };

    //guardar aplicaciones
    let applications: AplicacionesInterface[] = resApp.response;


    menuData = [];


    //crear objetos para guardar Displays de cada aplicacion
    applications.forEach(element => {

      //guardo datos sin ordenar
      menuData.push(
        {
          application: element,
          children: []
        }
      );
    });

    // For asyncrono para obtener los displays.
    for (const app of menuData) {
      //consumo de api que busca los displays de una applicaicon
      let resDisplay: ResApiInterface = await this._menu.getDisplays(
        this.user,
        this.token,
        app.application.application,
      );

      //se ejecuta en caso de que algo salga mal
      if (!resDisplay.status) {

        //TODO:Mostrar pantalla reintentar
        this._notificationsService.showErrorAlert(resDisplay);
        return;

      };

      //asignar displays a cada aplicacion 
      let displays: DisplayInterface[] = resDisplay.response;
      app.children = displays;

    };

    //separar nodos
    menuData.forEach(item => {

      let padres: MenuInterface[] = [];
      let hijos: MenuInterface[] = [];

      //generar estructira de arbol
      item.children.forEach(display => {



        let itemMenu: MenuInterface = {
          id: display.user_Display,
          name: display.name,
          idChild: display.user_Display,
          idFather: display.user_Display_Father,
          route: display.display_URL_Alter ?? "En Construccion",
          children: [],
          display: display,
          // Colores configurables para la seleccion de menu.
          colorBackground: display.colorBackground ?? "#FFFFFF", // Color para background de la pantalla.
          colorSelected: display.colorSelected ?? "#134895", // Color al para objeto seleccionado.
          colorFontNotSelect: display.colorFontNotSelect ?? "#000000", //Color para fuente normal(no seleccionada).
          colorFontSelect: display.colorFontSelect ?? "#FFFFFF", //Color para fuente al ser seleccionada.
          colorMargenSelect: display.colorMargenSelect ?? "#df9722", // Color del la linea izquierda de seleccion del menu.
        };

        if (display.user_Display_Father == null) {

          padres.push(itemMenu);
        } else {
          hijos.push(itemMenu);

        }

      });




      // agregar itemms a la lista propia
      this.menu.push(

        {
          name: item.application.description,
          id: item.application.application,
          route: "",
          children: this.ordenarNodos(padres, hijos),
          colorBackground: item.application.colorBackground ?? "#FFFFFF", // Color para background de la pantalla.
          colorSelected: item.application.colorSelected ?? "#134895", // Color al para objeto seleccionado.
          colorFontNotSelect: item.application.colorFontNotSelect ?? "#000000", //Color para fuente normal(no seleccionada).
          colorFontSelect: item.application.colorFontSelect ?? "#FFFFFF", //Color para fuente al ser seleccionada.
          colorMargenSelect: item.application.colorMargenSelect ?? "#df9722", // Color del la linea izquierda de seleccion del menu.
          idChild: null,
          idFather: null,
        }
      );

    });

    //Asignar nuevo contenido (vista activa)
    this.changeMenuActive(this.menu);

    // estructura primer elemento del arbol de navegacion
    let primerElemento: MenuInterface = {
      id: 0,
      idFather: null,
      idChild: null,
      name: this.translate.instant('pos.home.aplicaciones'), //TODO: translate
      route: '',
      children: this.menu,
    };

    //Asignar recorrido de elementos
    this.addRouteMenu(primerElemento);



  };


  ordenarNodos(padres: MenuInterface[], hijos: MenuInterface[]): MenuInterface[] {


    //recorer los nodos principales

    for (let index = 0; index < padres.length; index++) {
      const padre = padres[index];
      //recorrer los hijos de formma inversa para evitar problemas al eliminar
      for (let i = hijos.length - 1; i >= 0; i--) {

        //hiijo de la iteracion
        const hijo = hijos[i];

        //si el id del hijo es igaual al del padre asiganr hijo
        if (padre.idChild == hijo.idFather) {
          //asignar hijo al padre
          padre.children.push(hijo);
          //eliminar hijo asignado
          hijos.splice(i, 1);
          //Reoetir el proceso con lo shijos restantes hasta que no hayan mas hijos
          this.ordenarNodos(padre.children, hijos);
        }

      }
    }




    return padres;
  }

  addRouteMenu(menu: MenuInterface) {
    this.routeMenu.push(menu)
  };

  viewContent(itemMenu: MenuInterface) {
   
 
    

    this.clickedItem = itemMenu.id;
    if (itemMenu.children.length == 0) {

      let display:DisplayInterface = itemMenu.display!;

      this.facturaService.tipoDocumento = display.tipo_Documento;
      this._dataUserService.nameDisplay = display.name;
      this.facturaService.documentoName = display.des_Tipo_Documento ?? "";
      
      //Oculta el contenido de todos los componentes de la lista
      this.components.forEach(component => {
        component.visible = false;
      });

      this.hideHome = true;

      //recorremos la lista qeu tiene todos los componentes
      for (let index = 0; index < this.components.length; index++) {
        const selectedComponent = this.components[index];

        //si el nombre del componente seleccionado conincide con algun componente agregado a la lista.
        if (selectedComponent.id.toLowerCase() == itemMenu.route.toLowerCase()) {
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

    this.changeMenuActive(itemMenu.children);
    this.addRouteMenu(itemMenu);
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

  //Asigna los nodos padres e hijos.
  asignarNodos(padres: MenuInterface[], hijos: MenuInterface[]) {
    for (let indexPadre = 0; indexPadre < padres.length; indexPadre++) {
      const padre: MenuInterface = padres[indexPadre];
      for (let indexHijo = 0; indexHijo < hijos.length; indexHijo++) {
        const hijo: MenuInterface = hijos[indexHijo];
        // asignacion de elementos hijos al padre. 
        if (padre.idChild == hijo.idFather) {
          //Asignacion del elemento hijo.
          padre.children.push(hijo);
          // Elimina el hijo de la lista de hijos
          hijos.splice(indexHijo, 1);
          // Llamar a la misma funcion usando recursividad para volver a ejecutarse
          this.asignarNodos(padre.children, hijos);
        };
      };
    };
    //Retornar el menu completo con la estructura armada
    return padres;
  };

  toggleTheme(): void {

    this.themeService.isDarkTheme = this.temaOscuro;
    this.themeService.updateTheme();

    // this.temaOscuro ? StorageService.tema = '1' : StorageService.tema = '0';
    if (this.temaOscuro == true) {
      PreferencesService.theme = '1';
      this.tema = 1;
    } else {
      PreferencesService.theme = '0';
      this.tema = 0;
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
