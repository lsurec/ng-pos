import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgbCalendar, NgbDateStruct, NgbTimepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NgxMaterialTimepickerComponent } from 'ngx-material-timepicker';
import { TareaCalendarioInterface } from 'src/app/displays/prcTarea_1/interfaces/tarea-calendario.interface';
import { DetalleInterface } from 'src/app/displays/shrTarea_3/interfaces/detalle-tarea.interface';
import { EstadoInterface } from 'src/app/displays/shrTarea_3/interfaces/estado-tarea.interface';
import { IDReferenciaInterface } from 'src/app/displays/shrTarea_3/interfaces/id-referencia.interface';
import { EnviarInvitadoInterface } from 'src/app/displays/shrTarea_3/interfaces/invitado.interface';
import { TiemposInterface } from 'src/app/displays/shrTarea_3/interfaces/periodicidad.interface';
import { NivelPrioridadInterface } from 'src/app/displays/shrTarea_3/interfaces/prioridad-tarea.interface';
import { EnviarResponsableInterface } from 'src/app/displays/shrTarea_3/interfaces/responsable.interface';
import { TareaInterface } from 'src/app/displays/shrTarea_3/interfaces/tarea-user.interface';
import { TipoTareaInterface } from 'src/app/displays/shrTarea_3/interfaces/tipo-tarea.interface';
import { BuscarUsuariosInterface } from 'src/app/displays/shrTarea_3/interfaces/usuario.interface';
import { EstadoService } from 'src/app/displays/shrTarea_3/services/estado.service';
import { PeriodicidadService } from 'src/app/displays/shrTarea_3/services/periodicidad.service';
import { NivelPrioridadService } from 'src/app/displays/shrTarea_3/services/prioridad.service';
import { TipoTareaService } from 'src/app/displays/shrTarea_3/services/tipo.service';
import { ComentarInterface } from 'src/app/interfaces/comentario.interface';
import { CrearTareaInterface } from 'src/app/interfaces/crear-tarea.interface';
import { LanguageInterface } from 'src/app/interfaces/language.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { indexDefaultLang, languagesProvider } from 'src/app/providers/languages.provider';
import { CargarArchivosService } from 'src/app/services/archivo.service';
import { CrearTareasComentariosService } from 'src/app/services/crear-tarea-comentario.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { GlobalTareasService } from 'src/app/services/tarea-global.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { BuscarIdReferenciaComponent } from '../buscar-id-referencia/buscar-id-referencia.component';
import { UsuariosDialogComponent } from '../usuarios-dialog/usuarios-dialog.component';

@Component({
  selector: 'app-crear-tarea',
  templateUrl: './crear-tarea.component.html',
  styleUrls: ['./crear-tarea.component.scss'],
  providers: [
    EstadoService,
    NotificationsService,
    TipoTareaService,
    NgbTimepickerConfig,
    NivelPrioridadService,
    CargarArchivosService,
    UsuarioService,
    PeriodicidadService,
    CrearTareasComentariosService,
  ]
})
export class CrearTareaComponent implements OnChanges {

  @Output() newItemEvent = new EventEmitter<boolean>();
  @Output() desdeCalendario = new EventEmitter<boolean>();
  @Output() desdeTareas = new EventEmitter<boolean>();
  @ViewChild('fileInput') fileInput!: ElementRef;

  // selectores de horas
  @ViewChild('defaultTime') horaInicioPiker?: NgxMaterialTimepickerComponent;
  @ViewChild('defaultTime') horaFinalPiker?: NgxMaterialTimepickerComponent;
  //crear tarea desde tareas
  @Output() nuevaTarea = new EventEmitter<TareaInterface>();
  //crear tarea desde calendario
  @Output() nuevaTareaCalendario = new EventEmitter<TareaCalendarioInterface>();
  //traer la fecha de la tarea desde calendario y tareas
  @Input() fechaTarea?: Date;

  //TODO: condicionar la pantalla
  // @Input() idPantalla!: number;
  //Para lograr lastraducciones de los textos de la pantalla
  idioma: number = indexDefaultLang;
  languages: LanguageInterface[] = languagesProvider;
  activeLang!: LanguageInterface;

  //Listas para guardar la respuesta obtenida del consumo de los seruicios
  estadosTarea: EstadoInterface[] = [];
  tiposTarea: TipoTareaInterface[] = [];
  prioridadesTarea: NivelPrioridadInterface[] = [];
  usuariosResponsables: BuscarUsuariosInterface[] = []; // Lista para almacenar los usuarios seleccionados
  usuariosInvitados: BuscarUsuariosInterface[] = [];
  seleccionarInvitados!: number;
  seleccionarResponsable!: number;

  //guardar informacion de la tarea
  searchUser: string = ''; //buscar usuario
  tituloTarea: string = ''; //titulo de la tarea
  descripcion: string = ''; //descripcion de la tarea (observacion)
  idReferencia: IDReferenciaInterface | null = null; //referencia que ha sido seleccionada
  tipoTarea: TipoTareaInterface | null = null; //tipo de la tarea
  estadoTarea: EstadoInterface | null = null; //estado de la tarea
  prioridadTarea: NivelPrioridadInterface | null = null;
  selectedFiles: File[] = []; //guardar nombre de los archivos seleccionados
  tiempoEstimado: TiemposInterface | null = null; //tiempo estimado para asignarselo a una tarea
  notificacion: TiemposInterface | null = null; //periodicidad para notificaciones
  periodicidad: TiemposInterface[] = [];
  duracion: number = 10;
  responsableTarea!: EnviarResponsableInterface;
  invitadosTarea: EnviarInvitadoInterface[] = [];
  //variables para fechas y horas
  horaActual!: string; //hora actual
  horaFinal!: string //hora final +10 min
  nuevaFechaInicial!: NgbDateStruct; //fecha inicial de la tarea
  nuevaFechaFinal!: NgbDateStruct; //fecha final de la tarea +10 minutos
  horaMinima?: string;
  horaFinMinima?: string;
  fechaHoy: Date = new Date();
  //mostrar y ocultar pantallas
  isLoading: boolean = false; //pantalla de carga
  crearTarea: boolean = true; //mostrar pantalla de crear tareas


