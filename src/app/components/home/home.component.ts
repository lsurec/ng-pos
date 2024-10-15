import { Component, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { AplicacionesInterface } from 'src/app/interfaces/aplicaciones.interface';
import { ComponentesInterface } from 'src/app/interfaces/components.interface';
import { DisplayInterface } from 'src/app/interfaces/displays.interface';
import { FontSizeInterface, LanguageInterface } from 'src/app/interfaces/language.interface';
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
import { RouteNamesService } from 'src/app/services/route.names.service';
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { RetryService } from 'src/app/services/retry.service';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { PrinterService } from 'src/app/services/printer.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalConvertService } from 'src/app/displays/listado_Documento_Pendiente_Convertir/services/global-convert.service';
import { ReceptionService } from 'src/app/displays/listado_Documento_Pendiente_Convertir/services/reception.service';
import { HttpClient } from '@angular/common/http';
import { diasEspaniol, diasIngles } from 'src/app/providers/dias.provider';
import { CustomDatepickerI18n } from 'src/app/services/custom-datepicker-i18n.service';
import { CurrencyPipe, DOCUMENT } from '@angular/common';
import { CurrencyFormatPipe } from 'src/app/pipes/currecy-format/currency-format.pipe';
import { ColorInterface } from 'src/app/interfaces/filtro.interface';
import { PreferencesInterface } from 'src/app/interfaces/preferences.interface';
import { ApiService } from 'src/app/services/api.service';
import { GlobalRestaurantService } from 'src/app/displays/prcRestaurante/services/global-restaurant.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  // Inyectar servicios
  providers: [
    NotificationsService,
    MenuService,
    PrinterService,
    ReceptionService,
    CurrencyPipe,
    CurrencyFormatPipe,
  ]
})
export class HomeComponent implements OnInit {

  //token y usuario
  user = PreferencesService.user;
  token = PreferencesService.token;

  empresa: EmpresaInterface = PreferencesService.empresa;
  estacion: EstacionInterface = PreferencesService.estacion;
  tipoDocumento: number = this.facturaService.tipoDocumento!;
  nombreDocumento: string = this.facturaService.documentoName;
  tipoCambio: number = PreferencesService.tipoCambio;
  url: string = PreferencesService.baseUrl;

  //Abrir/Cerrar SideNav
  @ViewChild('sidenav')
  sidenav!: MatSidenav;
  @ViewChild('sidenavend')
  sidenavend!: MatSidenav;

  //Variables para inputs
  isLoading: boolean = false;

  impresora: boolean = false;
  volver: number = 1;
  idPantalla: number = 0;

  //Ver configuraciones y detalles del usuario
  temas: boolean = false;
  detallesUsuario: boolean = true;
  ajustes: boolean = false;
  idiomas: boolean = false;
  sizes: boolean = false;
  btnRegresar: boolean = false;
  tema!: number;
  color: boolean = false;

  ///LENGUAJES: Opciones lenguajes
  activeLang: LanguageInterface;
  idioma: number = indexDefaultLang;
  size: number = 0;
  languages: LanguageInterface[] = languagesProvider;
  temaOscuro: boolean = false;
  //Guardar el nombre del usuario


  //horario laboral
  // horarios: HoraInterface[] = horas; //lista de horas 12h
  // horaInicio: boolean = false;
  // horaFin: boolean = false;
  // inicioHorasLabores: number = indexHoraInicioDefault;
  // finHorasLabores: number = indexHoraFinDefault;
  // inicioLabores!: number;
  // finLabores!: number;
  // setDias: boolean = false;
  // horasLaborales: boolean = false;
  // nombreHoraInicial: string = '';
  // nombreHoraFinal: string = '';
  primerDiaSemana: number = 0;

  //Variables para mostrar componentes segun el menu
  components: ComponentesInterface[] = components;

  hideHome: boolean = false;

