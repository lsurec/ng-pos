import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

import { AplicacionesInterface } from 'src/app/interfaces/aplicaciones.interface';
import { ComponentesInterface } from 'src/app/interfaces/components.interface';
import { DisplayInterface } from 'src/app/interfaces/displays.interface';
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
import { RouteNamesService } from 'src/app/services/route.names.service';
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { RetryService } from 'src/app/services/retry.service';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { PrinterService } from 'src/app/services/printer.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalConvertService } from 'src/app/displays/listado_Documento_Pendiente_Convertir/services/global-convert.service';
import { ReceptionService } from 'src/app/displays/listado_Documento_Pendiente_Convertir/services/reception.service';
import { TypesDocConvertInterface } from 'src/app/displays/listado_Documento_Pendiente_Convertir/interfaces/types-doc-convert.interface';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import * as pdfMake from 'pdfmake/build/pdfmake';
import { HttpClient } from '@angular/common/http';


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
  imprimir: string = PreferencesService.impresora;

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
  btnRegresar: boolean = false;
  tema!: number;


  ///LENGUAJES: Opciones lenguajes
  activeLang: LanguageInterface;
  idioma: number = indexDefaultLang;
  languages: LanguageInterface[] = languagesProvider;
  temaOscuro: boolean = false;
  //Guardar el nombre del usuario


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
    private themeService: ThemeService,
    private _dataUserService: DataUserService,
    public facturaService: FacturaService,
    private _retryService: RetryService,
    private _printService: PrinterService,
    private _globalConvertService: GlobalConvertService,
    private _receptionService: ReceptionService,
    private _http: HttpClient,
  ) {

    this._eventService.customEvent$.subscribe((eventData) => {
      this.viewHome(eventData);
    });

    this._eventService.regresarHomedesdeImpresoras$.subscribe((eventData) => {
      this.impresora = false;
      this.hideHome = false;
    });

    //Funcion que carga datos
    this.loadDataMenu();

    //Buscar y obtener el leguaje guardado en el servicio
    let getLanguage = PreferencesService.lang;
    if (!getLanguage) {
      this.activeLang = languagesProvider[indexDefaultLang];
      this._translate.setDefaultLang(this.activeLang.lang);
    } else {
      //sino se encuentra asignar el idioma por defecto
      this.idioma = +getLanguage;
      this.activeLang = languagesProvider[this.idioma];
      this._translate.setDefaultLang(this.activeLang.lang);
    };

    this.temaOscuro = themeService.isDarkTheme;

    if (this.temaOscuro == true) {
      this.tema = 1;
    } else {
      this.tema = 0;
    }
  }


  ngOnInit(): void {

    this._retryService.home$.subscribe(() => {
      this.showError = false;
      this.loadDataMenu();
    });
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
  changeLang(lang: number): void {
    this.idioma = lang;
    this.activeLang = languagesProvider[lang];
    this._translate.use(this.activeLang.lang);
    PreferencesService.lang = JSON.stringify(lang);
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

    let resApp: ResApiInterface = await this._menu.getAplicaciones(this.user, this.token);

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
      //consumo de api que busca los displays de una applicaicon
      let resDisplay: ResApiInterface = await this._menu.getDisplays(
        this.user,
        this.token,
        app.application.application,
      );

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
      name: this._translate.instant('pos.home.aplicaciones'),
      route: '',
      children: this.menu,
    };

    //Asignar recorrido de elementos
    this.addRouteMenu(primerElemento);

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
      this._dataUserService.nameDisplay = display.name;
      this.facturaService.documentoName = display.des_Tipo_Documento ?? "";

      //Oculta el contenido de todos los componentes de la lista
      this.components.forEach(component => {
        component.visible = false;
      });

      this.hideHome = true;


      if (itemMenu.route == "Listado_Documento_Pendiente_Convertir") {

        this.isLoading = true;

        let res: ResApiInterface = await this._receptionService.getTiposDoc(
          this.user,
          this.token,
        );

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

    let res: ResApiInterface = await this._receptionService.getPendindgDocs(
      this.user,
      this.token,
      this._globalConvertService.docSelect!.tipo_Documento,
      this._globalConvertService.formatStrFilterDate(this._globalConvertService.fechaInicial!),
      this._globalConvertService.formatStrFilterDate(this._globalConvertService.fechaFinal!),
    );

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

    // this.temaOscuro ? StorageService.tema = '1' : StorageService.tema = '0';
    if (this.temaOscuro == true) {
      PreferencesService.theme = '1';
      this.tema = 1;
    } else {
      PreferencesService.theme = '0';
      this.tema = 0;
    }
  }

  //Mostrar pantalla de "AJUSTES" y mantener ocultas todas las demas
  verAjustes(): void {
    this.ajustes = true;
    this.detallesUsuario = false;
    this.temas = false;
    this.idiomas = false;
  };

  verTema(): void {
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


  private async _generateBase64(source: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this._http.get(source, { responseType: 'blob' })
        .subscribe(res => {
          const reader = new FileReader();
          reader.onloadend = () => {
            var base64data = reader.result;
            //   console.log(base64data);
            resolve(base64data);
          }
          reader.readAsDataURL(res);
          //console.log(res);
        });
    });
  }


  async printTest() {


    let logo_empresa = await this._generateBase64('/assets/empresa.png');
    let backgroundimg = await this._generateBase64('/assets/Image-not-found.png');

    let date: Date = new Date();

    let fecha = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    let hora = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;




    var docDefinition: TDocumentDefinitions = {
      pageSize: 'LETTER',
      info: {
        title: 'TD_Cotizacion_IMG',
        author: 'DEMOSOFT S.A.',
      },
      pageMargins: [25, 100, 25, 25],
      footer: function (currentPage, pageCount) {
        return [
          {
            marginLeft: 40,
            text: [
              {
                text: `${fecha} ${hora} `,
                fontSize: 6,
                color: '#134895'
              },
              {
                text: 'Pagina ' + currentPage.toString() + ' de ' + pageCount,
                fontSize: 6,
              }
            ]
          }
        ];
      },
      header:
        // you can apply any logic and return any valid pdfmake element

        [

          {
            margin: [0, 15, 0, 0],
            table: {

              heights: 'auto',
              widths: ['30%', '35%', '35%'], // Ancho de las columnas
              body: [
                [
                  {
                    image: logo_empresa,
                    width: 90,
                    absolutePosition: { x: 20, y: 10 }
                  },
                  [
                    {
                      text: 'AGROINVERSIONES DIVERSAS LA SELVA, S.A.',
                      style: 'headerText'
                    },
                    {
                      text: 'Empresa Test',
                      style: 'headerText'
                    },
                    {
                      text: '0 Avenida 5-35, Zona 9 Guatemala',
                      style: 'headerText'
                    },
                    {
                      text: 'test@gmail.com',
                      style: 'headerText'
                    },
                    {
                      text: 'NIT: 1181185-4',
                      style: 'headerText'
                    },
                    {
                      text: 'TEL: (502) 2505 1000',
                      style: 'headerText'
                    },


                  ],
                  [

                    {
                      text: 'Factura',
                      style: 'felText',

                    },
                    {
                      text: 'DOCUMENTO TRIBUTARIO ELECTRONICO',
                      style: 'felText',

                    },
                    {
                      text: 'SERIE: 49491',
                      style: 'felText',

                    },
                    {
                      text: 'No. 54485151',
                      style: 'felText',

                    },
                    {
                      text: 'Fecha certificacion: 12/12/2024 14:00:62',
                      style: 'felText',

                    },
                    {
                      text: 'Firma electronica:',
                      style: 'felText',

                    },
                    {
                      text: 'BA86F308-C4F7-4E13-A930-D859E3AC55FF',
                      style: 'felText',
                    },
                  ],


                ],

              ]
            },
            layout: 'noBorders'
          }
        ]
      ,
      content: [
        {
          layout: 'noBorders',
          table: {
            widths: ['50%', '50%'],
            body: [
              [
                {
                  text: 'No. Interno: 49494',
                  style: 'normalText'
                },
                {
                  text: 'Vendedor: Nombre venedor',
                  style: 'normalText',
                  alignment: 'right'
                }
              ]
            ]
          }
        },
        {
          marginTop: 10,
          table: {
            widths: ['71%', '*'],
            body: [
              [
                [
                  {
                    text: [
                      {
                        text: 'Nombre: ',
                        style: 'normalTextBold'
                      },
                      {
                        text: 'Nobre clinete',
                        style: 'normalText'
                      }
                    ]
                  },
                  {
                    text: [
                      {
                        text: 'NIT: ',
                        style: 'normalTextBold'
                      },
                      {
                        text: '5184189-5',
                        style: 'normalText'
                      }
                    ]
                  },
                  {
                    text: [
                      {
                        text: 'Direccion: ',
                        style: 'normalTextBold'
                      },
                      {
                        text: 'Ciudad',
                        style: 'normalText'
                      }
                    ]
                  }
                ],
                [

                  {
                    text: [
                      {
                        text: 'Fecha: ',
                        style: 'normalTextBold'
                      },
                      {
                        text: '12/12/2024 14:15:15',
                        style: 'normalText'
                      }
                    ]

                  },
                  {
                    text: [
                      {
                        text: 'Tel: ',
                        style: 'normalTextBold'
                      },
                      {
                        text: '6419115',
                        style: 'normalText'
                      }
                    ]
                  },
                  {
                    text: [
                      {
                        text: 'Correo: ',
                        style: 'normalTextBold'
                      },
                      {
                        text: 'cliente@gmail.com',
                        style: 'normalText'
                      }
                    ]
                  }
                ]
              ]
            ]
          }
        },


        {
          marginTop: 15,
          marginBottom: 15,
          table: {
            widths: ['10%', '10%', '10%', '45%', '10%', '15%'],
            body: [
              [

                {
                  text: 'CODIGO',
                  style: ['headerText','fillColor'],
                },
                {
                  text: 'CANTIDAD',
                  style: ['headerText','fillColor'],
                },
                {
                  text: 'UM',
                  style: ['headerText','fillColor'],
                },
                {
                  text: 'DESCRIPCION',
                  style: ['headerText','fillColor'],
                },
                {
                  text: 'P/U',
                  style: ['headerText','fillColor'],
                },
                {
                  text: 'TOTAL',
                  style: ['headerText','fillColor'],
                }
              ],
              [

                {
                  text: 'KSNK-451',
                  style: 'normalText',
                  alignment: 'center',
                  border: [true, false, false, false]
                },
                {
                  text: '10',
                  style: 'normalText',
                  alignment: 'center',
                  border: [false, false, false, false]
                },
                {
                  text: 'und',
                  style: 'normalText',
                  alignment: 'center',
                  border: [false, false, false, false]
                },
                {
                  text: 'Lorem sunt nostrud nisi officia duis officia ex.',
                  style: 'normalText',
                  border: [false, false, false, false]
                },
                {
                  text: 'Q. 10.00',
                  style: 'normalText',
                  alignment: 'right',
                  border: [false, false, false, false]
                },
                {
                  text: 'Q. 10000.00',
                  style: 'normalText',
                  alignment: 'right',
                  border: [false, false, true, false]
                }
              ],
              [

                {
                  text: 'KSNK-451',
                  style: 'normalText',
                  alignment: 'center',
                  border: [true, false, false, false]
                },
                {
                  text: '10',
                  style: 'normalText',
                  alignment: 'center',
                  border: [false, false, false, false]
                },
                {
                  text: 'und',
                  style: 'normalText',
                  alignment: 'center',
                  border: [false, false, false, false]
                },
                {
                  text: 'Lorem sunt nostrud nisi officia duis officia ex.',
                  style: 'normalText',
                  border: [false, false, false, false]
                },
                {
                  text: 'Q. 10.00',
                  style: 'normalText',
                  alignment: 'right',
                  border: [false, false, false, false]
                },
                {
                  text: 'Q. 10000.00',
                  style: 'normalText',
                  alignment: 'right',
                  border: [false, false, true, false]
                }
              ],
              [
                {
                  text: 'TOTAL',
                  style: ['headerText','fillColor'],
                  colSpan: 5,
                },
                {}, // Celda adicional para fusionar con la primera celda
                {}, // Celda adicional para fusionar
                {}, // Celda adicional para fusionar
                {}, // Celda adicional para fusionar
                {
                  text: 'Q.10000.00',
                  style: 'headerText',
                  alignment: 'right',
                } // La última celda
              ],
              [
                {
                  text: 'TOTAL EN LETRAS: Qui eu minim excepteur nulla veniam pariatur aute quis non.',
                  style: 'normalTextBold',
                  colSpan: 6,
                },
                {}, {}, {}, {}, {},
              ]
            ]
          }
        },
       [
        {
          text:
            '*NO SE ACEPTAN CAMBIOS NI DEVOLUCIONES*',
          style: 'headerText'
        },
        {
          text:
            '*GRACIAS POR TU COMPRA*',
          style: 'headerText'
        }
       ]

      ],
      styles: {
        fillColor:{
          fillColor:'#134895',
          color:'#ffffff'
        },
        felText: {
          fontSize: 8,
          bold: true,
          marginLeft: 20,
        },
        headerText: {
          fontSize: 8,
          bold: true,
          alignment: 'center',
        },
        normalText: {
          fontSize: 8,
        },
        normalTextBold: {
          fontSize: 8,
          bold: true,
        },


      }
    };

    pdfMake.createPdf(docDefinition).open();




  }

}
