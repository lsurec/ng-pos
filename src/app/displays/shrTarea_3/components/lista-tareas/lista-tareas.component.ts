import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TareaService } from '../../services/tarea.service';
import { TranslateService } from '@ngx-translate/core';
import { EventService } from 'src/app/services/event.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { RefrescarService } from 'src/app/services/refrescar-tarea.service';
import { GlobalTareasService } from 'src/app/services/tarea-global.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { TareaInterface } from '../../interfaces/tarea-user.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { DataUserService } from 'src/app/displays/prc_documento_3/services/data-user.service';
import { components } from 'src/app/providers/componentes.provider';

@Component({
  selector: 'app-lista-tareas',
  templateUrl: './lista-tareas.component.html',
  styleUrls: ['./lista-tareas.component.scss'],
  providers: [
    TareaService,
    NotificationsService,
    UsuarioService
  ]
})
export class ListaTareasComponent implements OnInit {

  // Referencia al elemento con la clase container_main
  @ViewChild('contentContainer') contentContainer!: ElementRef;

  verDetalles: boolean = false;
  verCrear: boolean = false;
  isLoading: boolean = false;
  verError: boolean = false;
  regresar: number = 17;

  verTareas: boolean = true;
  verAsignadas: boolean = false;
  verCreadas: boolean = false;
  verInvitaciones: boolean = false;

  topTareas: number = 10; //ultimas tareas
  searchText: string = ""; //filtro de tareas
  buscarTareas: TareaInterface[] = [];

  //Botones
  //Subir contenido
  irArriba: boolean = false;
  irAbajo: boolean = true;
  showScrollHeight: number = 400; //En cuantos pixeles se va a mostrar el boton
  hideScrollHeight: number = 200; //en cuantos se va a ocultar

  constructor(

    private _tareaService: TareaService,
    private _translate: TranslateService,
    private _eventService: EventService,
    private _notificationService: NotificationsService,
    private _actualizar: RefrescarService,
    public tareaGlobalService: GlobalTareasService,
    public dataUserService: DataUserService,

  ) {

    window.addEventListener('scroll', this.scrollEvent, true);

    //Evento para mostla lista de tareas
    this._eventService.verTareas$.subscribe((eventData) => {
      this.contenido();
      this.tareas();
    });

    //Mostrar tareas regresando de crear
    this._eventService.verTareasDesdeCrear$.subscribe((eventData) => {
      this.contenido();
      this.tareas();
    });

    //mostrar contenido a regresar de error
    this._eventService.regresarTareasDeError$.subscribe((eventData) => {
      this.contenido();
    });

  }

  ngOnInit(): void {
    this.tareasTop10();
    this.irArriba = false;
    this.searchText = "";

  }

  goBack() {
    //Ocultar todos los componentes 
    components.forEach(element => {
      element.visible = false;
    });

    this._eventService.emitCustomEvent(false);
  }

  loadData() {
    this.tareasTop10();
    this.irArriba = false;
    this.searchText = "";
  }

  //obtener ultimas tareas
  async tareasTop10(): Promise<void> {
    //Consumo de api
    this.isLoading = true;
    let resTopTareas: ResApiInterface = await this._tareaService.getTopTareas(this.topTareas);

    this.isLoading = false;

    //si algo salio mal
    if (!resTopTareas.status) {

      this.isLoading = false;

      let verificador = await this._notificationService.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.informe'),
          falso: this._translate.instant('pos.botones.aceptar'),
        }
      );

      if (!verificador) return;

      this.mostrarError(resTopTareas);

