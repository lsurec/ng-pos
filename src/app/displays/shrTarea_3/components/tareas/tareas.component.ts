import { Component } from '@angular/core';
import { TareaService } from '../../services/tarea.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { TareaInterface } from '../../interfaces/tarea-user.interface';
import { DetalleInterface } from '../../interfaces/detalle-tarea.interface';
import { LanguageInterface } from 'src/app/interfaces/language.interface';
import { indexDefaultLang, languagesProvider } from 'src/app/providers/languages.provider';
import { InvitadosInterface } from '../../interfaces/invitado.interface';
import { ResponsablesInterface } from '../../interfaces/responsable.interface';
import { FiltroInterface } from 'src/app/interfaces/filtro.interface';
import { TranslateService } from '@ngx-translate/core';
import { EventService } from 'src/app/services/event.service';
import { RefrescarService } from 'src/app/services/refrescar-tarea.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { GlobalTareasService } from 'src/app/services/tarea-global.service';
import { busquedaEspaniol, busquedaIngles } from 'src/app/providers/dias.provider';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';

//declarar $ para usar JQuery
declare var $: any;


@Component({
  selector: 'app-tareas',
  templateUrl: './tareas.component.html',
  styleUrls: ['./tareas.component.scss'],
  providers: [
    TareaService,
    NotificationsService,
    UsuarioService
  ]
})
export class TareasComponent {

  isLoading: boolean = false;
  hideDetalle: boolean = true;
  crearTarea: boolean = false;
  mostrarTareas: boolean = true;

  searchText: string = ""; //filtro de tareas
  topTareas: number = 10; //ultimas tareas
  buscarTareas: TareaInterface[] = [];
  tarea!: DetalleInterface;

  //Idiomas
  languages: LanguageInterface[] = languagesProvider;
  activeLang: LanguageInterface;
  idioma: number = indexDefaultLang;

  //invitados y respomsable de la tarea
  invitados!: InvitadosInterface[];
  responsables!: ResponsablesInterface[];
  selectedOption: number | null = 1;

  //Subir contenido
  botonIrArriba: boolean = false;
  botonIrAbajo: boolean = true;
  showScrollHeight: number = 400; //En cuantos pixeles se va a mostrar el boton
  hideScrollHeight: number = 200; //en cuantos se va a ocultar
  fechaOriginal!: Date;
  //TODO: condicionar la pantalla
  idPantalla: number = 1;
  filtrosBusqueda: FiltroInterface[] = [
    {
      id: 1,
      nombre: "Descripcion",
    },
    {
      id: 2,
      nombre: "Id Referencia",
    },
  ];