  showError: Boolean = false;
  name: string = RouteNamesService.HOME;
  error?: ErrorInterface;


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
    private _translate: TranslateService,
    private _eventService: EventService,
    private _notificationsService: NotificationsService,
    public themeService: ThemeService,
    public dataUserService: DataUserService,
    public facturaService: FacturaService,
    private _retryService: RetryService,
    private _printService: PrinterService,
    private _globalConvertService: GlobalConvertService,
    private _receptionService: ReceptionService,
    private _http: HttpClient,
    private customDatepickerI18n: CustomDatepickerI18n,
    private renderer: Renderer2,
    public restaurantService: GlobalRestaurantService,
    @Inject(DOCUMENT) private document: Document
  ) {

    this._eventService.customEvent$.subscribe((eventData) => {
      this.viewHome(eventData);
    });

    this._eventService.regresarHomedesdeImpresoras$.subscribe((eventData) => {
      this.impresora = false;
      this.hideHome = false;
    });

    this._eventService.verHome$.subscribe((eventData) => {
      this.verHistorialErrores = false;
    });

    //mostrar contenido a regresar de error
    this._eventService.homeDeErrorRestaurante$.subscribe((eventData) => {
      this.restaurantService.verError = false;
    });

    //Funcion que carga datos
    this.loadDataMenu();

    //Buscar y obtener el leguaje guardado en el servicio
    let getLanguage = PreferencesService.lang;
    if (!getLanguage) {
      this.activeLang = languagesProvider[indexDefaultLang];
      this._translate.setDefaultLang(this.activeLang.lang);
      this.customDatepickerI18n.setLanguage(this.activeLang.lang);
    } else {
      //sino se encuentra asignar el idioma por defecto
      this.idioma = +getLanguage;
      this.activeLang = languagesProvider[this.idioma];
      this._translate.setDefaultLang(this.activeLang.lang);
      this.customDatepickerI18n.setLanguage(this.activeLang.lang);
    };

    this.temaOscuro = themeService.isDarkTheme;

    if (this.temaOscuro == true) {
      this.tema = 1;
    } else {
      this.tema = 0;
    }

    //tamaño de fuente
    let getFontSize: string = PreferencesService.idFontSizeStorage;
    if (!getFontSize) {
      this.size = 0;
    } else {
      this.size = +getFontSize;
    }

    //buscamos si hay un dia guardado para el inicio de la semana
    let getDias = PreferencesService.inicioSemana;
    if (getDias) {
      let dia: number = +getDias;
      this.primerDiaSemana = dia;
    };

  }

  loadData() {
    //buscamos si hay un valor guardado para la cantidad de digitos
    let getDigitos = PreferencesService.digitos;
    if (getDigitos) {
      let digitos: number = +getDigitos;
      this.dataUserService.integerDigits = digitos;
    } else {
      this.dataUserService.integerDigits = 2;
    }

    //buscamos si hay un valor guardado para la cantidad de decimales
    let getDecimales = PreferencesService.decimales;
    if (getDecimales) {
      let decimales: number = +getDecimales;
      this.dataUserService.decimalPlaces = decimales;
    } else {
      this.dataUserService.decimalPlaces = 2;
    }


    if (!PreferencesService.colorApp) {
      this.colorSeleccionado = {
        id: 2,
        nombre: "Primario",
        valor: "#134895"
      };

    } else {
      let indexColor: number = +PreferencesService.indexColorApp;
      this.colorSeleccionado = this.colores[indexColor];
    }

  }

  fontsSizes: FontSizeInterface[] = [

    {
      id: 1,
      name: "Pequeño (12)",
      value: "12px"
    },
    {
      id: 2,
      name: "Mediano (14)",
      value: "14px"
    },
    {
      id: 3,
      name: "Grande (16)",
      value: "16px"
    },
    {
      id: 4,
      name: "Extra grande (20)",
      value: "20px"
    }
  ];

  sizeSelect?: FontSizeInterface;

  colorSeleccionado: ColorInterface | null = null;

  colores: ColorInterface[] = [
    {
      id: 1,
      nombre: "Primario",
      valor: "#134895"
    },
    {
      id: 2,
      valor: "#9b2a35",
      nombre: "Rojo"
    },
    {
      id: 3,
      valor: "#008000",
      nombre: "Verde"
    },
    {
      id: 4,
      valor: "#800080",
      nombre: "Morado"
    },
    {
      id: 5,
      valor: "#6F4E37",
      nombre: "Café"
    },
    {
      id: 6,
      valor: "#000000",
      nombre: "Negro"
    },
  ];

  async cambiarFuente(index: number) {

    let verificador: boolean = await this._notificationsService.openDialogActions(
      {
        title: this._translate.instant('crm.alertas.fuete'),
        description: this._translate.instant('crm.alertas.cambioFuente'),
        verdadero: this._translate.instant('pos.botones.aceptar'),
      }
    );

    if (!verificador) return;

    this.sizeSelect = this.fontsSizes[index];

    this.themeService.globalFontSize = this.sizeSelect.value;

    PreferencesService.fontSizeStorage = this.sizeSelect.value;

    this.size = index;

    PreferencesService.idFontSizeStorage = `${index}`;

    // Usando window.location.reload()
    window.location.reload();

  }

  async seleccionarColor(color: ColorInterface, index: number): Promise<void> {

    if (PreferencesService.indexColorApp == index.toString()) {
      return;
    }

    let verificador: boolean = await this._notificationsService.openDialogActions(
      {
        title: this._translate.instant('pos.home.colorSelec'),
        description: this._translate.instant('pos.home.cambiosColor'),
        verdadero: this._translate.instant('pos.botones.aceptar'),
      }
    );

    if (!verificador) return;

    this.colorSeleccionado = color;
    //Guardar la preferencia
    PreferencesService.colorApp = this.colores[index].valor;
    PreferencesService.indexColorApp = index.toString();

    // Usando window.location.reload()
    window.location.reload();

  }

  isColorDark(color: string): boolean {
    // Remove the hash if present
    const hex = color.replace('#', '');

    // Convert hex to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calculate the brightness (using a common formula)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // Return true if the color is dark, otherwise false
    return brightness < 128;
  }

  panelOpenState: boolean = false;

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

    // asiganr moneda 
    this.dataUserService.simboloMoneda = this.empresa.moneda_Simbolo;

    this._retryService.home$.subscribe(() => {
      this.showError = false;
      this.loadDataMenu();
    });

    //valor switch fel
    let getSwitchFel: string = PreferencesService.sitchFelStorage;
    if (getSwitchFel == "1") {
      this.dataUserService.switchState = true;
    } else {
      this.dataUserService.switchState = false;
    }

  }



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
  async changeLang(lang: number): Promise<void> {
    this.idioma = lang;
    this.activeLang = languagesProvider[lang];
    this._translate.use(this.activeLang.lang);
    PreferencesService.lang = JSON.stringify(lang);
    this.customDatepickerI18n.setLanguage(languagesProvider[lang].lang);

    let verificador: boolean = await this._notificationsService.openDialogActions(
      {
        title: this._translate.instant('crm.alertas.nuevoIdioma'),
        description: this._translate.instant('crm.alertas.cambioIdioma'),
        verdadero: this._translate.instant('pos.botones.aceptar'),
      }
    );

    if (!verificador) return;
    // Usando window.location.reload()
    window.location.reload();
  };

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

    this.isLoading = true;

    const apiApp = ()=> this._menu.getAplicaciones(this.user, this.token);

    let resApp: ResApiInterface = await ApiService.apiUse(apiApp);

    //se ejecuta en caso de que algo salga mal al obtener los datos.
    if (!resApp.status) {
      this.isLoading = false;
      this.showError = true;

      let dateNow: Date = new Date();

      this.error = {
        date: dateNow,
        description: resApp.response,
        storeProcedure: resApp.storeProcedure,
        url: resApp.url,
      }

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
      const apiDisplay = ()=> this._menu.getDisplays(
        this.user,
        this.token,
        app.application.application,
      );
      //consumo de api que busca los displays de una applicaicon
      let resDisplay: ResApiInterface = await ApiService.apiUse(apiDisplay);

      //se ejecuta en caso de que algo salga mal
      if (!resDisplay.status) {

        this.isLoading = false;
        this.showError = true;

        let dateNow: Date = new Date();

        this.error = {
          date: dateNow,
          description: resDisplay.response,
          storeProcedure: resDisplay.storeProcedure,
          url: resDisplay.url,
        }

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
          colorSelected: display.colorSelected ?? PreferencesService.colorApp ?? "#134895", // Color al para objeto seleccionado.
          colorFontNotSelect: display.colorFontNotSelect ?? "#000000", //Color para fuente normal(no seleccionada).
          colorFontSelect: display.colorFontSelect ?? (this.isColorDark(PreferencesService.colorApp) ? '#FFF' : '#000'), //Color para fuente al ser seleccionada.
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
          colorSelected: item.application.colorSelected ?? PreferencesService.colorApp ?? "#134895", // Color al para objeto seleccionado.
          colorFontNotSelect: item.application.colorFontNotSelect ?? "#000000", //Color para fuente normal(no seleccionada).
          colorFontSelect: item.application.colorFontSelect ?? (this.isColorDark(PreferencesService.colorApp) ? '#FFF' : '#000'), //Color para fuente al ser seleccionada.
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
      name: this._translate.instant('pos.home.aplicaciones'),
      route: '',
      children: this.menu,
    };

    //Asignar recorrido de elementos
    this.addRouteMenu(primerElemento);

    this.loadData();

    this.isLoading = false;
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

  addRouteMenu(menu: MenuInterface): void {
    this.routeMenu.push(menu)
  };

  async viewContent(itemMenu: MenuInterface): Promise<void> {

    this.clickedItem = itemMenu.id;
    if (itemMenu.children.length == 0) {

      let display: DisplayInterface = itemMenu.display!;

      this.facturaService.tipoDocumento = display.tipo_Documento;
      this.dataUserService.nameDisplay = display.name;
      this.facturaService.documentoName = display.des_Tipo_Documento ?? "";

      //Oculta el contenido de todos los componentes de la lista
      this.components.forEach(component => {
        component.visible = false;
      });

      this.hideHome = true;


      if (itemMenu.route == "Listado_Documento_Pendiente_Convertir") {

        this.isLoading = true;


        const apiTiposDoc = ()=> this._receptionService.getTiposDoc(
          this.user,
          this.token,
        );

        let res: ResApiInterface = await ApiService.apiUse(apiTiposDoc);

        this.isLoading = false;
        if (!res.status) {

          this.isLoading = false; //Parar pantalla de carga
          this.showError = true; //Ver error

          let dateNow: Date = new Date(); //fecha del error

          //Crear error
          this.error = {
            date: dateNow,
            description: res.response,
            storeProcedure: res.storeProcedure,
            url: res.url,
          }

          return;

        }

        this._globalConvertService.docs = [];
        this._globalConvertService.docs = res.response;
        // this._globalConvertService.docs.splice(1, 1);


        if (this._globalConvertService.docs.length == 1) {

          this._globalConvertService.docSelect = this._globalConvertService.docs[0];


          await this.loadDocsOrign();
          //mostarr los documentos de origen
          this._globalConvertService.screen = "list_cot";

        } else {
          this._globalConvertService.screen = "tipos_cot";

        }

        //navegar a documento destino o conversion documento
        // this._globalConvertService.docDestino = 0; // solo un elemento
        this._globalConvertService.docDestino = 1; // mas de un elemento
      }

      if (itemMenu.route == "prcRestaurante") {

        //TODO: si hubieran dantos que cargar para restsurante
      }


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

  async loadDocsOrign() {
    this._globalConvertService.isLoading = true;
    this._globalConvertService.docsOrigin = [];


    let today: Date = new Date();

    this._globalConvertService.fechaInicial = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };
    this._globalConvertService.fechaFinal = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };


    const apiDocOrigen = ()=> this._receptionService.getPendindgDocs(
      this.user,
      this.token,
      this._globalConvertService.docSelect!.tipo_Documento,
      this._globalConvertService.formatStrFilterDate(this._globalConvertService.fechaInicial!),
      this._globalConvertService.formatStrFilterDate(this._globalConvertService.fechaFinal!),
      "",
    );

    let res: ResApiInterface = await ApiService.apiUse(apiDocOrigen);

    this._globalConvertService.isLoading = false;


    if (!res.status) {
      this.isLoading = false;
      this.showError = true;

      let dateNow: Date = new Date();

      this.error = {
        date: dateNow,
        description: res.response,
        storeProcedure: res.storeProcedure,
        url: res.url,
      }



      return;

    }

    this._globalConvertService.docsOrigin = res.response;
    this._globalConvertService.docsOriginFilter = res.response;



  }

  changeMenuActive(menuActive: MenuInterface[]): void {
    // limpiar lista de menu activo
    this.menuActive = [];
    //Asigna el menu que recibe como parametro.
    this.menuActive = menuActive;
  };

  // Cambiar ruta de elemento navegacion del menu.
  changeRouteActive(index: number): void {
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
  asignarNodos(padres: MenuInterface[], hijos: MenuInterface[]): MenuInterface[] {
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

    // this.temaOscuro ? PreferencesService.tema = '1' : PreferencesService.tema = '0';
    if (this.temaOscuro == true) {
      PreferencesService.theme = '1';
      this.tema = 1;
    } else {
      PreferencesService.theme = '0';
      this.tema = 0;
    }
  }

  //Mostrar pantalla de "DIAS" y mantener ocultas todas las demas
  verDias(): void {
    this.ajustes = false;
    this.detallesUsuario = false;
    this.idiomas = false;
  };


  cambiarPrimerDia(): void {
    PreferencesService.inicioSemana = this.primerDiaSemana.toString();
    this.verDetalles();
  };

  //Obtener el lenguaje y region activo y mostrar los dias en el idioma acivo
  getLrCode(): string[] {
    let lrCode = `${this.activeLang.lang}-${this.activeLang.reg}`
    if (lrCode == 'es-GT') return diasEspaniol;
    if (lrCode == 'en-US') return diasIngles;
    return [];
  };

  capitalizarTexto(texto: string): string {
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLocaleLowerCase();
  };

  //Mostrar pantalla de "AJUSTES" y mantener ocultas todas las demas
  verAjustes(): void {
    this.ajustes = true;
    this.detallesUsuario = false;
    this.temas = false;
    this.idiomas = false;
    this.sizes = false;
    this.color = false;
  };

  verTema(): void {
    this.temas = true;
    this.ajustes = false;
    this.detallesUsuario = false;

    this.idiomas = false;
    this.color = false;
  }

  verColor(): void {
    this.color = true;
    this.temas = false;
    this.ajustes = false;
    this.detallesUsuario = false;
    this.idiomas = false;
  }


  //Mostrar pantalla de "MENU" y mantener ocultas todas las demas
  verMenu(): void {
    this.ajustes = true;
    this.detallesUsuario = false;
    this.idiomas = false;
    this.color = false;
  };

  //Mostrar pantalla de "DETALLES DE USUARIO" y mantener ocultas todas las demas
  verDetalles(): void {
    this.detallesUsuario = true;
    this.ajustes = false;
    this.idiomas = false;
    this.temas = false;
    this.color = false;
  };

  //Mostrar pantalla de "LENGUAJES" y mantener ocultas todas las demas
  verLenguajes(): void {
    this.idiomas = true;
    this.ajustes = false;
    this.detallesUsuario = false;
    this.color = false;
  };

  verSizes(): void {
    this.sizes = true;
    this.idiomas = false;
    this.ajustes = false;
    this.detallesUsuario = false;
    this.color = false;
  };


  async verConfiguracion(): Promise<void> {

    // //verificar si es posible utilizar el servicio
    // if (!PreferencesService.port) {
    //   //Cargar pantalla
    //   this.isLoading = true;
    //   //hay dos puertos disponibles

    //   //verifica si el servicio puede ser utilizado en el puerto 5000
    //   let resStatus5000: ResApiInterface = await this._printService.getStatus("5000");
    //   //si no exite el servicio en el puerto 5000
    //   if (!resStatus5000.status) {
    //     //Verifica si el servicio puede ser utilizado en el puerto 5001
    //     let resStatus5001: ResApiInterface = await this._printService.getStatus("5001");
    //     //sino existe el servicio en el puerto 5001
    //     if (!resStatus5001.status) {

    //       //Muestra notificacion de que el servicio no esta disponible en ese momento
    //       this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.sin_servicio_impresion'));

    //       this.isLoading = false; //Parar pantalla de carga
    //       this.showError = true; //Ver error

    //       let dateNow: Date = new Date(); //fecha del error

    //       //Crear error
    //       this.error = {
    //         date: dateNow,
    //         description: "No fue posible establecer conexion con el servicio de impresion, verifique que el servicio este disponible o que el sistema operativo sea compatible.",
    //       }

    //       return;
    //     } else {

    //       ///si encontro el servicio en el puerto 5001
    //       PreferencesService.port = "5001";
    //       this.isLoading = false;
    //     }
    //   } else {
    //     ///si encontro el servicio en el puerto 5000
    //     PreferencesService.port = "5000";
    //     this.isLoading = false;
    //   }
    //   //detener la pantalla de carga
    //   this.isLoading = false;
    // }
    // this.sidenavend.close(); //cerrar menu
    this.hideHome = true;
    this.impresora = true; //ver impresora
  }

  //TODO:Eliminar fel
  // Función para manejar el cambio de estado del switch
  switchFel(): void {
    this.dataUserService.switchState = !this.dataUserService.switchState;

    //falso es 0
    if (this.dataUserService.switchState == false) {
      PreferencesService.sitchFelStorage = "0"
    }

    if (this.dataUserService.switchState == true) {
      //verdadero es 1
      PreferencesService.sitchFelStorage = "1"
    }
  }

  menos(tipo: number) {
    //disminuir cantidad en 1

    //D E C I M A L E S 
    if (tipo == 1) {
      this.dataUserService.decimalPlaces!--;

      //si es menor o igual a cero, volver a 1 y mostrar
      if (this.dataUserService.decimalPlaces! <= 1) {
        this.dataUserService.decimalPlaces = 1;
      }

      //guarda la nueva cantidad
      PreferencesService.decimales = this.dataUserService.decimalPlaces.toString();
    }

    //D I G I T O S 
    if (tipo == 2) {

      //disminuir cantidad en 1
      this.dataUserService.integerDigits!--;

      //si es menor o igual a cero, volver a 1 y mostrar
      if (this.dataUserService.integerDigits! <= 1) {
        this.dataUserService.integerDigits = 1;
      }

      //guarda la nueva cantidad
      PreferencesService.digitos = this.dataUserService.integerDigits.toString();
    }

  }

  mas(tipo: number) {
    //disminuir cantidad en 1

    //D E C I M A L E S 
    if (tipo == 1) {

      //aumentar cantidad
      this.dataUserService.decimalPlaces!++;

      //guarda la nueva cantidad
      PreferencesService.decimales = this.dataUserService.decimalPlaces.toString();
    }

    //D I G I T O S
    if (tipo == 2) {
      //aumentar cantidad
      this.dataUserService.integerDigits!++;

      //guarda la nueva cantidad
      PreferencesService.digitos = this.dataUserService.integerDigits.toString();
    }

  }

  //Cambio en digitos
  changeDigitos() {
    PreferencesService.digitos = this.dataUserService.integerDigits.toString();
  }

  //Cambio en decimales
  changeDecimales() {
    PreferencesService.decimales = this.dataUserService.decimalPlaces.toString();
  }

  verHistorialErrores: boolean = false;


  verErrores() {
    this.verHistorialErrores = true;
  }

  exportPreferences() {

    let preferences: PreferencesInterface = {
      background: PreferencesService.fondoApp,
      decimal: PreferencesService.decimales,
      endWork: PreferencesService.finLabores,
      idBackground: PreferencesService.indexFondoApp,
      idPrimary: PreferencesService.indexColorApp,
      idSize: PreferencesService.idFontSizeStorage,
      int: PreferencesService.digitos,
      lang: PreferencesService.lang,
      newDoc: PreferencesService.nuevoDoc,
      primary: PreferencesService.colorApp,
      remote: PreferencesService.baseUrl,
      show: PreferencesService.mostrarAlerta,
      size: PreferencesService.fontSizeStorage,
      startDay: PreferencesService.inicioSemana,
      startWork: PreferencesService.inicioLabores,
      theme: PreferencesService.theme,
    }

    const jsonString = JSON.stringify(preferences, null, 2); // 'null, 2' para darle formato al JSON

    // 2. Crear un enlace temporal
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');

    // 3. Asignar nombre al archivo y descargar
    a.href = url;
    a.download = 'preferences-ds.json';
    a.click();

    // 4. Limpiar el objeto URL
    window.URL.revokeObjectURL(url);

  }



  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          // 1. Leer el archivo JSON
          const json = JSON.parse(e.target.result);

          // 2. Validar que la estructura del JSON sea correcta
          if (this.validatePreferencesStructure(json)) {
            // 3. Si es válido, asignar el objeto a preferences
            const preferences: PreferencesInterface = json;

            //Asignatr preferencias
            PreferencesService.fondoApp = preferences.background;
            PreferencesService.decimales = preferences.decimal;
            PreferencesService.finLabores = preferences.endWork;
            PreferencesService.indexFondoApp = preferences.idBackground;
            PreferencesService.indexColorApp = preferences.idPrimary;
            PreferencesService.idFontSizeStorage = preferences.idSize;
            PreferencesService.digitos = preferences.int;
            PreferencesService.lang = preferences.lang;
            PreferencesService.nuevoDoc = preferences.newDoc;
            PreferencesService.colorApp = preferences.primary;
            PreferencesService.baseUrl = preferences.remote;
            PreferencesService.mostrarAlerta = preferences.show;
            PreferencesService.fontSizeStorage = preferences.size;
            PreferencesService.inicioSemana = preferences.startDay;
            PreferencesService.inicioLabores = preferences.startWork;
            PreferencesService.theme = preferences.theme;

            this._notificationsService.openSnackbar("Preferencias cargadas correctamente"); //TODO:Translate



          } else {
            this._notificationsService.openSnackbar("Archivo invalido"); //TODO:Translate
          }
        } catch (error) {
          this._notificationsService.openSnackbar("Archivo invalido"); //TODO:Translate

          console.error('Error al leer el archivo JSON', error);
        }
      };
      reader.readAsText(file);
    }
  }

  validatePreferencesStructure(json: any): boolean {
    const requiredKeys = [
      'background', 'decimal', 'endWork', 'idBackground', 'idPrimary',
      'idSize', 'int', 'lang', 'newDoc', 'primary', 'remote', 'show', 'size',
      'startDay', 'startWork', 'theme'
    ];

    // Comprobar si todas las claves están presentes
    for (const key of requiredKeys) {
      if (!json.hasOwnProperty(key)) {
        return false;
      }
    }


    return true;
  }
}