  tarea!: DetalleInterface;

  usuarioTarea = PreferencesService.user;
  token = PreferencesService.token;

  constructor(
    private _dialog: MatDialog,
    private _calendar: NgbCalendar,
    private _translate: TranslateService,
    private _files: CargarArchivosService,
    private _estadoService: EstadoService,
    private _widgetsService: NotificationsService,
    private _prioridad: NivelPrioridadService,
    private _tipoTareaService: TipoTareaService,
    private _usuarioService: UsuarioService,
    private _tiempoService: PeriodicidadService,
    private _nuevaTarea: CrearTareasComentariosService,
    private _nuevoComentario: CrearTareasComentariosService,
    public tareasGlobalService: GlobalTareasService,
  ) {
    this.usuarioTarea = PreferencesService.user.toUpperCase();
    // Inicializar selectedDate con la fecha de hoy
    this.nuevaFechaInicial = this._calendar.getToday();
    this.nuevaFechaFinal = this._calendar.getToday();

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
    //Funcion que carga datos
    this.loadData();
    this.seleccionarResponsable = 1;
    this.seleccionarInvitados = 2;


  };


  fechaActual() {

    let dateNow: Date = new Date;
    this.tareasGlobalService.fecha = dateNow;
    this.tareasGlobalService.horaInicioMinima = new Date(dateNow); // hora inicio minima
    this.tareasGlobalService.horaFinMinima = new Date(dateNow); //hora fin minima

    this.tareasGlobalService.fechaStruct = this.getStructureDate(dateNow);

    this.tareasGlobalService.fechaIni = new Date(dateNow);
    this.tareasGlobalService.fechaFin = new Date(dateNow);

    let modifyFechaFin: Date = new Date(dateNow);

    this.tareasGlobalService.fechaFin.setTime(modifyFechaFin.getTime() + (10 * 60000));

    this.tareasGlobalService.inputFechaInicial = this.getStructureDate(this.tareasGlobalService.fechaIni);
    this.tareasGlobalService.inputFechaFinal = this.getStructureDate(this.tareasGlobalService.fechaFin);

    this.tareasGlobalService.horaInicial = this.getHoraInput(this.tareasGlobalService.fechaIni);
    this.tareasGlobalService.horaFinal = this.getHoraInput(this.tareasGlobalService.fechaFin);

    this.tareasGlobalService.copyFechaIni = new Date(this.tareasGlobalService.fechaIni);
    this.tareasGlobalService.copyFechaFin = new Date(this.tareasGlobalService.fechaFin);
  }

  fechaCalendario() {
    let dateNow: Date = new Date;
    this.tareasGlobalService.fecha = dateNow;

    this.fechaTarea = new Date(this.tareasGlobalService.fechaIniCalendario!);
    this.tareasGlobalService.calendarioHoraFinMinima = new Date(this.tareasGlobalService.fechaIniCalendario!); //hora fin minima

    // asignarle a la fechaStruct la fecha actual;
    this.tareasGlobalService.fechaStruct = this.getStructureDate(dateNow);

    this.tareasGlobalService.fechaIni = new Date(this.fechaTarea!);
    this.tareasGlobalService.fechaFin = new Date(this.fechaTarea!);

    //a la fecha actual sumarle 30 minutos para visualizarla en el input de la hora
    //esta NO es la fecha final
    let horaFinalInput30: Date = new Date(dateNow);
    horaFinalInput30.setTime(horaFinalInput30.getTime() + (10 * 60000));

    //fecha que modificará la hora final de la tarea sumandole 30 minutos
    //Esta si será la fecha final 
    let modifyFechaFin: Date = new Date(this.fechaTarea!);
    this.tareasGlobalService.fechaFin.setTime(modifyFechaFin.getTime() + (10 * 60000));

    //asignar valores a los inputs de fechas y horas
    this.tareasGlobalService.inputFechaInicial = this.getStructureDate(this.tareasGlobalService.fechaIni);
    this.tareasGlobalService.inputFechaFinal = this.getStructureDate(this.tareasGlobalService.fechaFin);

    this.tareasGlobalService.horaInicial = this.getHoraInput(dateNow);
    this.tareasGlobalService.horaFinal = this.getHoraInput(horaFinalInput30);
  }


  fechaDiaCalendario() {
    let dateNow: Date = new Date;
    this.tareasGlobalService.fecha = dateNow;

    this.fechaTarea = new Date(this.tareasGlobalService.fechaIniCalendario!);
    this.tareasGlobalService.calendarioHoraFinMinima = new Date(this.fechaTarea); //hora fin minima

    // asignarle a la fechaStruct la fecha actual;
    this.tareasGlobalService.fechaStruct = this.getStructureDate(dateNow);

    this.tareasGlobalService.fechaIni = new Date(this.fechaTarea!);
    this.tareasGlobalService.fechaFin = new Date(this.fechaTarea!);

    //a la fecha actual sumarle 30 minutos para visualizarla en el input de la hora
    //esta NO es la fecha final
    // let horaFinalInput30: Date = new Date(dateNow);
    // horaFinalInput30.setTime(horaFinalInput30.getTime() + (10 * 60000));

    //fecha que modificará la hora final de la tarea sumandole 30 minutos
    //Esta si será la fecha final 
    let modifyFechaFin: Date = new Date(this.fechaTarea!);
    this.tareasGlobalService.fechaFin.setTime(modifyFechaFin.getTime() + (10 * 60000));

    //asignar valores a los inputs de fechas y horas
    this.tareasGlobalService.inputFechaInicial = this.getStructureDate(this.tareasGlobalService.fechaIni);
    this.tareasGlobalService.inputFechaFinal = this.getStructureDate(this.tareasGlobalService.fechaFin);

    this.tareasGlobalService.horaInicial = this.getHoraInput(this.tareasGlobalService.fechaIni);
    this.tareasGlobalService.horaFinal = this.getHoraInput(this.tareasGlobalService.fechaFin);
  }



