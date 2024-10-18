import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TareaService } from '../../services/tarea.service';
import { TranslateService } from '@ngx-translate/core';
import { EventService } from 'src/app/services/event.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { RefrescarService } from 'src/app/services/refrescar-tarea.service';
import { GlobalTareasService } from 'src/app/services/tarea-global.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { DataUserService } from 'src/app/displays/prc_documento_3/services/data-user.service';
import { components } from 'src/app/providers/componentes.provider';
import { TareaInterface } from '../../interfaces/tarea.interface';

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
  tareasEncontradas: TareaInterface[] = [];

  todasTareas: TareaInterface[] = [];
  creadasTareas: TareaInterface[] = [];
  asignadasTareas: TareaInterface[] = [];
  invitacionesTareas: TareaInterface[] = [];

  //Botones
  //Subir contenido
  irArriba: boolean = false;
  irAbajo: boolean = true;
  showScrollHeight: number = 400; //En cuantos pixeles se va a mostrar el boton
  hideScrollHeight: number = 200; //en cuantos se va a ocultar
  isScrolling: boolean = false;

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
    this.obtenerTodas();
    this.irArriba = false;
    this.searchText = "";

  }

  resultados: boolean = false;

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
    this.tareasFiltro = [];
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
    this.tareasEncontradas = resTopTareas.response;
  }

  highlightText(text: string, search: string): string {
    if (!search.trim()) return text;

    // Convertir ambos textos a minúsculas
    const lowerText = text.toLowerCase();
    const lowerSearch = search.toLowerCase();

    // Crear una expresión regular para buscar el texto
    const regex = new RegExp(`(${lowerSearch})`, 'gi');

    // Reemplazar el texto coincidente por el texto resaltado
    return text.replace(regex, '<span class="highlight">$1</span>');
  }

  // //Escuchando scroll en todos los elementos
  // scrollEvent = (event: any): void => {

  //   const number = event.srcElement.scrollTop; //Donde inicia el scroll
  //   //verificar que el scrool se ejecute dentro de la calse container_main
  //   if (event.srcElement.className == "container_main") {
  //     //evakuar si el scroll esta en la cantidad de pixeles para mostrar el boton
  //     if (number > this.showScrollHeight) {
  //       this.irArriba = true; //Mostrar boton
  //     } else if (number < this.hideScrollHeight) {
  //       this.irArriba = false; //ocultar boton
  //     }
  //   }
  // }

  hasReachedThreshold: boolean = false; // Bandera para controlar la ejecución

  creadasCarga: boolean = false;
  asignadasCarga: boolean = false;
  invitacionesCarga: boolean = false;
  todasCarga: boolean = false;

  // Escuchando scroll en todos los elementos
  scrollEvent = (event: any): void => {
    const element = event.srcElement;
    const scrollTop = element.scrollTop; // Donde inicia el scroll
    const scrollHeight = element.scrollHeight; // Altura total del contenido
    const clientHeight = element.clientHeight; // Altura visible del contenedor

    // Verificar que el scroll se ejecute dentro de la clase container_main
    if (element.className === "container_main") {
      // Calcular la distancia restante hasta el final del contenedor
      const distanceToBottom = scrollHeight - scrollTop - clientHeight;

      // Verificar si la distancia es menor o igual a 50 píxeles y si no se ha ejecutado antes
      if (distanceToBottom <= 250 && !this.hasReachedThreshold) {

        this.hasReachedThreshold = true; // Marcar como ejecutado

        if (this.verTareas) {
          this.recargarTodas();
        }

        if (this.verCreadas) {
          this.recargarCreadas();
        }

        if (this.verAsignadas) {
          this.recargarAsignadas();
        }

        if (this.verInvitaciones) {
          this.recargarInvitaciones();
        }
      }

      // Resetear la bandera cuando el usuario esté lejos de los 50 píxeles (por ejemplo, a 300 píxeles)
      if (distanceToBottom >= 300 && this.hasReachedThreshold) {

        if (this.verTareas && !this.todasCarga) {
          this.hasReachedThreshold = false;
        }

        if (this.verCreadas && !this.creadasCarga) {
          this.hasReachedThreshold = false;
        }

        if (this.verAsignadas && !this.asignadasCarga) {
          this.hasReachedThreshold = false;
        }

        if (this.verInvitaciones && !this.invitacionesCarga) {
          this.hasReachedThreshold = false;
        }
      }


      // Lógica para mostrar/ocultar el botón irArriba
      if (scrollTop > this.showScrollHeight) {
        this.irArriba = true; // Mostrar botón
      } else if (scrollTop < this.hideScrollHeight) {
        this.irArriba = false; // Ocultar botón
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
      this.searchText, 1, 10
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
    this.tareasEncontradas = resTarea.response;
  };


  tareasFiltro: TareaInterface[] = [];
  previousSearchText: string = '';

  rangoIni: number = 1;
  rangoFin: number = 10;

  rangoTodasIni: number = 1;
  rangoTodasFin: number = 10;

  rangoCreadasIni: number = 1;
  rangoCreadasFin: number = 10;

  rangoAsignadasIni: number = 1;
  rangoAsignadasFin: number = 10;

  rangoInvitacionesIni: number = 1;
  rangoInvitacionesFin: number = 10;

  intervaloRegistros: number = 10;

  verMas: boolean = true;

  async filtrarResultados(vermas: number) {

    const trimmedText = this.searchText.trim();

    // Si no se ha presionado ninguna tecla o el texto es igual al anterior
    // if (trimmedText.length == 0 || trimmedText === this.previousSearchText && vermas == 0 && this.tareasFiltro.length > 0) {
    //   return;
    // }

    // Actualiza el valor anterior con el valor actual
    this.previousSearchText = trimmedText;

    if (this.tareasFiltro.length == 0) {
      this.rangoIni = 1;
      this.rangoFin = this.intervaloRegistros;
    }

    // Realiza la búsqueda
    //si ver mas es = 1 aumenta los rangos
    if (vermas == 1) {

      this.isLoading = true;

      //aumentar los rangos
      let resTarea: ResApiInterface = await this._tareaService.getTareasFiltro(
        trimmedText, this.rangoIni, this.rangoFin
      );

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

      this.isLoading = false;

      //Si se ejecuto bien, obtener la respuesta de Api Buscar Tareas
      let tareasMas: TareaInterface[] = resTarea.response;

      this.isLoading = false;

      // Insertar la lista de tareas en `tareasFiltro`
      this.tareasFiltro.push(...tareasMas);

      this.rangoIni = this.tareasFiltro.length + 1;
      this.rangoFin = this.rangoIni + this.intervaloRegistros;

      this.resultados = true;

    } else {

      this.rangoIni = 1;
      this.rangoFin = 10;

      this.isLoading = true;

      //Consumo de api
      let resTarea: ResApiInterface = await this._tareaService.getTareasFiltro(
        trimmedText, this.rangoIni, this.rangoFin
      );

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


      this.isLoading = false;

      //Si se ejecuto bien, obtener la respuesta de Api Buscar Tareas
      this.tareasFiltro = resTarea.response;

      this.rangoIni += this.intervaloRegistros;
      this.rangoFin += this.intervaloRegistros;

      this.resultados = true;
    }

  }

  verResultados() {
    this.tareasFiltro.length > 0 && this.searchText ? this.resultados = true : this.resultados = false;
  }

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
    this.tareasEncontradas.unshift(newItem);
  }


  //IR HACIA ABAJO
  scrollDown() {
    if (this.isScrolling) return; // Si ya está desplazándose, no hacer nada
    this.isScrolling = true; // Marca que el desplazamiento ha comenzado
    const container = this.contentContainer.nativeElement;
    this.smoothScroll(container, container.scrollHeight, 2000, () => {
      this.isScrolling = false; // Desbloquea el desplazamiento al finalizar
    });
  }

  //IR HACIA ARRIBA
  scrollUp() {
    if (this.isScrolling) return; // Si ya está desplazándose, no hacer nada
    this.isScrolling = true; // Marca que el desplazamiento ha comenzado
    const container = this.contentContainer.nativeElement;
    this.smoothScroll(container, 0, 2000, () => {
      this.isScrolling = false; // Desbloquea el desplazamiento al finalizar
    });
  }

  //REALIZAR EL SCROLL
  smoothScroll(element: HTMLElement, target: number, duration: number, callback: () => void) {
    const start = element.scrollTop;
    const change = target - start;
    const increment = 20;
    let currentTime = 0;

    const animateScroll = () => {
      currentTime += increment;
      const val = this.easeInOutQuad(currentTime, start, change, duration);
      element.scrollTop = val;
      if (currentTime < duration) {
        setTimeout(animateScroll, increment);
      } else {
        callback(); // Llama al callback al finalizar el desplazamiento
      }
    };

    animateScroll();
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
    this.tareaGlobalService.opcionFiltro = 1;
    if (!this.verTareas && this.todasTareas.length == 0) {
      this.obtenerTodas();
    }
    this.verTareas = true;
    this.verAsignadas = false;
    this.verCreadas = false;
    this.verInvitaciones = false;
    this.verCrear = false;
  }

  creadas() {
    //Mis tareas (Creadas por mí)
    this.tareaGlobalService.opcionFiltro = 2;

    if (!this.verCreadas && this.creadasTareas.length == 0) {
      this.obtenerCreadas();
    }

    this.verCreadas = true;
    this.verTareas = false;
    this.verAsignadas = false;
    this.verInvitaciones = false;

  }

  asignadas() {
    //Mis Asignaciones (Mi usuario es responsable de la tarea)
    this.tareaGlobalService.opcionFiltro = 3;

    if (!this.verCreadas && this.asignadasTareas.length == 0) {
      this.obtenerAsignadas();
    }

    this.verAsignadas = true;
    this.verTareas = false;
    this.verCreadas = false;
    this.verInvitaciones = false;

  }

  invitaciones() {
    //Invitaciones (Invitaciones para mi usuario)
    this.tareaGlobalService.opcionFiltro = 4;

    if (!this.verInvitaciones && this.invitacionesTareas.length == 0) {
      this.obtenerInvitaciones();
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


  //TOP TODAS LAS TAREAS

  async obtenerTodas(): Promise<void> {

    this.isLoading = true;
    //Consumo de api
    let resTarea: ResApiInterface = await this._tareaService.getTareasTodas(
      this.rangoTodasIni, this.rangoTodasFin,
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
    this.todasTareas = resTarea.response;

    this.rangoTodasIni = this.todasTareas[this.todasTareas.length - 1].id + 1;
    this.rangoTodasFin = this.rangoTodasIni + 10;
  };

  async recargarTodas() {

    this.todasCarga = true;

    //aumentar los rangos
    let resTarea: ResApiInterface = await this._tareaService.getTareasTodas(
      this.rangoTodasIni, this.rangoTodasFin
    );

    //si algo salio mal
    if (!resTarea.status) {

      this.todasCarga = false;

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
    let tareasMas: TareaInterface[] = resTarea.response;

    this.todasCarga = false;

    // Insertar la lista de tareas en `tareasFiltro`
    this.todasTareas.push(...tareasMas);

    if (tareasMas.length == 0 && this.verTareas) {
      this.hasReachedThreshold = true;
    } else {
      this.hasReachedThreshold = false;
    }

    //actualizar rangos
    let mas10: number = 10;

    this.rangoTodasIni = this.todasTareas[this.todasTareas.length - 1].id + 1;
    this.rangoTodasFin = this.rangoTodasIni + this.intervaloRegistros + mas10;

  }

  //obtener creadas
  async obtenerCreadas(): Promise<void> {

    this.isLoading = true;
    //Consumo de api
    let resTarea: ResApiInterface = await this._tareaService.getTareasCreadas(
      1, 10,
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
    this.creadasTareas = resTarea.response;

    this.rangoCreadasIni = this.creadasTareas[this.creadasTareas.length - 1].id + 1;
    this.rangoCreadasFin = this.rangoCreadasIni + 10;
  };

  async recargarCreadas() {

    this.creadasCarga = true;

    //aumentar los rangos
    let resTarea: ResApiInterface = await this._tareaService.getTareasCreadas(
      this.rangoCreadasIni, this.rangoCreadasFin
    );

    //si algo salio mal
    if (!resTarea.status) {

      this.creadasCarga = false;

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
    let tareasMas: TareaInterface[] = resTarea.response;

    this.creadasCarga = false;

    // Insertar la lista de tareas en `tareasFiltro`
    this.creadasTareas.push(...tareasMas);

    if (tareasMas.length == 0 && this.verCreadas) {
      this.hasReachedThreshold = true;
    } else {
      this.hasReachedThreshold = false;
    }

    //actualizar rangos
    let mas10: number = 10;

    this.rangoCreadasIni = this.creadasTareas[this.creadasTareas.length - 1].id + 1;
    this.rangoCreadasFin = this.rangoCreadasIni + this.intervaloRegistros + mas10;

  }

  //TOP TAREAS ASIGNADAS
  async obtenerAsignadas(): Promise<void> {

    this.isLoading = true;
    //Consumo de api
    let resTarea: ResApiInterface = await this._tareaService.getTareasAsignadas(
      1, 10,
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
    this.asignadasTareas = resTarea.response;

    if (this.asignadasTareas) {
      this.rangoAsignadasIni = this.asignadasTareas[this.asignadasTareas.length - 1].id + 1;
      this.rangoAsignadasFin = this.rangoAsignadasIni + this.intervaloRegistros;
    }
  };

  async recargarAsignadas() {

    this.asignadasCarga = true;

    //aumentar los rangos
    let resTarea: ResApiInterface = await this._tareaService.getTareasAsignadas(
      this.rangoAsignadasIni, this.rangoAsignadasFin
    );

    //si algo salio mal
    if (!resTarea.status) {

      this.asignadasCarga = false;

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
    let tareasMas: TareaInterface[] = resTarea.response;

    this.asignadasCarga = false;

    // Insertar la lista de tareas en `tareasFiltro`
    this.asignadasTareas.push(...tareasMas);

    if (tareasMas.length == 0 && this.verAsignadas) {
      this.hasReachedThreshold = true;
    } else {
      this.hasReachedThreshold = false;
    }

    //actualizar rangos
    let mas10: number = 10;

    this.rangoAsignadasIni = this.asignadasTareas[this.asignadasTareas.length - 1].id + 1;
    this.rangoAsignadasFin = this.rangoAsignadasIni + this.intervaloRegistros + mas10;

  }

  //TOP TAREAS INVITACIONES
  async obtenerInvitaciones(): Promise<void> {

    this.isLoading = true;
    //Consumo de api
    let resTarea: ResApiInterface = await this._tareaService.getTareasInvitaciones(
      1, 10,
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
    this.invitacionesTareas = resTarea.response;

    this.rangoInvitacionesIni = this.invitacionesTareas[this.invitacionesTareas.length - 1].id + 1;
    this.rangoInvitacionesFin = this.rangoInvitacionesIni + this.intervaloRegistros;
  };

  async recargarInvitaciones() {

    this.invitacionesCarga = true;

    //aumentar los rangos
    let resTarea: ResApiInterface = await this._tareaService.getTareasInvitaciones(
      this.rangoInvitacionesIni, this.rangoInvitacionesFin
    );

    //si algo salio mal
    if (!resTarea.status) {

      this.invitacionesCarga = false;

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
    let tareasMas: TareaInterface[] = resTarea.response;

    this.invitacionesCarga = false;

    // Insertar la lista de tareas en `tareasFiltro`
    this.invitacionesTareas.push(...tareasMas);

    if (tareasMas.length == 0 && this.verInvitaciones) {
      this.hasReachedThreshold = true;
    } else {
      this.hasReachedThreshold = false;
    }

    //actualizar rangos
    let mas10: number = 10;

    this.rangoInvitacionesIni = this.invitacionesTareas[this.invitacionesTareas.length - 1].id + 1;
    this.rangoInvitacionesFin = this.rangoInvitacionesIni + this.intervaloRegistros + mas10;

  }

}