      return;

    }
    //Si se ejecuto bien, obtener la respuesta de Api Buscar Tareas
    this.buscarTareas = resTopTareas.response;
  }






  //Escuchando scroll en todos los elementos
  scrollEvent = (event: any): void => {

    const number = event.srcElement.scrollTop; //Donde inicia el scroll
    //verificar que el scrool se ejecute dentro de la calse container_main
    if (event.srcElement.className == "container_main") {
      //evakuar si el scroll esta en la cantidad de pixeles para mostrar el boton
      if (number > this.showScrollHeight) {
        this.irArriba = true; //Mostrar boton
      } else if (number < this.hideScrollHeight) {
        this.irArriba = false; //ocultar boton
      }
    }
  }

  //Evento del scroll
  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.scrollEvent, true);
  }

  //buscar tareas por creiteriod e busqueda
  async buscarTarea(): Promise<void> {

    if (this.searchText.length == 0) {
      this._notificationService.openSnackbar(this._translate.instant('pos.alertas.ingreseCaracter'));
      return;
    }

    this.isLoading = true;
    //Consumo de api
    let resTarea: ResApiInterface = await this._tareaService.getTareasFiltro(
      this.searchText, this.tareaGlobalService.opcionFiltro,
    );

    this.isLoading = false;

    //si algo salio mal
    if (!resTarea.status) {

      this.isLoading = false;

      let verificador = await this._notificationService.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.informe'),
          falso: this._translate.instant('pos.botones.aceptar'),
        }
      );

      if (!verificador) return;

      this.mostrarError(resTarea);

      return;

    }


    //Si se ejecuto bien, obtener la respuesta de Api Buscar Tareas
    this.buscarTareas = resTarea.response;
  };


  async viewTask(tarea: TareaInterface): Promise<void> {

    this.tareaGlobalService.tareaDetalles = tarea;
    this._actualizar.tareaCompleta = tarea;
    this._actualizar.tareas.next(this._actualizar.tareaCompleta);

    this.detalles();
  }

  //ver pantalla de Home
  backPage(value: boolean): void {
    this.verDetalles = value;
  }


  //cuando la informacion de los detalles esta vacia
  resolveObject(objeto: any): string {
    if (objeto == null)
      return this._translate.instant('pos.home.noAsignado');
    return objeto;
  }

  //mostrar pantalla de crear tareas, enviar la fecha en que se quiere crear
  nuevaTarea(): void {
    this.tareaGlobalService.fechaIni = new Date();
    // this.fechaOriginal = new Date();
    // this.crearTarea = true;
    this.tareaGlobalService.idPantalla = 1;
    // this.hideDetalle = false;
    // this.mostrarTareas = false;

    this.crear();
  }

  //ver pantalla de Home
  backPageTareas(value: boolean): void {
    this.tareasTop10();
    // this.mostrarTareas = value;
    // this.hideDetalle = value;
  }

  addItem(newItem: TareaInterface): void {
    //agregar la taree creada al principio de todas las tareas
    this.buscarTareas.unshift(newItem);
  }


  //IR HACIA ABAJO
  scrollDown() {
    const container = this.contentContainer.nativeElement;
    this.smoothScroll(container, container.scrollHeight, 2000); // Desliza en 2 segundos
  }

  //IR HACIA ARRIBA
  scrollUp() {
    const container = this.contentContainer.nativeElement;
    this.smoothScroll(container, 0, 2000); // Desliza en 2 segundos
  }

  //REALIZAR EL SCROLL
  smoothScroll(element: HTMLElement, target: number, duration: number) {
    const start = element.scrollTop; // Posición inicial del desplazamiento
    const change = target - start; // Cambio total necesario en la posición
    const increment = 20; // Intervalo de tiempo entre cada frame de la animación
    let currentTime = 0; // Tiempo actual transcurrido

    // Función que anima el desplazamiento

    const animateScroll = () => {
      currentTime += increment; // Incrementa el tiempo actual
      // Calcula la nueva posición usando la función de easing
      const val = this.easeInOutQuad(currentTime, start, change, duration);
      element.scrollTop = val; // Ajusta la posición del elemento
      if (currentTime < duration) {
        setTimeout(animateScroll, increment); // Continúa la animación si no ha terminado
      }
    };

    animateScroll(); // Inicia la animación
  }

  //CREAR ANIMACION
  easeInOutQuad(t: number, b: number, c: number, d: number): number {
    t /= d / 2; // Normaliza el tiempo en la mitad de la duración
    if (t < 1) return c / 2 * t * t + b; // Aceleración cuadrática
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b; // Desaceleración cuadrática
  }

  cargar() {
    this.isLoading = true;
    this.verTareas = false;
    this.verDetalles = false;
    this.verCrear = false;
  }

  detalles() {
    this.verDetalles = true;
    this.isLoading = false;
    this.verTareas = false;
    this.verCrear = false;
    this.tareaGlobalService.contenidoTareas = false;

  }

  crear() {
    this.verCrear = true;
    this.verDetalles = false;
    this.isLoading = false;
    this.verTareas = false;
    this.tareaGlobalService.contenidoTareas = false;
    this.tareaGlobalService.fechaIni = new Date();
    this.tareaGlobalService.idPantalla = 1;

  }

  tareas() {
    this.tareaGlobalService.opcionFiltro = 0;
    if (!this.verTareas) {
      this.tareasTop10();
      this.searchText = "";
    }
    this.verTareas = true;
    this.verAsignadas = false;
    this.verCreadas = false;
    this.verInvitaciones = false;
    this.verCrear = false;
  }

  creadas() {
    //Mis tareas (Creadas por mí)
    this.tareaGlobalService.opcionFiltro = 1;

    if (!this.verCreadas) {
      this.tareasTop10();
      this.searchText = "";
    }

    this.verCreadas = true;
    this.verTareas = false;
    this.verAsignadas = false;
    this.verInvitaciones = false;

  }

  asignadas() {
    this.verAsignadas = true;
    this.verTareas = false;
    this.verCreadas = false;
    this.verInvitaciones = false;

  }

  invitaciones() {
    //Invitaciones (Invitados por mí)
    this.tareaGlobalService.opcionFiltro = 2;

    if (!this.verInvitaciones) {
      this.tareasTop10();
      this.searchText = "";
    }

    this.verInvitaciones = true;
    this.verTareas = false;
    this.verAsignadas = false;
    this.verCreadas = false;
  }


  contenido() {
    this.verError = false;
    this.verDetalles = false;
    this.tareaGlobalService.contenidoTareas = true;
  }


  //motstrar oantalla de informe de error
  mostrarError(res: ResApiInterface) {

    //Fecha y hora ctual
    let dateNow: Date = new Date();

    //informe de error
    let error = {
      date: dateNow,
      description: res.response,
      storeProcedure: res.storeProcedure,
      url: res.url,

    }

    //guardra error
    PreferencesService.error = error;

    //mmostrar pantalla de informe de error
    this.verError = true;
  }


}