  validateStartDate() {

    //asiganr fecha inicial
    this.tareasGlobalService.fechaIni = this.convertValidDate(this.tareasGlobalService.inputFechaInicial!, this.tareasGlobalService.horaInicial);

    //SI la fecha inciial es amyor a lfinal cambiar fecha y suamr 30 min
    if (this.tareasGlobalService.fechaIni > this.tareasGlobalService.fechaFin!) {

      //Asiganar mismma fecha
      this.tareasGlobalService.fechaFin = new Date(this.tareasGlobalService.fechaIni);

      //Sumar 30 min a la fecha 
      let modifyFechaFin: Date = new Date(this.tareasGlobalService.fechaIni);

      this.tareasGlobalService.fechaFin.setTime(modifyFechaFin.getTime() + (10 * 60000));

      this.tareasGlobalService.inputFechaFinal = this.getStructureDate(this.tareasGlobalService.fechaFin);
      this.tareasGlobalService.horaFinal = this.getHoraInput(this.tareasGlobalService.fechaFin);

      //Set hora minima final 
      this.tareasGlobalService.horaFinMinima = new Date(this.tareasGlobalService.fechaIni);

      //si se cambio de dia fecha minima incial cambia a cualquier ora (00:00)
      if (this.compareDate(this.tareasGlobalService.fechaIni, this.tareasGlobalService.fecha!)) {

        //Restamblecer la fecha mayor con la hora 12:00 am
        let horaCero: Date = new Date(this.tareasGlobalService.fechaIni);
        horaCero.setHours(0);
        horaCero.setMinutes(0);

        this.tareasGlobalService.horaInicioMinima = new Date(horaCero);
        this.tareasGlobalService.horaFinMinima = new Date(this.tareasGlobalService.fechaIni);


      }
      //Los dias son iguales
    } else if (this.isEqualDate(this.tareasGlobalService.fechaIni, this.tareasGlobalService.fecha!)) {
      //asignar la hora de inicio minima a la hora de la fecha
      this.tareasGlobalService.horaInicioMinima = new Date(this.tareasGlobalService.fecha!);
      this.tareasGlobalService.horaFinMinima = new Date(this.tareasGlobalService.fechaIni);


      this.tareasGlobalService.horaInicial = this.getHoraInput(this.tareasGlobalService.horaInicioMinima)
    }

  }

  validateStartDateCalendar() {
    //asiganr fecha inicial
    this.tareasGlobalService.fechaIni = this.convertValidDate(this.tareasGlobalService.inputFechaInicial!, this.tareasGlobalService.horaInicial);

    //SI la fecha inciial es amyor a lfinal cambiar fecha y suamr 30 min
    if (this.tareasGlobalService.fechaIni >= this.tareasGlobalService.fechaFin!) {

      //Asiganar mismma fecha
      this.tareasGlobalService.fechaFin = new Date(this.tareasGlobalService.fechaIni);

      //Sumar 30 min a la fecha 
      let modifyFechaFin: Date = new Date(this.tareasGlobalService.fechaIni);

      this.tareasGlobalService.fechaFin.setTime(modifyFechaFin.getTime() + (10 * 60000));

      this.tareasGlobalService.inputFechaFinal = this.getStructureDate(this.tareasGlobalService.fechaFin);
      this.tareasGlobalService.horaFinal = this.getHoraInput(this.tareasGlobalService.fechaFin);

      //Set hora minima final 
      this.tareasGlobalService.calendarioHoraFinMinima = new Date(this.tareasGlobalService.fechaIni);

    }
  }

  validateEndDateCalendar() {

    //asiganr fecha inicial
    this.tareasGlobalService.fechaFin = this.convertValidDate(this.tareasGlobalService.inputFechaFinal!, this.tareasGlobalService.horaFinal);

    //si la fecha final es mayor a la inicial
    if (this.compareDate(this.tareasGlobalService.fechaFin, this.tareasGlobalService.fechaIni!)) {
      //Restablecer la fecha final con la hora 12:00 am
      let horaCero: Date = new Date(this.tareasGlobalService.fechaFin);
      horaCero.setHours(0);
      horaCero.setMinutes(0);

      //asiganar nueva fecha 00:00 (12:00 am) a la fecha final minima
      this.tareasGlobalService.calendarioHoraFinMinima = new Date(horaCero);
    } else {
      //si las fechas son iguales crear una nuva fecha final apartir de la fecha actual
      let horaFinalInput30: Date = new Date(this.tareasGlobalService.fechaIni!);
      //modificar la fecha sumandole 30 minutos
      horaFinalInput30.setTime(horaFinalInput30.getTime() + (10 * 60000));

      //asignar al input fecha actual + 30 minutos
      this.tareasGlobalService.horaFinal = this.getHoraInput(horaFinalInput30);

      //la fecha final minima será la seleccionada al inicio 
      this.tareasGlobalService.calendarioHoraFinMinima = new Date(this.tareasGlobalService.fechaIni!);
    }
  }