  constructor(
    private _tareaService: TareaService,
    private _translate: TranslateService,
    private _eventService: EventService,
    private _widgetsService: NotificationsService,
    private _actualizar: RefrescarService,
    public tareasGlobalService: GlobalTareasService,
  ) {
    window.addEventListener('scroll', this.scrollEvent, true);

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
    }


  }

  async refresh() {
    this.isLoading = true;
    //actualizar,  mostrar ultimas tareas y vacias input 
    this.botonIrArriba = false;
    await this.obtenerUltimasTareas();
    this.searchText = "";
    this.isLoading = false;
  }

  //regresar a la pantalla anterior
  backHome(): void {
    // this.newItemEvent.emit(false);
    this._eventService.emitCustomEvent(false);
  }

  //prguntar si hay otra manera xd
  getLrCode(): string[] {
    let lrCode = `${this.activeLang.lang}-${this.activeLang.reg}`;
    if (lrCode == 'es-GT') {
      this.filtrosBusqueda[0].nombre = busquedaEspaniol[0];
      this.filtrosBusqueda[1].nombre = busquedaEspaniol[1];
    }
    if (lrCode == 'en-US') {
      this.filtrosBusqueda[0].nombre = busquedaIngles[0];
      this.filtrosBusqueda[1].nombre = busquedaIngles[1];
    }
    return [];
  };

  //buscar tareas por creiteriod e busqueda
  async buscarTarea(): Promise<void> {
    this.crearTarea = false;
    if (this.selectedOption == 1) {
      this.isLoading = true;
      //Consumo de api
      let resTareasDesc: ResApiInterface = await this._tareaService.getTareasFiltro(this.searchText);

      this.isLoading = false;

      //Si el servico se ejecuta mal mostrar menaje
      if (!resTareasDesc.status) {

        if (this.searchText.length == 0) {
          this.obtenerUltimasTareas();
        } else {
          this._widgetsService.openSnackbar(this._translate.instant('pos.alertas.salioMal'));
          console.error(resTareasDesc.response);
          console.error(resTareasDesc.storeProcedure);
          return
        }
      }
      //Si se ejecuto bien, obtener la respuesta de Api Buscar Tareas
      this.buscarTareas = resTareasDesc.response;
    };

    if (this.selectedOption == 2) {
      this.isLoading = true;
      let resTareasIdRef: ResApiInterface = await this._tareaService.getTareasIdReferencia(this.searchText);

      this.isLoading = false;

      //Si el servico se ejecuta mal mostrar menaje
      if (!resTareasIdRef.status) {

        if (this.searchText.length == 0) {
          this.obtenerUltimasTareas();
        } else {
          this._widgetsService.openSnackbar(this._translate.instant('pos.alertas.salioMal'));
          console.error(resTareasIdRef.response);
          console.error(resTareasIdRef.storeProcedure);
          return;
        }
      }
      //Si se ejecuto bien, obtener la respuesta de Api Buscar Tareas
      this.buscarTareas = resTareasIdRef.response;
    }
  }
  //obtener ultimas tareas
  async obtenerUltimasTareas(): Promise<void> {
    this.crearTarea = false;
    //Consumo de api
    this.isLoading = true;
    let resTopTareas: ResApiInterface = await this._tareaService.getTopTareas(this.topTareas);

    this.isLoading = false;

    //Si el servico se ejecuta mal mostrar menaje
    if (!resTopTareas.status) {
      this._widgetsService.openSnackbar(this._translate.instant('pos.alertas.salioMal'));
      console.error(resTopTareas.response);
      console.error(resTopTareas.storeProcedure);
      return
    }
    //Si se ejecuto bien, obtener la respuesta de Api Buscar Tareas
    this.buscarTareas = resTopTareas.response;
  }


  //Escuchando scroll en todos los elementos
  scrollEvent = (event: any): void => {
    const number = event.srcElement.scrollTop; //Donde inicia el scroll
    //verificar que el scrool se ejecute dentro de la calse container_main
    if (event.srcElement.className == "container_main ng-star-inserted") {
      //evakuar si el scroll esta en la cantidad de pixeles para mostrar el boton
      if (number > this.showScrollHeight) {
        this.botonIrArriba = true; //MMostatr boton
      } else if (number < this.hideScrollHeight) {
        this.botonIrArriba = false; //ocultar boton
      }
    }
  }

  //Evento del scroll
  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.scrollEvent, true);
  }

  //Subir contenido
  contentUp(): void {
    $('.container_main').animate({ scrollTop: (0) }, 2000);
  }

  contentDown(): void {
    const containerMain = $('.container_main');
    const contentHeight = containerMain[0].scrollHeight - containerMain.height();

    containerMain.animate({ scrollTop: contentHeight }, 2000);
  }

  //Ver Detalles de la Tarea Seleccionada
  async viewTask(tarea: TareaInterface): Promise<void> {

    this.tareasGlobalService.tareaDetalles = tarea;
    this._actualizar.tareaCompleta = tarea;
    this._actualizar.tareas.next(this._actualizar.tareaCompleta);
    this.hideDetalle = false;
  }

  //ver pantalla de Home
  backPage(value: boolean): void {
    this.hideDetalle = value;
  }

  //cuando la informacion de los detalles esta vacia
  resolveObject(objeto: any): string {
    if (objeto == null)
      return this._translate.instant('crm.tareas.noAsignado');
    return objeto;
  }

  //mostrar pantalla de crear tareas, enviar la fecha en que se quiere crear
  nuevaTarea(): void {
    this.tareasGlobalService.fechaIni = new Date();
    // this.fechaOriginal = new Date();
    this.crearTarea = true;
    this.tareasGlobalService.idPantalla = 1;
    this.hideDetalle = false;
    this.mostrarTareas = false;
  }

  //ver pantalla de Home
  backPageTareas(value: boolean): void {
    this.obtenerUltimasTareas();
    this.mostrarTareas = value;
    this.hideDetalle = value;
  }

  addItem(newItem: TareaInterface): void {
    //agregar la taree creada al principio de todas las tareas
    this.buscarTareas.unshift(newItem);
  }

  onOptionChange(optionId: number) {
    this.selectedOption = optionId;
  }

}