  compareDate(fechaInicio: Date, fechaFin: Date) {
    const fecha1SinHora: Date = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), fechaInicio.getDate());
    const fecha2SinHora: Date = new Date(fechaFin.getFullYear(), fechaFin.getMonth(), fechaFin.getDate());

    return fecha1SinHora > fecha2SinHora ? true : false;
  }

  isEqualDate(fechaInicio: Date, fechaFinal: Date) {
    const fecha1SinHora: Date = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), fechaInicio.getDate());
    const fecha2SinHora: Date = new Date(fechaFinal.getFullYear(), fechaFinal.getMonth(), fechaFinal.getDate());

    // Comparar las fechas sin hora, minutos y segundos
    if (fecha1SinHora > fecha2SinHora) {
      return false;
    } else if (fecha1SinHora < fecha2SinHora) {
      return false;
    } else {
      return true;
    }
  }


  validateEndDate() {

    //asiganr fecha inicial
    this.tareasGlobalService.fechaFin = this.convertValidDate(this.tareasGlobalService.inputFechaFinal!, this.tareasGlobalService.horaFinal);

    if (this.compareDate(this.tareasGlobalService.fechaFin, this.tareasGlobalService.fechaIni!)) {

      //Restamblecer la fecha mayor con la hora 12:00 am
      let horaCero: Date = new Date(this.tareasGlobalService.fechaFin);
      horaCero.setHours(0);
      horaCero.setMinutes(0);

      this.tareasGlobalService.horaFinMinima = new Date(horaCero);

      //los dias son iguales
    } else if (this.isEqualDate(this.tareasGlobalService.fechaIni!, this.tareasGlobalService.fechaFin!)) {
      this.tareasGlobalService.horaFinMinima = new Date(this.tareasGlobalService.fechaIni!);

      //si las fechas son iguales crear una nuva fecha final apartir de la fecha actual
      let horaFinalInput30: Date = new Date(this.tareasGlobalService.horaFinMinima);
      //modificar la fecha sumandole 30 minutos
      horaFinalInput30.setTime(horaFinalInput30.getTime() + (10 * 60000));

      //asignar al input fecha actual + 30 minutos
      this.tareasGlobalService.horaFinal = this.getHoraInput(horaFinalInput30);

    }

  }

  // Formato fecha
  dateFormat(fecha: Date): string {
    let date = new Date(fecha); // Nueva fecha
    let day = date.getDate(); // Día
    let month = date.getMonth() + 1; // Mes (+1 para que sea del 1 al 12)
    let year = date.getFullYear(); // Año

    // Función para obtener la hora en formato de 12 horas (AM/PM)
    const formatTime = (time: Date): string => {
      let hours = time.getHours(); // Hora
      let minutes = time.getMinutes(); // Minutos
      let amPM = hours >= 12 ? 'PM' : 'AM'; // AM o PM
      hours = hours % 12 || 12; // Convertir la hora a formato de 12 horas

      // Añadir un cero inicial si los minutos son menores que 10
      let paddedMinutes = minutes < 10 ? '0' + minutes : minutes;

      return `${hours}:${paddedMinutes} ${amPM}`;
    };

    // Retorna la fecha en el formato "dd/mm/yyyy hh:mm AM/PM"
    return `${day}/${month}/${year} ${formatTime(date)}`;
  }

  convertValidDate(date: NgbDateStruct, timeString: string): Date {
    // Separar la cadena de tiempo en horas, minutos y AM/PM
    const { year, month, day } = date;
    let [time, meridiem] = timeString.split(' ');
    const [hoursString, minutesString] = time.split(':');

    let hours = parseInt(hoursString);
    const minutes = parseInt(minutesString);

    // Convertir las horas a formato de 24 horas si es PM
    if (meridiem.toUpperCase() === 'PM' && hours < 12 || meridiem.toLowerCase() === "p. m." && hours < 12) {
      hours += 12;
    } else if (meridiem.toUpperCase() === 'AM' && hours === 12 || meridiem.toLowerCase() === "a. m." && hours === 12) {
      hours = 0; // Si es 12:xx AM, lo convertimos a 0 horas
    }

    return new Date(year, month - 1, day, hours, minutes);
  }


  getStructureDate(date: Date) {
    return {
      year: date.getFullYear(),
      day: date.getDate(),
      month: date.getMonth() + 1,
    }
  }

  //Cargar datos
  async loadData(): Promise<void> {

    this.fechaTarea = new Date(this.tareasGlobalService.fechaIniCalendario!);
    // this.fechaActual();
    if (this.tareasGlobalService.idPantalla == 1) {
      this.fechaActual();
    } else if (this.tareasGlobalService.idPantalla == 2) {
      this.fechaCalendario();
    }

    if (this.tareasGlobalService.idPantalla == 2 && this.tareasGlobalService.vistaDia) {
      this.fechaDiaCalendario();
    }

    this.isLoading = true; //Cargando en true

    //estados tarea
    await this.getEstado();
    for (let index = 0; index < this.estadosTarea.length; index++) {
      const element = this.estadosTarea[index];
      if (element.descripcion.toLowerCase() == 'activo') {
        this.estadoTarea = element;
        break;
      }
    }
    //Tipo de tarea
    await this.getTipoTarea();

    for (let index = 0; index < this.tiposTarea.length; index++) {
      const element = this.tiposTarea[index];
      if (element.descripcion.toLowerCase() == 'tarea') {
        this.tipoTarea = element;
        break;
      }
    }

    //prioeidad de tarea
    await this.getNivelPrioridad();

    for (let index = 0; index < this.prioridadesTarea.length; index++) {
      const element = this.prioridadesTarea[index];
      if (element.nombre.toLowerCase() == 'normal') {
        this.prioridadTarea = element;
        break;
      }
    }

    //periodicidades
    await this.getPeriodicidad();

    for (let index = 0; index < this.periodicidad.length; index++) {
      const element = this.periodicidad[index];
      if (element.descripcion.toLowerCase() == 'minutos') {
        this.tiempoEstimado = element;
        break;
      }
    }

    this.isLoading = false; //Cargando en false
  };

  abrirTimePicker(timepicker: NgxMaterialTimepickerComponent) {
    timepicker.open();
  }

  //formatear la hora con una fecha ingresada.
  getHoraInputNew(horaSelected: Date): string {
    // Obtener la hora actual y formatearla como deseas
    let hora = new Date(horaSelected);
    let horas = hora.getHours();
    let minutos = hora.getMinutes();
    let ampm = horas >= 12 ? 'pm' : 'am';
    // Formatear la hora actual como 'hh:mm am/pm'
    return `${horas % 12 || 12}:${minutos < 10 ? '0' : ''}${minutos} ${ampm}`;
  };


  //actualizar inputs de fecha y horas cada que se ingresa a una hora desde calendario
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fechaTarea'] && !changes['fechaTarea'].firstChange) {

      if (this.tareasGlobalService.idPantalla == 2 && this.tareasGlobalService.vistaDia) {
        this.fechaDiaCalendario();
      } else if (this.tareasGlobalService.idPantalla == 2 && !this.tareasGlobalService.vistaDia) {
        this.fechaCalendario();
      }

    };
    // this.fechaActual();
    this.seleccionarResponsable = 1;
    this.seleccionarInvitados = 2;
  };

  //enviar tarea a lista de tareas y mostrarla al inicio de todas las tareas
  agregarNuevaTarea(tarea: TareaInterface): void {
    this.nuevaTarea.emit(tarea);
  };

  //enviar tareas a calendario y mostrarla en calendario (por el momento temporalmente)
  agregarTareaCalendario(tarea: TareaCalendarioInterface): void {
    this.nuevaTareaCalendario.emit(tarea);
  };

  //Obtener el Estado de la Tarea
  async getEstado(): Promise<void> {
    //Consumo de api
    let resEstados: ResApiInterface = await this._estadoService.getEstado();
    //Si el servico se ejecuta mal mostar mensaje
    if (!resEstados.status) {
      this._widgetsService.openSnackbar(this._translate.instant('pos.alertas.salioMal'));
      console.error(resEstados.response);
      console.error(resEstados.storeProcedure);
      return;
    };
    //Guardar Estados de la tarea
    this.estadosTarea = resEstados.response;
  };

  //Obtener el Tipo de la Tarea
  async getTipoTarea(): Promise<void> {
    //Consumo de api
    let resTipos: ResApiInterface = await this._tipoTareaService.getTipoTarea();
    ///Si el servico se ejecuta mal mostrar mensaje
    if (!resTipos.status) {
      this._widgetsService.openSnackbar(this._translate.instant('pos.alertas.salioMal'));
      console.error(resTipos.response);
      console.error(resTipos.storeProcedure);
      return;
    };
    //Guardar respuesta en Lista Tipo Tarea
    this.tiposTarea = resTipos.response;
  };

  //Obtener los niveles de prioridad asignables a la tarea
  async getNivelPrioridad(): Promise<void> {
    //Consumo de api
    let resPrioridades: ResApiInterface = await this._prioridad.getNivelPrioridad();
    //Si el servico se ejecuta mal mostar mensaje
    if (!resPrioridades.status) {
      this._widgetsService.openSnackbar(this._translate.instant('pos.alertas.salioMal'));
      console.error(resPrioridades.response);
      console.error(resPrioridades.storeProcedure);
      return;
    };
    //Guardar Niveles de prioridad de la tarea
    this.prioridadesTarea = resPrioridades.response;
  };

  //Obtener el Estado de la Tarea
  async getPeriodicidad(): Promise<void> {
    //Consumo de api
    let resPeriodicidad: ResApiInterface = await this._tiempoService.getTiempoPeriodicidad();
    //Si el servico se ejecuta mal mostar mensaje
    if (!resPeriodicidad.status) {
      this._widgetsService.openSnackbar(this._translate.instant('pos.alertas.salioMal'));
      console.error(resPeriodicidad.response);
      console.error(resPeriodicidad.storeProcedure);
      return;
    };
    //Guardar Estados de la tarea
    this.periodicidad = resPeriodicidad.response;
  };

  //iniciar hora actual
  hora(): void {
    // Obtener la hora actual y formatearla como deseas
    let hora = new Date();
    let minutos = hora.getMinutes();
    let horas = hora.getHours();
    let ampm = horas >= 12 ? 'pm' : 'am';

    // Formatear la hora actual como 'hh:mm am/pm'
    this.horaActual = `${horas % 12 || 12}:${minutos < 10 ? '0' : ''}${minutos} ${ampm}`;
  };

  //formatear la hora con una fecha ingresada.
  getHoraInput(horaSelected: Date): string {
    // Obtener la hora actual y formatearla como deseas
    let hora = new Date(horaSelected);
    let horas = hora.getHours();
    let minutos = hora.getMinutes();
    let ampm = horas >= 12 ? 'pm' : 'am';
    // Formatear la hora actual como 'hh:mm am/pm'
    return `${horas % 12 || 12}:${minutos < 10 ? '0' : ''}${minutos} ${ampm}`;
  };

  //convertir una fecha ngbDateStruct a fecha Date.
  convertirADate(ngbDate: NgbDateStruct): Date {
    if (ngbDate) {
      let { year, month, day } = ngbDate;
      return new Date(year, month - 1, day); // Restar 1 al mes,
    };
    return new Date();
  };

  //sumar 10 min a la hora final
  sumar10Minutos(fecha: Date): Date {
    // Suma 10 minutos a la fecha actual
    fecha.setMinutes(fecha.getMinutes() + 10);
    // Verifica si la hora es la última del día
    if (fecha.getHours() === 23) {
      // Cambia a la primera hora del día siguiente
      fecha.setHours(0);
      // Verifica si es el último día del mes
      if (fecha.getDate() === new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate()) {
        // Cambia al primer día del mes siguiente
        fecha.setDate(1);
        // Verifica si cambió al primer mes del siguiente año
        if (fecha.getMonth() === 0) {
          // Cambia al primer día del año siguiente
          fecha.setMonth(0);
          fecha.setFullYear(fecha.getFullYear() + 1);
        }
        // Si no cambió al primer mes del siguiente año, cambia al siguiente mes
        else {
          fecha.setMonth(fecha.getMonth() + 1);
        }
      }
      // Si no es el último día del mes, simplemente suma un día
      else {
        fecha.setDate(fecha.getDate() + 1);
      }
    }
    return fecha;
  };

  //Restar 10 minutos a las horas para se restablezcan
  restar10Minutos(fecha: Date): Date {
    // Resta 10 minutos a la fecha actual
    fecha.setMinutes(fecha.getMinutes() - 10);
    // Verifica si la hora es la primera del día
    if (fecha.getHours() === 0) {
      // Cambia a la última hora del día anterior
      fecha.setHours(23);
      // Verifica si es el primer día del mes
      if (fecha.getDate() === 1) {
        // Obtiene el último día del mes anterior
        fecha.setMonth(fecha.getMonth() - 1);
        fecha.setDate(new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate());
        // Verifica si cambió al último mes del año anterior
        if (fecha.getMonth() === 11) {
          // Cambia al último día del año anterior
          fecha.setMonth(11);
          fecha.setDate(31);
          fecha.setFullYear(fecha.getFullYear() - 1);
        };
      }
      // Si no es el primer día del mes, simplemente resta un día
      else {
        fecha.setDate(fecha.getDate() - 1);
      };
    };
    return fecha;
  };

  //Acoplar formato de fecha al formato de fecha de calendario
  formatearFecha(date: Date): string {
    const año = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const dia = String(date.getDate()).padStart(2, '0');
    const horas = String(date.getHours()).padStart(2, '0');
    const minutos = String(date.getMinutes()).padStart(2, '0');
    const segundos = String(date.getSeconds()).padStart(2, '0');
    //reornar fecha
    return `${año}-${mes}-${dia}T${horas}:${minutos}:${segundos}`;
  };

  //regresar a la pantalla anterior.
  backPage(): void {
    //DOS EVENTOS
    this.newItemEvent.emit(true); //Calendario
    this.desdeCalendario.emit(true);
    this.desdeTareas.emit(true);
  };

  //limpiar formulario de tareas
  limpiarCrear(): void {
    this.tituloTarea = '';

    for (let index = 0; index < this.estadosTarea.length; index++) {
      const element = this.estadosTarea[index];
      if (element.descripcion.toLowerCase() == 'activo') {
        this.estadoTarea = element;
        break;
      }
    }

    for (let index = 0; index < this.tiposTarea.length; index++) {
      const element = this.tiposTarea[index];
      if (element.descripcion.toLowerCase() == 'tarea') {
        this.tipoTarea = element;
        break;
      }
    }

    for (let index = 0; index < this.prioridadesTarea.length; index++) {
      const element = this.prioridadesTarea[index];
      if (element.nombre.toLowerCase() == 'normal') {
        this.prioridadTarea = element;
        break;
      }
    }

    for (let index = 0; index < this.periodicidad.length; index++) {
      const element = this.periodicidad[index];
      if (element.descripcion.toLowerCase() == 'minutos') {
        this.tiempoEstimado = element;
        break;
      }
    }

    this.duracion = 10;
    this.descripcion = '';
    this.selectedFiles = [];
    this.idReferencia = null;
    this.usuariosInvitados = [];
    this.usuariosResponsables = [];

  };

  //revisar que todos los campos esten completos y guardar la tarea
  validarDatosTarea(): void {
    //sino se selecciona una fecha u hora en los inputs, se asignará la que se está visualizando 
    this.tareasGlobalService.fechaIni = this.convertValidDate(this.tareasGlobalService.inputFechaInicial!, this.tareasGlobalService.horaInicial);
    this.tareasGlobalService.fechaFin = this.convertValidDate(this.tareasGlobalService.inputFechaFinal!, this.tareasGlobalService.horaFinal);

    //return
    if (this.tituloTarea.length === 0 || this.tipoTarea === null || this.estadoTarea === null || this.prioridadTarea === null || this.idReferencia === null || this.descripcion.length === 0 || this.usuariosResponsables.length == 0) {
      this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.completarCamposTarea'));

    } else {
      //si esta correcto procedde a guardar la informacion de las tareas
      this.guardar();
    };
  };


  horaaaas() {
    //encontrar informacion de la hora
    let horaSplit = this.horaActual.split(' ');
    let horaStr = horaSplit[0];
    let horaNum = horaStr.split(':');
    let hora: number = +horaNum[0];

    //si la hora es pm, sumarle 12 a la hora para que sea formato de 24 horas
    if (horaSplit[1].toLocaleLowerCase() == 'p. m.' || horaSplit[1].toLocaleLowerCase() == 'pm') {
      hora = hora + 12
    };

    let min: number = +horaNum[1];

    //fecha inicial con hora
    let nuevaFecha: Date = new Date();
    nuevaFecha.setDate(this.nuevaFechaInicial.day);
    nuevaFecha.setMonth(this.nuevaFechaInicial.month - 1);
    nuevaFecha.setFullYear(this.nuevaFechaInicial.year);
    nuevaFecha.setHours(hora);
    nuevaFecha.setMinutes(min);

    //crear hora final
    let horaFinalSplit = this.horaFinal.split(' ');
    let horaFinalStr = horaFinalSplit[0];
    let horaFinalNum = horaFinalStr.split(':');
    let horaFinal: number = +horaFinalNum[0];

    //si la hora es pm, sumarle 12 a la hora para que sea formato de 24 horas
    if (horaFinalSplit[1].toLocaleLowerCase() == 'p. m.' || horaFinalSplit[1].toLocaleLowerCase() == 'pm') {
      horaFinal = horaFinal + 12
    };

    let minFin: number = +horaFinalNum[1];

    //crear nueva hora final con hora.
    let nuevaFechaFinal: Date = new Date();
    nuevaFechaFinal.setDate(this.nuevaFechaFinal.day);
    nuevaFechaFinal.setMonth(this.nuevaFechaFinal.month - 1);
    nuevaFechaFinal.setFullYear(this.nuevaFechaFinal.year);
    nuevaFechaFinal.setHours(horaFinal);
    nuevaFechaFinal.setMinutes(minFin);
  }

  //regresar a la pantalla anterior.
  async guardar(): Promise<void> {
    let fechaIni: Date = this.tareasGlobalService.fechaIni!;
    let fechaFin: Date = this.tareasGlobalService.fechaFin!;

    let diferenciaHoraria: number = fechaIni.getTimezoneOffset() / 60;

    if (diferenciaHoraria > 0) {
      //es positivo
      fechaIni.setHours(this.tareasGlobalService.fechaIni!.getHours() - diferenciaHoraria);
      fechaFin.setHours(this.tareasGlobalService.fechaFin!.getHours() - diferenciaHoraria);
    } else {
      fechaIni.setHours(this.tareasGlobalService.fechaIni!.getHours() + diferenciaHoraria)
      fechaFin.setHours(this.tareasGlobalService.fechaFin!.getHours() + diferenciaHoraria)
    }

    //NUEVA TAREA PRUEBA
    let tareaPrueba: CrearTareaInterface = {
      tarea: 0,
      descripcion: this.tituloTarea,
      fecha_Ini: fechaIni,
      fecha_Fin: fechaFin,
      referencia: this.idReferencia!.referencia,
      userName: this.usuarioTarea,
      observacion_1: this.descripcion,
      tipo_Tarea: this.tipoTarea!.tipo_Tarea,
      estado: this.estadoTarea!.estado,
      empresa: 1,
      nivel_Prioridad: this.prioridadTarea!.nivel_Prioridad,
      tiempo_Estimado_Tipo_Periocidad: this.tiempoEstimado!.tipo_Periodicidad,
      tiempo_Estimado: this.duracion,
    };


    // console.log(tareaPrueba);

    //mostrar pantalla de carga
    this.isLoading = true;

    //Consumo de apis
    let resNuevaTarea: ResApiInterface = await this._nuevaTarea.postNuevaTarea(tareaPrueba);
    //pantalla de carga oculta
    //Si el servico se ejecuta mal mostar mensaje
    if (!resNuevaTarea.status) {
      this.isLoading = false;
      this._widgetsService.openSnackbar(this._translate.instant('pos.alertas.salioMal'));
      console.error(resNuevaTarea.response);
      console.error(resNuevaTarea.storeProcedure);
      return;
    };

    //Guardar Tarea
    let nuevasTareas: CrearTareaInterface[] = resNuevaTarea.response;

    // //P R I M E R - C O M E N T A R I O 
    //consumir api solo si hay archivos
    if (this.selectedFiles.length > 0) {

      //crear el objeto del comentario
      let comentario: ComentarInterface = {
        tarea: nuevasTareas[0].tarea,
        userName: this.usuarioTarea,
        comentario: this.descripcion,
      }

      let resPrimerComentario: ResApiInterface = await this._nuevoComentario.postNuevoComentario(comentario);

      //Si el servico se ejecuta mal mostar mensaje
      if (!resPrimerComentario.status) {
        //ocultar carga
        this.isLoading = false;
        this._widgetsService.openSnackbar(this._translate.instant('pos.alertas.salioMal'));
        console.error(resPrimerComentario.response);
        console.error(resPrimerComentario.storeProcedure);
        return
      }

      //asignar la respuesra del comentario a la interface. 
      //ID del comentario 
      let idComenario: number = resPrimerComentario.response.res;

      let resFiles: ResApiInterface = await this._files.postFilesComment(this.selectedFiles, nuevasTareas[0].tarea, idComenario);

      //Si el servico se ejecuta mal mostar mensaje
      this.isLoading = false;
      if (!resFiles.status) {
        this.isLoading = false;
        this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.archivosNoCargados'));
        console.error(resFiles.response);
        console.error(resFiles.storeProcedure);
        return;
      };
    };

    // // F I N - C O M E N T A R I O

    if (this.tareasGlobalService.idPantalla === 1) {
      //Nueva Tarea Tareas
      let tareaCreada: TareaInterface =
      {
        tarea: null,
        iD_Tarea: nuevasTareas[0].tarea,
        usuario_Creador: this.usuarioTarea,
        usuario_Responsable: null,
        descripcion: this.tituloTarea,
        fecha_Inicial: this.tareasGlobalService.fechaIni!,
        fecha_Final: this.tareasGlobalService.fechaFin!,
        referencia: this.idReferencia!.referencia,
        iD_Referencia: this.idReferencia!.referencia_Id,
        descripcion_Referencia: this.idReferencia!.descripcion,
        ultimo_Comentario: '',
        fecha_Ultimo_Comentario: null,
        usuario_Ultimo_Comentario: null,
        tarea_Observacion_1: this.descripcion,
        tarea_Fecha_Ini: this.tareasGlobalService.fechaIni!,
        tarea_Fecha_Fin: this.tareasGlobalService.fechaFin!,
        tipo_Tarea: this.tipoTarea!.tipo_Tarea,
        descripcion_Tipo_Tarea: this.tipoTarea!.descripcion,
        estado_Objeto: this.estadoTarea!.estado,
        tarea_Estado: this.estadoTarea!.descripcion,
        usuario_Tarea: this.usuarioTarea,
        email_Creador: '',
        backColor: "#000",
        nivel_Prioridad: this.prioridadTarea!.nivel_Prioridad,
        nom_Nivel_Prioridad: this.prioridadTarea!.nombre,
      };

      //agregar tareas en tareas
      this.agregarNuevaTarea(tareaCreada);
    };

    if (this.tareasGlobalService.idPantalla === 2) {
      // //fechas formateadas adaptadas al tipo de fecha de calendario
      // let fechaInicialFormato: string = this.formatearFecha(nuevaFecha);
      // let fechaFinalFormato: string = this.formatearFecha(nuevaFechaFinal);

      //Nueva Tarea Calendario
      let tareaCalendario: TareaCalendarioInterface = {
        r_UserName: this.usuarioTarea,
        tarea: nuevasTareas[0].tarea,
        descripcion: this.tituloTarea,
        fecha_Ini: fechaIni,
        fecha_Fin: fechaFin,
        referencia: 0,
        userName: this.usuarioTarea,
        observacion_1: this.descripcion,
        nom_User: this.usuarioTarea,
        nom_Cuenta_Correntista: null,
        des_Tipo_Tarea: this.tipoTarea!.descripcion,
        cuenta_Correntista: 1,
        cuenta_Cta: 2,
        contacto_1: 3,
        direccion_Empresa: 3,
        weekNumber: this.getWeekNumber(fechaIni),
        cantidad_Contacto: 0,
        nombre_Contacto: '',
        descripcion_Tarea: this.tituloTarea,
        texto: this.descripcion,
        backColor: "#000",
        estado: this.estadoTarea!.estado,
        des_Tarea: this.estadoTarea!.descripcion,
        usuario_Responsable: null,
        nivel_Prioridad: this.prioridadTarea!.nivel_Prioridad,
        nom_Nivel_Prioridad: this.prioridadTarea!.nombre,
      };
      //agregar tareas en calendario
      this.agregarTareaCalendario(tareaCalendario);
    };

    //consumir api solo si hay usuario responsable seleccionado
    // if (this.usuariosResponsables.length > 0) {

    let usuarioResponsable: EnviarResponsableInterface = {
      tarea: nuevasTareas[0].tarea,
      user_Res_Invi: this.usuariosResponsables[0].userName,
      user: this.usuarioTarea,
    }
    //consumo de api usuario respnsable
    let resResponsable: ResApiInterface = await this._usuarioService.postUsuarioResponsable(usuarioResponsable);

    if (!resResponsable.status) {
      this.isLoading = false;
      this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.responsableNoAsignado'));
      console.error(resResponsable.response);
      console.error(resResponsable.storeProcedure);
      return;
    };
    // };

    if (this.usuariosInvitados.length > 0) {
      // Suponiendo que this.usuariosInvitados es un array de objetos con propiedades userName
      for (const usuarioInvitado of this.usuariosInvitados) {
        // Crear el objeto para enviar el usuario invitado
        let invitado: EnviarInvitadoInterface = {
          tarea: nuevasTareas[0].tarea,
          user_Res_Invi: usuarioInvitado.userName,
          user: this.usuarioTarea,
        };

        // Realizar la llamada a la API
        let resInvitado: ResApiInterface = await this._usuarioService.postUsuarioInvitado(invitado);

        // Verificar si la llamada fue exitosa
        if (!resInvitado.status) {
          this.isLoading = false;
          this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.invitadosNoGuardados'));
          console.error(resInvitado.response);
          console.error(resInvitado.storeProcedure);
          return;
        }

        // Agregar el resultado a la lista this.invitadosTarea
        this.invitadosTarea.push(resInvitado.response);
      };
    };

    this.isLoading = false;

    this._widgetsService.openSnackbar(`${this._translate.instant('crm.alertas.tareaCreadaExito')}${nuevasTareas[0].tarea}`);

    //REESTABLECER LAS FECHAS Y HORAS DE LAS TAREAS
    if (this.tareasGlobalService.idPantalla == 1) {
      this.fechaActual();
    } else {
      this.fechaCalendario();
    }
  };

  //archivos seleccionados
  onFilesSelected(event: any) {
    this.selectedFiles = event.target.files;
  };

  //eliminar los archivos que se han seleccionados
  eliminarArchivo(index: number): void {
    this.selectedFiles.splice(index, 1);
  };

  //elimina usuarios responsables seleccionados
  eliminarResponsable(index: number): void {
    this.usuariosResponsables.splice(index, 1);
  };

  //elimina usuarios invitados seleccionados
  eliminarInvitado(index: number): void {
    this.usuariosInvitados.splice(index, 1);
  };

  //abrir dialgo y selecionar responsables
  agregarResponsable(): void {
    let usuario = this._dialog.open(UsuariosDialogComponent, { data: this.seleccionarResponsable })
    usuario.afterClosed().subscribe(result => {
      if (result) {
        this.usuariosResponsables = result;
      };
    });
  };

  //abrir dialgo y selecionar invitados
  agregarInvitado(): void {
    let usuario = this._dialog.open(UsuariosDialogComponent, { data: this.seleccionarInvitados })
    usuario.afterClosed().subscribe(result => {
      if (result) {
        this.usuariosInvitados = result;
      };
    });
  };

  //abrir dialogo y seleecionar referencia
  buscarReferencia(): void {
    let referencia = this._dialog.open(BuscarIdReferenciaComponent)
    referencia.afterClosed().subscribe(result => {
      if (result) {

        this.idReferencia = result[0];
      };
    });
  };

  //obtener el numero de semana que ocupa la fecha en que se crea la tarea
  getWeekNumber(date: Date): number {
    let d = new Date(date);
    let startOfYear = new Date(d.getFullYear(), 0, 1);
    // Convertir las fechas a milisegundos antes de la resta
    let millisecondsInDay = 86400000;
    let timeDifference = d.getTime() - startOfYear.getTime();
    // Realizar la operación aritmética
    let weekNumber = Math.ceil((timeDifference / millisecondsInDay + 1) / 7);
    return weekNumber;
  };

  //si existe algun cambio en la fecha inicial, se acualice la fecha final
  sincronizarFechas(): void {
    //obtener la infromacion de la hora
    let horaSplit = this.horaActual.split(' ');
    let horaStr = horaSplit[0];
    let horaNum = horaStr.split(':');
    let hora: number = +horaNum[0];

    //si la hora es pm, sumarle 12 a la hora para que sea formato de 24 horas
    if (horaSplit[1].toLocaleLowerCase() == 'p. m.' || horaSplit[1].toLocaleLowerCase() == 'pm') {
      hora = hora + 12;
    };
    let min: number = +horaNum[1];

    //fecha inicial con hora
    let nuevaFecha: Date = new Date();
    nuevaFecha.setDate(this.nuevaFechaInicial.day);
    nuevaFecha.setMonth(this.nuevaFechaInicial.month - 1);
    nuevaFecha.setFullYear(this.nuevaFechaInicial.year);
    nuevaFecha.setHours(hora);
    nuevaFecha.setMinutes(min);

    //asinar hora obtenida a hora actual
    this.horaActual = this.getHoraInput(nuevaFecha);

    //sumar 10 minutos a la hora fecha inicial
    let fechaHoraFinal: Date = this.sumar10Minutos(nuevaFecha);

    //crear fecha final
    this.nuevaFechaFinal = {
      day: fechaHoraFinal.getDate(),
      month: fechaHoraFinal.getMonth() + 1,
      year: fechaHoraFinal.getFullYear()
    };
    //asignar la hora final obtenida
    this.horaFinal = this.getHoraInput(fechaHoraFinal);
  };

  validarNumeros(event: any) {
    // Obtener el código de la tecla presionada
    let codigoTecla = event.which ? event.which : event.keyCode;

    // Permitir solo números (códigos de tecla entre 48 y 57 son números en el teclado)
    if (codigoTecla < 48 || codigoTecla > 57) {
      event.preventDefault();
    }
  }
}
