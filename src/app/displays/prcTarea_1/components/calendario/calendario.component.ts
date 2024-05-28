// importacion de la libreria moment
import *as moment from 'moment'

import { Component, EventEmitter, Inject, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { NotificationsService } from 'src/app/services/notifications.service';
import { TareaCalendarioService } from '../../services/calendario.service';
import { MatCalendar } from '@angular/material/datepicker';
import { MatSidenav } from '@angular/material/sidenav';
import { HoraInterface } from '../../interfaces/hora.interface';
import { TareaCalendarioInterface } from '../../interfaces/tarea-calendario.interface';
import { horas, indexHoraFinDefault, indexHoraInicioDefault } from 'src/app/providers/horas.provider';
import { DayInterface } from '../../interfaces/dia.interface';
import { LanguageInterface } from 'src/app/interfaces/language.interface';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { EventService } from 'src/app/services/event.service';
import { GlobalTareasService } from 'src/app/services/tarea-global.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { indexDefaultLang, languagesProvider } from 'src/app/providers/languages.provider';
import { TranslateService } from '@ngx-translate/core';
import { diasEspaniol, diasFrances, diasIngles } from 'src/app/providers/dias.provider';
import { ComentariosDetalle, DetalleInterfaceCalendario } from '../../interfaces/detalle.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { TareaService } from 'src/app/displays/shrTarea_3/services/tarea.service';
import { ComentarioInterface } from 'src/app/interfaces/comentario.interface';
import { DialogTareaComponent } from '../dialog-tarea/dialog-tarea.component';
import { CrearTareaComponent } from 'src/app/components/crear-tarea/crear-tarea.component';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.scss'],
  providers: [
    NotificationsService,
    TareaCalendarioService,
    TareaService
  ]
})
export class CalendarioComponent implements OnInit {

  //Sicronizacion de todos los datePicker del componente
  @ViewChildren(MatCalendar)
  calendars?: QueryList<MatCalendar<Date>>;

  //Evento para regresar a la pantalla anterior
  @Output() newItemEvent = new EventEmitter<boolean>();

  //Abrir/Cerrar SideNav
  @ViewChild('sidenav')
  sidenav!: MatSidenav;
  @ViewChild('sidenavend')
  sidenavend!: MatSidenav;

  //Vistas usuario
  verMes: boolean = true; //Vista Mes
  verSemana: boolean = false; //Vista Semana
  verDia: boolean = false; // Vista Dia
  //cargar todo dentro de calendario
  cargarCalendario: boolean = true;

  horas: HoraInterface[] = horas; //horas del día (vista del usuario)
  horarios: HoraInterface[] = horas; //lista de horas 12h
  inicioLabores!: number;
  finLabores!: number;
  horaInicio: HoraInterface = horas[indexHoraInicioDefault];
  horaFin: HoraInterface = horas[indexHoraFinDefault];
  picker: boolean = true;
  dias: boolean = false;
  inicio: boolean = false;
  fin: boolean = false;
  ajustes: boolean = false;
  tituloAjustes: boolean = true;

  tareas: TareaCalendarioInterface[] = []; //Todas las tareas disponibles
  tareasUsuario: TareaCalendarioInterface[] = []; //Todas las tareas disponibles

  monthSelect: DayInterface[] = []; //dias del mes seleccionado

  //Traducir nomre de los dias en el idioma selecionado
  activeLang: LanguageInterface;
  diasView: string[] = [];
  vistaActiva: string = ''; //traducir
  diasSemana: string[] = []; //Nombres de los dias de la semana

  //date picker
  datePicker!: Date;
  //TODO: configurarlo en html
  primerDiaSemana: number = 0; // 0 = domingo, 1 = lunes, ..., 6 = sábado

  //fecha de hoy (fecha de la maquina)
  fechaHoy = new Date(Date.now()) //fecha completa DateNow
  today: number = 0; //fecha dia
  month: number = 0; //fecha mesooo
  year: number = 0; //fecha año
  horaActual: number = 0; //fecha año
  minuto: number = 0; //fecha año


  //fecha vista usuario
  monthSelectView: number = 0; //mes
  yearSelect: number = 0; //año
  daySelect: number = 0; //dia

  //semena seleccionada
  indexWeekActive: number = 0;
  //semanas del mes actual
  semanas: DayInterface[][] = [];

  //Seleccionar una vista de calendario
  // verVistas: boolean = false;
  //Cargar Datos
  isLoading: boolean = false;
  estadoUrgente = '#FF1F04';  //color de la tarea //color de la tarea
  crearTarea: boolean = false;
  mostrarCalendario: boolean = true;

  //enviar fecha
  // fechaTarea!: Date;
  idPantalla: number = 2;
  diaTareaSeleccionado!: Date;

  constructor(
    //Declaracion de variables privadas
    private _tareaService: TareaCalendarioService,
    private _comentarioService: TareaService,
    private _widgetsService: NotificationsService,
    private _adapter: DateAdapter<any>, date: DateAdapter<Date>,
    @Inject(MAT_DATE_LOCALE) private _locale: string,
    private _dialog: MatDialog,
    private _eventService: EventService,
    public tareasGlobalService: GlobalTareasService,
    private _translate: TranslateService,
  ) {

    // this.nuevaTarea()

    //obtener feccha de hoy y asignar 
    this.today = this.fechaHoy.getDate(); //fecha del dia
    this.month = this.fechaHoy.getMonth() + 1; //mes
    this.year = this.fechaHoy.getFullYear(); //año 
    this.horaActual = this.fechaHoy.getHours(); //hora
    this.minuto = this.fechaHoy.getMinutes(); // minuto

    //Buscar y obtener el leguaje guardado en el servicio  
    let getLanguage = PreferencesService.lang;
    if (!getLanguage) {
      //asignar el idioma por defecto
      this.activeLang = languagesProvider[indexDefaultLang];
    } else {
      //asignar el idioma que esta guardado
      let getIndexLang: number = +getLanguage;
      this.activeLang = languagesProvider[getIndexLang];
    }

    //buscamos si hay un dia guardado para el inicio de la semana
    let getDias = PreferencesService.inicioSemana;
    if (getDias) {
      let dia: number = +getDias;
      this.primerDiaSemana = dia;
    }

    //Cargar datos
    this.loadData();

    //Cambiar dia incio de la semana (domingo:0, lunes:1...sabado:6)
    date.getFirstDayOfWeek = () => this.primerDiaSemana;


    //traducir frase del ToolTip de regresar 

    //Mostrar la vista del Calendatio Seleccionada Activa
    if (this.verMes) { this.vistaActiva = this._translate.instant('crm.alertas.nombreMes'); }

    //obtener todas las tareas
    // this.getTareaCalendario();
    this.getTareasCalendario(this.monthSelectView, this.yearSelect);
    //obtener el idioma de los Date Pickers 
    this.setLangPicker();
    //Cargar arreglo de dias en el idioma seleccionado
    this.loadDiasView();
  }


  ngOnInit() {
    this.loadData();

    this.refresh();
  }

  async refresh() {
    this.isLoading = true;
    this.crearTarea = false; //ocultar formulario de crear tareas
    //obtener feccha de hoy y asignar 
    await this.loadData();
    //obtener todas las tareas
    await this.getTareasCalendario(this.monthSelectView, this.yearSelect);
    this.obtenerHorarioLaboral();
    this.isLoading = false;
  }

  //Cargar dias en el idioma seleccionado
  loadDiasView(): void {
    let lrCode: string = `${this.activeLang.lang}-${this.activeLang.reg}`;
    //Dias Español
    if (lrCode == 'es-GT') this.diasView = this.crearArregloDiasLang(diasEspaniol);
    //Dias Ingles
    if (lrCode == 'en-US') this.diasView = this.crearArregloDiasLang(diasIngles);
    //Dias Frances
    if (lrCode == 'fr-FR') this.diasView = this.crearArregloDiasLang(diasFrances);

  }

  //cargar datos
  async loadData(): Promise<void> {
    // this.isLoading = true

    this.loadDiasView(); //Cargar Datos

    //Ordenar dia semmana por el primer dia asigando  0 = domingo, 1 = lunes, ..., 6 = sábado
    this.diasSemana = this.crearArregloDias();
    //obtener mes actual
    this.monthSelect = this.obtenerDiasMes(this.year, this.month, this.primerDiaSemana);
    //asiganr semanas del mes
    this.semanas = this.addWeeks(this.monthSelect);
    //fecha de hoy
    this.monthSelectView = this.month; //mes
    this.yearSelect = this.year; //año
    this.daySelect = this.today; //hoy

    //asiganr fecha de hoy al picker
    let nuevaFecha: Date = new Date();
    nuevaFecha.setFullYear(this.yearSelect, this.monthSelectView - 1, this.daySelect);
    this.datePicker = nuevaFecha;

    //marcar fecha de hoy en el picker
    let nextMonthPicker: Date = new Date(this.yearSelect, this.monthSelectView - 1, this.daySelect);
    this.calendars?.forEach(calendar => {
      calendar.activeDate = nextMonthPicker;
      calendar.selected = nextMonthPicker;
    });

    //Dejar de cargar
    this.isLoading = false;
  }

  //sincronzar los mat-calendar al seleccionar una fecha,
  //cambiar ambos y se muestra la fecha seleccionada en el mismo mes y año 
  syncCalendars(selectedDate: Date): void {
    let selectedMonth: number = selectedDate.getMonth();
    let selectedYear: number = selectedDate.getFullYear();

    // Obtén el día seleccionado del otro mat-calendar (si no hay día seleccionado, se establecerá como 1)
    let selectedDay: number = this.datePicker ? this.datePicker.getDate() : 1;

    // Crea una nueva fecha con el mes y año seleccionados en ambos mat-calendar
    this.datePicker = new Date(selectedYear, selectedMonth, selectedDay);

    //asignarle nueva fecha con mes y año seleccionado en los mat-calendar
    let nuevaFechaPickers: Date = this.datePicker
    //asignar la nueva fecha a todos los mat-calendars
    this.calendars?.forEach(calendar => {
      selectedDate
      calendar.activeDate = nuevaFechaPickers;
      calendar.selected = nuevaFechaPickers;
    });
  }

  //Abrir cerrar Sidenav
  close(reason: string): void {
    this.sidenav.close();
    this.sidenavend.close();
  }

  //regresar a la pantalla anterior
  backPage(): void {
    this.tareasGlobalService.vistaDia = false;
    this._eventService.emitCustomEvent(false)
  }

  //traducir idioma de DATEPIKER al idioma seleccionado
  setLangPicker(): void {
    this._locale = `${this.activeLang.lang}-${this.activeLang.reg}`;
    this._adapter.setLocale(this._locale);
  }

  //String a number
  monthToNum(month: any): number {
    //str date to num
    let monthNum: number = +month;
    return monthNum;
  }

  //Mostrar detalle tarea en lugar del dialog
  tarea!: DetalleInterfaceCalendario;

  //dialogo detalle tarea
  async openDialogTask(task: TareaCalendarioInterface): Promise<void> {
    this.crearTarea = false;
    let tareaDetalle: DetalleInterfaceCalendario = {
      tarea: task,
      comentarios: []
    }
    this.tarea = tareaDetalle;

    this.isLoading = true;
    //Consumo de api
    let resVerTarea: ResApiInterface = await this._comentarioService.getComentarios(task.tarea)

    //Si el servico se ejecuta mal mostrar menaje
    if (!resVerTarea.status) {
      this.isLoading = false;
      this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.salioMal'));
      console.error(resVerTarea.response);
      console.error(resVerTarea.storeProcedure);
      return
    }

    //Si se ejecuto bien, obtener la respuesta de apiComentarios
    let comentarios: ComentarioInterface[] = resVerTarea.response

    for (const comentario of comentarios) {
      let resFiles: ResApiInterface = await this._comentarioService.getComentariosObjeto(comentario.tarea_Comentario, comentario.tarea)
      //Si el servico se ejecuta mal mostrar menaje
      if (!resFiles.status) {
        this.isLoading = false;
        this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.salioMal'));
        console.error(resFiles.response);
        console.error(resFiles.storeProcedure);
        return
      }

      let itemComentario: ComentariosDetalle = {
        comentario: comentario,
        files: resFiles.response
      }

      //Si se ejecuto bien, obtener la respuesta de Api Buscar Tareas
      this.tarea.comentarios.push(itemComentario);

    }
    this.isLoading = false;

    //abre el dialogo
    this._dialog.open(DialogTareaComponent, {
      data: tareaDetalle, //tarea como parametro
    });

  }

  abrirCrearTarea() {
    this._dialog.open(CrearTareaComponent);
  }

  //Obtner dias de un mes especifico  (cualquier mes)
  obtenerDiasMes(anio: number, mes: number, primerDiaSemana: number): DayInterface[] {
    //almacenar dias del mes
    let diasMes: DayInterface[] = [];
    // Obtenemos el primer día del mes
    let primerDia: Date = new Date(anio, mes - 1, 1);
    // Obtenemos el último día del mes sumando 1 al mes siguiente y restando 1 día
    let ultimoDia: Date = new Date(anio, mes, 0);
    // Determinamos el desplazamiento necesario para el primer día de la semana
    let desplazamiento: number = (primerDia.getDay() + 7 - primerDiaSemana) % 7;
    // Recorremos los días del mes, teniendo en cuenta el desplazamiento
    for (let dia: number = 1 - desplazamiento; dia <= ultimoDia.getDate(); dia++) {
      let fecha: Date = new Date(anio, mes - 1, dia);
      let diaSemana: number = (fecha.getDay() + 7) % 7; // Aseguramos que el resultado esté entre 0 y 6
      // Creamos un objeto con la información del día
      let diaObjeto: DayInterface = {
        name: diasEspaniol[diaSemana],
        value: fecha.getDate(),
        indexWeek: diaSemana + 1
      };
      //insertar nuevo arreglo de dias 
      diasMes.push(diaObjeto);
    }

    //ultimo dia del mes (fecha)
    let ultimaCoincidencia: number = -1;
    //buscar el ultimo dia del mes
    for (let index: number = 0; index < diasMes.length; index++) {
      let element: DayInterface = diasMes[index];
      if (element.value == ultimoDia.getDate()) {
        ultimaCoincidencia = index;
      }
    }
    //buscar que dia de la semana es
    let ultimoIndice: number = this.diasSemana.lastIndexOf(diasMes[ultimaCoincidencia].name);
    //cuantos dias me faltan
    let diasRestantes: number = (this.diasSemana.length - 1) - ultimoIndice;

    //buscar los dias que faltan (cantidad)
    diasMes.push(...this.obtenerDiasMesCantidad(mes + 1 == 12 ? 1 : mes + 1, mes + 1 == 12 ? anio + 1 : anio, diasRestantes))

    //enumerar mes indexWeek
    for (let index: number = 0; index < diasMes.length; index++) {
      diasMes[index].indexWeek = index;
    }
    //retornar dias del mes buscado con los dias del mes anterior y siguiente 
    //(completando todas las semanas)
    return diasMes;
  }

  //Obtner una cantidad de dias del mes 
  //Ej: si busco 10 dias obtengo los primeros 10 dias del mes
  obtenerDiasMesCantidad(mes: number, año: number, cantidad: number): DayInterface[] {
    // El mes en JavaScript comienza desde 0, por lo que se resta 1 al mes ingresado
    let fecha: Date = new Date(año, mes - 1, 1);
    //dias encontrados
    let diasMes: DayInterface[] = [];

    //bucar cantidad de dias deseados en el mes
    for (let i: number = 0; i < cantidad; i++) {
      let diaSemana: number = (fecha.getDay() + 7) % 7; // Aseguramos que el resultado esté entre 0 y 6
      //objeto dias
      let diaObjeto: DayInterface = {
        name: diasEspaniol[diaSemana],
        value: fecha.getDate(),
        indexWeek: diaSemana + 1
      };
      diasMes.push(diaObjeto);
      fecha.setDate(fecha.getDate() + 1);
    }
    //retornar dias requeridos
    return diasMes;
  }

  //Ordenear dias segun el dia maracdo como primero
  //La semana original empieza en domingo
  //si se quiere que empiece por ejemplo en lunes esta funcion reordena la semana original 
  crearArregloDias(): string[] {
    let arregloDias: string[] = [];

    // Encontramos el índice del día inicial en el arreglo díasSemana
    let indiceDiaInicial: number = this.primerDiaSemana % 7;
    // Agregamos los días de la semana en el orden configurado
    for (let i: number = 0; i < 7; i++) {
      let indiceDia: number = (indiceDiaInicial + i) % 7;
      arregloDias.push(diasEspaniol[indiceDia]);
    }
    //retorna nieva semana ordenada
    return arregloDias;
  }

  //Crear arreglo de dias
  crearArregloDiasLang(diasLang: string[]): string[] {
    let arregloDias: string[] = [];
    // Encontramos el índice del día inicial en el arreglo díasSemana
    let indiceDiaInicial: number = this.primerDiaSemana % 7;
    // Agregamos los días de la semana en el orden configurado
    for (let i: number = 0; i < 7; i++) {
      let indiceDia: number = (indiceDiaInicial + i) % 7;
      arregloDias.push(diasLang[indiceDia]);
    }
    //retorna nieva semana ordenada
    return arregloDias;
  }

  //Cambiar mes anterior
  async backMonth(): Promise<void> {
    //cambiar año y mes si es necesario
    this.yearSelect = this.monthSelectView == 1 ? this.yearSelect - 1 : this.yearSelect; //año
    this.monthSelectView = this.monthSelectView == 1 ? 12 : this.monthSelectView - 1; //mes
    //obtener dias del mes
    this.monthSelect = this.obtenerDiasMes(this.yearSelect, this.monthSelectView, this.primerDiaSemana);
    //asignar semana
    this.semanas = this.addWeeks(this.monthSelect);
    //Seleccionar mes en el picker
    let previousMonth: Date = new Date(this.yearSelect, this.monthSelectView - 1, 1);
    this.calendars?.forEach(calendar => {
      // Asignar fecha seleccionada
      calendar.activeDate = previousMonth;
      calendar.selected = previousMonth;
    });
    //agregar que la fgecha del picker sea 1
    // await this.getTareasCalendario(this.monthSelectView, this.yearSelect);
    this.datePicker.setDate(1);
  }

  //Cambiar al mes siguiente
  async nextMonth(): Promise<void> {
    //cambiar año y mes si es necesario
    this.yearSelect = this.monthSelectView == 12 ? this.yearSelect + 1 : this.yearSelect; //año
    this.monthSelectView = this.monthSelectView == 12 ? 1 : this.monthSelectView + 1; //mes
    //obtener dias del mes
    this.monthSelect = this.obtenerDiasMes(this.yearSelect, this.monthSelectView, this.primerDiaSemana);
    //asignar semana
    this.semanas = this.addWeeks(this.monthSelect);
    //cambie el mat-calendar
    let nextMonth: Date = new Date(this.yearSelect, this.monthSelectView - 1, 1);
    this.calendars?.forEach(calendar => {
      // Asignar fecha seleccionada
      calendar.activeDate = nextMonth;
      calendar.selected = nextMonth;
    });

    //agregar que la fgecha del picker sea 1
    // await this.getTareasCalendario(this.monthSelectView, this.yearSelect);
    this.datePicker.setDate(1);
  }

  indexWeekDiaHoy: number = 0;

  //Dividir el mes por semanas (en semanas de 0..6)
  addWeeks(diasDelMes: DayInterface[]): DayInterface[][] {
    //lista con sublistas de semanas
    let semanas: DayInterface[][] = [];

    for (let i: number = 0; i < diasDelMes.length; i += 7) {
      let sublista = diasDelMes.slice(i, i + 7);
      semanas.push(sublista);
    }

    for (let i: number = 0; i < semanas.length; i++) {
      for (let j: number = 0; j < semanas[i].length; j++) {
        semanas[i][j].indexWeek = j;
      }
    }

    for (let i: number = 0; i < semanas.length; i++) {
      for (let j: number = 0; j < semanas[i].length; j++) {
        if (semanas[i][j].value === this.today) {
          this.indexWeekDiaHoy = i;
          break; // Terminamos la función una vez encontrado el índice
        }
      }
    }
    return semanas;
  }

  //Cambiar a la semana anterior
  backWeek(): void {
    //dia que se debe marcar
    let indexDaySelected: number = -1;

    //buscar el dia que vamos a marcar 
    if (!this.datePicker) {
      //Si no hay fecha seleccionada usamos la de hoy (let: today)
      //buscar dia en la semana
      for (let i: number = 0; i < this.semanas[this.indexWeekActive].length; i++) {
        if (this.semanas[this.indexWeekActive][i].value == this.today) {
          indexDaySelected = i; //guardar indice del dia
        }
      }
    } else {
      //si hay fecha selccionada
      //fecha seleccionada
      let date: Date = new Date(this.datePicker);
      //buscar dia en la semana
      for (let i: number = 0; i < this.semanas[this.indexWeekActive].length; i++) {
        if (this.semanas[this.indexWeekActive][i].value == date.getDate()) {
          indexDaySelected = i; //guardar indice del dia
        }
      }
    }

    //si estamos en la primer semana cambiar de mes
    if (this.indexWeekActive == 0) {
      //buscamos el indice de la fecha mas baja (inicio de mes (1)) en la semana (0,1,2...6 (semana))
      let fechaMenorSemanaAnteriror: number = this.obtenerIndiceNumeroMenor(this.semanas[0]);
      //cambiar al mes siguiente 
      if (this.monthSelectView == 1) {
        this.yearSelect--;
        this.monthSelectView = 12;
      } else {
        this.monthSelectView--;
      }
      //obtener dias del mes anterior
      this.monthSelect = this.obtenerDiasMes(this.yearSelect, this.monthSelectView, this.primerDiaSemana);
      //asiganr semanas del mes siguiente 
      this.semanas = this.addWeeks(this.monthSelect);
      //Si la semna empieza en 0 esta completa (lunes:1, indice 0)
      if (fechaMenorSemanaAnteriror > 0) {
        //si la semana no esta completa 
        //para no mostrar la misma semana marcar la penultima semana (segunda desde atras)
        this.indexWeekActive = this.semanas.length - 2;
      } else {
        //si la semna esta completa maracar ultima semana del mes anteririro (primera desder atras)
        // maracar ultima semana
        //Seleccionar fecha de la semana siguiente
        this.indexWeekActive = this.semanas.length - 1;
      }
      //maracar (este guaradada para ir al dia) nueva fecha 
      this.daySelect = this.semanas[this.indexWeekActive][indexDaySelected].value;
    } else {
      //Si no estamos en la primer semana
      //buscar si el dia a marcar en la semana anterior esta en el mismo mes
      let fechaMenorSemanaAnteriror: number = this.obtenerIndiceNumeroMenor(this.semanas[this.indexWeekActive - 1]);
      //si el  dia que hay que marcar esta dentro de la semana 
      if (indexDaySelected >= fechaMenorSemanaAnteriror) {
        //etsamos en el mismo mes
        this.indexWeekActive--;
        this.daySelect = this.semanas[this.indexWeekActive][indexDaySelected].value;
      } else {
        //cambiar al mes anteriror 
        if (this.monthSelectView == 1) {
          this.yearSelect--;
          this.monthSelectView = 12;
        } else {
          this.monthSelectView--;
        }

        //obtener dias del mes anterior
        this.monthSelect = this.obtenerDiasMes(this.yearSelect, this.monthSelectView, this.primerDiaSemana);
        //asiganr semanas del mes anterior 
        this.semanas = this.addWeeks(this.monthSelect);
        //Seleccionar fecha de la semana anteriror
        this.indexWeekActive = this.semanas.length - 1;
        this.daySelect = this.semanas[this.indexWeekActive][indexDaySelected].value;
      }
    }
    //asignamos nuevas fechas a picker
    let nuevaFecha: Date = new Date();
    nuevaFecha.setFullYear(this.yearSelect, this.monthSelectView - 1, this.daySelect);
    this.datePicker = nuevaFecha;

    //marcammos fechas en el picker
    let nextMonthPicker: Date = new Date(this.yearSelect, this.monthSelectView - 1, this.daySelect);
    this.calendars?.forEach(calendar => {
      // Asignar fecha seleccionada
      calendar.activeDate = nextMonthPicker;
      calendar.selected = nextMonthPicker;
    });

  }

  //Cambiar a la semana siguiente
  nextWeek(): void {
    //dia que se debe marcar
    let indexDaySelected: number = -1;

    //buscar el dia que vamos a marcar 
    if (!this.datePicker) {
      //Si no hay fecha seleccionada usamos la de hoy (let: today)

      //buscar dia en la semana
      for (let i: number = 0; i < this.semanas[this.indexWeekActive].length; i++) {
        if (this.semanas[this.indexWeekActive][i].value == this.today) {
          indexDaySelected = i; //guardar indice del dia
        }
      }
    } else {
      //si hay fecha selccionada
      //fecha seleccionada
      let date: Date = new Date(this.datePicker);
      //buscar dia en la semana
      for (let i: number = 0; i < this.semanas[this.indexWeekActive].length; i++) {
        if (this.semanas[this.indexWeekActive][i].value == date.getDate()) {
          indexDaySelected = i; //guardar indice del dia
        }
      }
    }

    //cambiar de semana
    //si no es la ultima semana
    if (this.indexWeekActive < this.semanas.length - 1) {

      //si la siguiente semana tiene el dia que toca en el siguiente mes cambiar de mes
      let fechaMasAltaSiguienteSemana: number = this.obtenerIndiceNumeroMayor(this.semanas[this.indexWeekActive + 1]);
      //sigue siendo del mes
      if (indexDaySelected <= fechaMasAltaSiguienteSemana) {
        //Seleccionar fecha de la semana siguiente
        this.indexWeekActive++;
        this.daySelect = this.semanas[this.indexWeekActive][indexDaySelected].value;
      } else {
        //cambiar al mes siguiente 
        if (this.monthSelectView == 12) {
          this.yearSelect++;
          this.monthSelectView = 1;
        } else {
          this.monthSelectView++;
        }
        //obtener dias del mes siguinete
        this.monthSelect = this.obtenerDiasMes(this.yearSelect, this.monthSelectView, this.primerDiaSemana);
        //asiganr semanas del mes siguiente 
        this.semanas = this.addWeeks(this.monthSelect);
        //Seleccionar fecha de la semana siguiente
        this.indexWeekActive = 0;
        this.daySelect = this.semanas[this.indexWeekActive][indexDaySelected].value;
      }

    } else {
      //si estamos en la ultima semana 
      //verificar que la primera semana del mes siguiente este completa
      let mesSiguiente: DayInterface[] = this.obtenerDiasMes(this.monthSelectView == 12 ? this.yearSelect + 1 : this.yearSelect, this.monthSelectView == 12 ? 1 : this.monthSelectView + 1, this.primerDiaSemana);
      let semanasSiguinetes: DayInterface[][] = this.addWeeks(mesSiguiente);
      let fechaMasAltaSiguienteSemana = this.obtenerIndiceNumeroMayor(semanasSiguinetes[0]);
      //cambiar al mes siguiente 
      if (this.monthSelectView == 12) {
        this.yearSelect++;
        this.monthSelectView = 1;
      } else {
        this.monthSelectView++;
      }
      //obtener dias del mes siguinete
      this.monthSelect = this.obtenerDiasMes(this.yearSelect, this.monthSelectView, this.primerDiaSemana);
      //asiganr semanas del mes siguiente 
      this.semanas = this.addWeeks(this.monthSelect);

      if (fechaMasAltaSiguienteSemana == 6) {
        //Seleccionar fecha de la semana siguiente
        this.indexWeekActive = 0;
      } else {
        //Seleccionar fecha de la semana siguiente
        this.indexWeekActive = 1;
      }
      this.daySelect = this.semanas[this.indexWeekActive][indexDaySelected].value;
    }
    //Asignar nueva fecha picker
    let nuevaFecha: Date = new Date();
    nuevaFecha.setFullYear(this.yearSelect, this.monthSelectView - 1, this.daySelect);
    this.datePicker = nuevaFecha;

    //marcar fecha en el picker
    let nextMonthPicker: Date = new Date(this.yearSelect, this.monthSelectView - 1, this.daySelect);
    this.calendars?.forEach(calendar => {
      // Asignar fecha seleccionada
      calendar.activeDate = nextMonthPicker;
      calendar.selected = nextMonthPicker;
    });

  }

  //crear nombre de la semanas por rango
  generateNameWeeck(): string {
    //año seleccionado
    this.yearSelect
    //dias
    let dayStart: number = this.semanas[this.indexWeekActive][0].value; //dia inicio 
    let dayEnd: number = this.semanas[this.indexWeekActive][6].value; //dia fin
    //mes inicio 
    let monthStart: number = this.indexWeekActive == 0 && this.semanas[this.indexWeekActive][0].value
      >
      this.semanas[this.indexWeekActive][6].value ? this.monthToNum(this.monthSelectView) == 1 ? 12 : this.monthToNum(this.monthSelectView) -
        1 : this.monthToNum(this.monthSelectView);

    //mes fin
    let monthEnd: number = this.indexWeekActive == this.semanas.length - 1 &&
      this.semanas[this.indexWeekActive][6].value
      < this.semanas[this.indexWeekActive][0].value ? this.monthToNum(this.monthSelectView) == 12 ? 1 : this.monthToNum(this.monthSelectView) + 1
      : this.monthToNum(this.monthSelectView);

    //año seleccionado
    let yearStart: number = this.yearSelect; //año inicio
    let yearEnd: number = this.yearSelect; //año fin 

    //solo en el mes 12 (diciembre) solo en la ultima semana 
    if (this.monthSelectView == 12 && this.indexWeekActive == this.semanas.length - 1) {
      //si el ultimo dia es menor al primero
      if (this.semanas[this.indexWeekActive][6].value < this.semanas[this.indexWeekActive][0].value) {
        yearEnd = yearEnd + 1;
      }
    }

    //solo en el mes 1 (enero) solo en la primer semana 
    if (this.monthSelectView == 1 && this.indexWeekActive == 0) {
      if (this.semanas[this.indexWeekActive][0].value > this.semanas[this.indexWeekActive][6].value) {
        yearStart = yearStart - 1;
      }
    }

    if (monthStart > monthEnd && yearStart < yearEnd) {
      return `${this.obtenerNombreMes(monthStart)?.slice(0, 3)} ${this._translate.instant('crm.alertas.deFecha')} ${yearStart} - ${this.obtenerNombreMes(monthEnd)?.slice(0, 3)} ${this._translate.instant('crm.alertas.deFecha')} ${yearEnd}`
    };

    if (this.indexWeekActive == 0 && dayStart > dayEnd || this.indexWeekActive == this.semanas.length - 1 && dayStart > dayEnd) {
      return `${this.obtenerNombreMes(monthStart)?.slice(0, 3)} - ${this.obtenerNombreMes(monthEnd)?.slice(0, 3)} ${this._translate.instant('crm.alertas.deFecha')} ${yearEnd}`;
    } else {
      return `${this.obtenerNombreMes(this.monthSelectView)} ${this._translate.instant('crm.alertas.deFecha')} ${yearStart}`;
    };
  }

  //Se activa cuando se selecciona una fecha en el picker
  fechaSeleccionada(): void {

    //si hay una fecha en picker
    if (this.datePicker) {
      let date: Date = new Date(this.datePicker); //fecha del picker
      let month: number = date.getMonth() + 1; //mes seleccionado
      let year: number = date.getFullYear(); //año seleccionado
      //Obtner dias de mes seleccionado
      this.monthSelect = this.obtenerDiasMes(year, month, this.primerDiaSemana);
      //asiganr semnas del mes
      this.semanas = this.addWeeks(this.monthSelect);
      //Nuevas fechas seleccionadas
      this.monthSelectView = month; //nuevo mes
      this.yearSelect = year; //nuveo año 
      //Copia de semanas para no alterarla
      let semanasCopia: DayInterface[][] = JSON.parse(JSON.stringify(this.semanas));
      //buscar el indice del dia con la fehca mas alta en la primera semana
      let indiceFechaAltaPrimerSemana: number = this.obtenerIndiceNumeroMayor(semanasCopia[0])

      //si la semana no esta completa (lunes = 1 y domingo = 7)
      if (indiceFechaAltaPrimerSemana != 6) {
        //cambiar la fehca de los dias del mes anterior
        for (let i: number = 0; i < indiceFechaAltaPrimerSemana + 1; i++) {
          semanasCopia[0][i].value = -1;
        }
      }

      let indiceFechaAltaultimaSemana: number = this.obtenerIndiceNumeroMayor(semanasCopia[semanasCopia.length - 1])
      //si la semana no esta completa (lunes = 1 y domingo = 7)
      if (indiceFechaAltaultimaSemana != 6) {
        //cambiar la fehca de los dias del mes anterior
        for (let i: number = indiceFechaAltaultimaSemana + 1; i < 7; i++) {
          semanasCopia[semanasCopia.length - 1][i].value = -1;
        }
      }
      //buscar en que semana está el dia de hoy (today) 
      for (let i: number = 0; i < semanasCopia.length; i++) {
        for (let j: number = 0; j < semanasCopia[i].length; j++) {
          if (date.getDate() == semanasCopia[i][j].value) {
            this.indexWeekActive = i; //marcar semana
            break;
          }
        }
      }
      // marcar nuevo dia
      this.daySelect = date.getDate();
    }
  }

  //Ver horas del dia
  seeDay(): void {
    this.vistaActiva = this._translate.instant('crm.alertas.nombreDia');
    //mostrar todas las horas
    this.hora();

    //mostrar template
    this.verMes = false
    this.verSemana = false
    this.verDia = true;

    //iniciar en dia seleccionado
    if (this.datePicker) {
      let date: Date = new Date(this.datePicker);
      this.daySelect = date.getDate();
    } else {
      this.daySelect = this.today;
    }
  }

  //Ver calendario vista semana
  seeWeek(): void {
    this.vistaActiva = this._translate.instant('crm.alertas.nombreSemana');
    this.verMes = false;
    this.verDia = false;
    this.verSemana = true;

    //Copia de semanas para no alterarla
    let semanasCopia: DayInterface[][] = JSON.parse(JSON.stringify(this.semanas));
    //buscar el indice del dia con la fehca mas alta en la primera semana
    let indiceFechaAltaPrimerSemana: number = this.obtenerIndiceNumeroMayor(semanasCopia[0])

    //si la semana no esta completa (lunes = 1 y domingo = 7)
    if (indiceFechaAltaPrimerSemana != 6) {
      //cambiar la fehca de los dias del mes anterior
      for (let i: number = 0; i < indiceFechaAltaPrimerSemana + 1; i++) {
        semanasCopia[0][i].value = -1;
      }
    }

    let indiceFechaAltaultimaSemana: number = this.obtenerIndiceNumeroMayor(semanasCopia[semanasCopia.length - 1])
    //si la semana no esta completa (lunes = 1 y domingo = 7)
    if (indiceFechaAltaultimaSemana != 6) {
      //cambiar la fehca de los dias del mes anterior
      for (let i: number = indiceFechaAltaultimaSemana + 1; i < 7; i++) {
        semanasCopia[semanasCopia.length - 1][i].value = -1;
      }
    }

    //Semanas copia tiene eliminados los dias que no son de ese mes 
    //verificar si hay fecha seleccionada (maracamos semana seleccionada)
    if (!this.datePicker) {

      //buscar en que semana está el dia de hoy (today) 
      for (let i: number = 0; i < semanasCopia.length; i++) {
        for (let j: number = 0; j < semanasCopia[i].length; j++) {

          if (this.today == semanasCopia[i][j].value) {
            this.indexWeekActive = i;
            break;
          }
        }
      }
    } else {
      let date: Date = new Date(this.datePicker);
      for (let i: number = 0; i < semanasCopia.length; i++) {
        for (let j: number = 0; j < semanasCopia[i].length; j++) {
          if (date.getDate() == semanasCopia[i][j].value) {
            this.indexWeekActive = i;
            break;
          }
        }
      }
    }
  }

  //Obtener indice del dia con la fecha mayor en una semana 
  obtenerIndiceNumeroMayor(lista: DayInterface[]): number {
    let maxIndex: number = 0;
    let maxValue: number = Number.MIN_SAFE_INTEGER;
    for (let i: number = 0; i < lista.length; i++) {
      if (lista[i].value > maxValue) {
        maxValue = lista[i].value;
        maxIndex = i;
      }
    }
    return maxIndex;
  }

  //Obtener indice del dia con la fecha menor en una semana 
  obtenerIndiceNumeroMenor(lista: DayInterface[]): number {
    let minIndex: number = 0; // Índice del número más pequeño
    let minValue: number = Number.MAX_SAFE_INTEGER; // Valor del número más pequeño
    for (let i: number = 0; i < lista.length; i++) {
      if (lista[i].value < minValue) {
        minValue = lista[i].value;
        minIndex = i;
      }
    }
    return minIndex;
  }
  indexHoy: number = 0;
  //verificar si un dia es del mes
  isToday(date: number, i: number): boolean {
    //verificar mes y año de la fecha de hpy
    if (this.today == date && this.monthSelectView == this.month && this.yearSelect == this.year) {
      if (i >= 0 && i < 7 && date > this.semanas[0][6].value)
        return false;
      if (i >= this.monthSelect.length - 6 && i < this.monthSelect.length && date < this.semanas[this.semanas.length - 1][0].value)
        return false;
      this.indexHoy = i;
      return true
    }

    let mesAnterior: number = this.month - 1;
    let mesSiguiente: number = this.month + 1;


    let semanasMesAnterior: DayInterface[][] = this.addWeeks(this.obtenerDiasMes(this.year, mesAnterior, this.primerDiaSemana));
    let semanasMesSiguiente: DayInterface[][] = this.addWeeks(this.obtenerDiasMes(this.year, mesSiguiente, this.primerDiaSemana));



    //si estamos en el año actual y el messeleccionado es igual al mes actual +1 y el dia de hoy es igual a date
    if (this.yearSelect == this.year && (this.monthSelectView == mesSiguiente) && this.today == date && (i >= semanasMesSiguiente[0][0].indexWeek && i <= semanasMesSiguiente[0][6].indexWeek)) {
      return true;
    }
    // // //si estamos en la ultoma semana del mes anterior pero invluye el dia de hoy es true
    // if (this.yearSelect == this.year && (this.monthSelectView == mesAnterior ) && this.today == date && (i >= semanasMesAnterior[semanasMesAnterior.length - 1][0].indexWeek && i <= semanasMesAnterior[semanasMesAnterior.length - 1][6].indexWeek)) {

    //  return true;
    // }

    return false;
  }

  nuevaHoy(dia: DayInterface, i: number) {

    //verificar mes y año de la fecha de hpy
    if (this.today == dia.value && this.monthSelectView == this.month && this.yearSelect == this.year) {
      if (i >= 0 && i < 7 && dia.value > this.semanas[0][6].value)
        return false;
      if (i >= this.monthSelect.length - 6 && i < this.monthSelect.length && dia.value < this.semanas[this.semanas.length - 1][0].value)
        return false;
      this.indexHoy = i;
      return true
    }

    let mesAnterior: number = this.month - 1;
    let mesSiguiente: number = this.month + 1;

    let semanasMesAnterior: DayInterface[][] = this.addWeeks(this.obtenerDiasMes(this.year, mesAnterior, this.primerDiaSemana));
    let semanasMesSiguiente: DayInterface[][] = this.addWeeks(this.obtenerDiasMes(this.year, mesSiguiente, this.primerDiaSemana));

    //si estamos en el mes anterior y la ultima semana incluye el dia de hoy 
    if (this.yearSelect == this.year && (this.monthSelectView == mesAnterior) && (this.monthSelect[i].indexWeek == this.monthSelect[this.indexHoy].indexWeek) && dia.value == this.today && (dia.indexWeek >= semanasMesAnterior[semanasMesAnterior.length - 1][dia.indexWeek].indexWeek && dia.indexWeek <= semanasMesAnterior[semanasMesAnterior.length - 1][dia.indexWeek].indexWeek)) {
      return true;
    }
    //si estamos en el mes siguiente y la primera semana incluye el dia de hoy 
    if (this.yearSelect == this.year && (this.monthSelectView == mesSiguiente) && (this.monthSelect[i].indexWeek == this.monthSelect[this.indexHoy].indexWeek) && dia.value == this.today && (dia.indexWeek >= semanasMesSiguiente[0][dia.indexWeek].indexWeek && dia.indexWeek <= semanasMesSiguiente[0][dia.indexWeek].indexWeek)) {
      return true;
    }

    return false;

  }

  //Mostrar el icono para mostrar tareas en el mes apartir de la fecha de hoy
  mostrarIcono(index: number, mes: number, anio: number): boolean {
    //si el mes seleccionado es mayor al mes del dia de hoy y el año es mayor o igual al año de hoy y el indice es mayor a 0
    if (mes > this.month && anio >= this.year && index >= 0) {
      return true;
    }
    //si el año seleccionado es mayor al año del dia de hoy
    if (anio > this.year) {
      return true;
    }

    //si el index es mayor o igual al index del dia de hoy 
    //si el mes y año seleccionados son iguales al mes y año del dia de hoy
    if (index >= this.indexHoy && mes == this.month && anio == this.year) {
      return true;
    }

    //si no se cumple ningula condicion retornar falso
    return false;
  }

  mostrarIconoMes(dia: DayInterface, index: number, mes: number, anio: number) {

    if (mes == this.month && index >= this.indexHoy) {
      return true;
    }

    if (mes >= this.month && anio >= this.year) {
      return true;
    }

    if (mes > this.month && this.semanas[0][dia.indexWeek].value < this.today) {
      return false;
    }

    return false;
  }



  iconoVistaMes(day: DayInterface, indice: number, mes: number, anio: number): boolean {

    // Comparar años
    if (anio > this.year) {
      // Año mayor al actual, todos los meses son válidos
      return true;
    } else if (anio === this.year) {
      // Mismo año, comparar meses
      if (mes > this.month) {
        let mesSiguienteActual: number = this.month + 1;

        if (mes == mesSiguienteActual) {
          if (indice > this.obtenerIndiceDia(mesSiguienteActual, anio)) {
            return true;
          } else {
            if (this.monthSelect[indice].value < this.today && !this.monthCurrent(day.value, indice)) {
              return false;
            }
          }
        }

        // Mes mayor al actual, todos los días son válidos
        return true;
      } else if (mes === this.month) {
        // Mismo mes, comparar días
        if (indice >= this.indexHoy) {
          return true;
        }
        return false;
      } else if (mes < this.month) {

        let mesAnteriorActual: number = this.month - 1;

        if (mes == mesAnteriorActual && indice >= this.obtenerIndiceDiaAnterior(mesAnteriorActual, anio)) {

          return true;
        }
        // Mes menor al actual
        return false;
      }
      return false;
    } else {
      // Año menor al actual
      return false;
    }
  }


  esMenor(dia: DayInterface) {
    if (dia.value < this.today) {
      return true;
    }
    return false;
  }

  indiceMenor(indexDay: number) {

    if (indexDay < this.indexHoy) {
      return true;
    }
    return false;
  }

  obtenerIndiceDia(mes: number, anio: number) {

    let mesSiguienteActual: DayInterface[];
    let indiceDia: number = 0;

    mesSiguienteActual = this.obtenerDiasMes(anio, mes, this.primerDiaSemana);

    for (let index = 0; index < mesSiguienteActual.length; index++) {
      const element = mesSiguienteActual[index];

      if (element.value == this.today) {
        indiceDia = index;
        break;
      }
    }
    return indiceDia;
  }

  obtenerIndiceDiaAnterior(mes: number, anio: number) {

    let mesAnteriorActual: DayInterface[];
    let indiceDia: number = 0;

    mesAnteriorActual = this.obtenerDiasMes(anio, mes, this.primerDiaSemana);

    for (let index = 0; index < mesAnteriorActual.length; index++) {
      const element = mesAnteriorActual[index];

      if (index >= mesAnteriorActual.length - 7 && element.value == this.today) {
        indiceDia = index;
        break;
      }
    }
    return indiceDia;
  }

  //mostrar el icono en los dias de la semana apartir del dia de hoy
  mostrarIconoSemana(dia: DayInterface, index: number, mes: number, anio: number): boolean {
    //si el mes seleccionado es mayor o igual al mes del dia de hoy
    //si el año seleccionado es mayor o igual al año del dia de hoy
    if (mes >= this.month && anio >= this.year) {

      //obtener las semanas del mes actual
      let semanasMesActual: DayInterface[][] = this.addWeeks(this.obtenerDiasMes(this.year, this.month, this.primerDiaSemana));

      //validar que en la primera semana solo se muestre en el dia de hoy y en los dias mayores al dia de hoy 
      // y en los menores de 7 solo en la primera semana 
      if (semanasMesActual[0][index].value >= this.today && semanasMesActual[0][index].value <= 7) {
        return true;
      }

      //si en la primera semana del mes y año actual hay dias menores a 31 retornar falso
      if (this.indexWeekActive == 0 && semanasMesActual[0][index].value <= 31 && mes == this.month && anio == this.year) {
        return false;
      }

      //solo en dias mayeres al dia de hoy en el mes 
      if (dia.value < this.today && this.month == mes && this.year == anio) {
        return false;
      }

      return true;
    }

    //año siguiente primer mes y primer dia mayor a 0 tendrá el icono
    if (anio > this.year && mes >= 0 && dia.value > 0) {
      return true;
    }

    return false;
  }

  //mostrra icono en la vista del dia en las horas correspondientes
  mostrarIconoHora(dia: number, hora: HoraInterface) {

    //en el dia de hoy solo mostrar el icono en las horas posteriores a la hora actual del dia de hoy 
    if (this.today == dia && hora.hora24 >= this.horaActual) {
      return true;
    }
    //sino es el dia de hoy mostrar el icono en todas las horas
    if (dia > this.today) {
      return true;
    }

    return false;
  }

  //Verificar si una fecha es del mes seleccionado
  monthCurrent(date: number, i: number): boolean {
    if (i >= 0 && i < 7 && date > this.semanas[0][6].value) {
      return false;
    }

    if (i >= this.monthSelect.length - 6 && i < this.monthSelect.length && date < this.semanas[this.semanas.length - 1][0].value) {
      return false;
    }
    return true
  }

  //cambia al dia anterior
  backDay(): void {
    //buscar el ultimo dia del mes
    let ultimodia: number = this.obtenerUltimoDiaMes(this.yearSelect, this.monthSelectView - 1);

    //cambiar mes y anio si es necesario en el cambio de dia
    if (this.monthSelectView == 1 && this.daySelect == 1) {
      this.monthSelectView = 12;
      this.yearSelect--;
      this.daySelect = ultimodia;
      this.monthSelect = this.obtenerDiasMes(this.yearSelect, this.monthSelectView, this.primerDiaSemana);
      //cambiar el indice de las semanas del mes correspondiente
      this.semanas = this.addWeeks(this.monthSelect);
    } else {
      if (this.daySelect == 1) {
        this.daySelect = ultimodia;
        this.monthSelectView--;
        this.monthSelect = this.obtenerDiasMes(this.yearSelect, this.monthSelectView, this.primerDiaSemana);
        //cambiar el indeice de las semanas del mes que corresponda
        this.semanas = this.addWeeks(this.monthSelect);
      } else {
        //restar un dia al dia seleccionado
        this.daySelect--;
      }
    }
    //marcar el dia seleccionado
    let previousMonth: Date = new Date(this.yearSelect, this.monthSelectView - 1, this.daySelect);
    this.calendars?.forEach(calendar => {
      calendar.activeDate = previousMonth;
      calendar.selected = previousMonth;
    });
  }

  //Cambia al dia siguiente
  nextDay(): void {
    //ontener ultimo dia del mes
    let ultimodia: number = this.obtenerUltimoDiaMes(this.yearSelect, this.monthSelectView);
    // cambiar el mes y anio cuando sea el ultimo dia del mes
    if (this.monthSelectView == 12 && this.daySelect == ultimodia) {
      //cambio de fechas por nuvas
      this.monthSelectView = 1;
      this.yearSelect++;
      this.daySelect = 1;
      //obtner dias del mes y semanas
      this.monthSelect = this.obtenerDiasMes(this.yearSelect, this.monthSelectView, this.primerDiaSemana);
      this.semanas = this.addWeeks(this.monthSelect);
    } else {
      if (this.daySelect == ultimodia) {
        //cambio de fechas por nuvas
        this.daySelect = 1;
        this.monthSelectView++;
        //obtner dias del mes y semanas
        this.monthSelect = this.obtenerDiasMes(this.yearSelect, this.monthSelectView, this.primerDiaSemana);
        this.semanas = this.addWeeks(this.monthSelect);
      } else {
        //sumar un doa al dia seleccionado
        this.daySelect++;
      }
    }
    //marcar el dia seleccionado
    let nextMonth: Date = new Date(this.yearSelect, this.monthSelectView - 1, this.daySelect);
    this.calendars?.forEach(calendar => {
      calendar.activeDate = nextMonth;
      calendar.selected = nextMonth;
    });
  }

  //TODO: Aqui me queqdé con el tipado
  //Obtner ultimo dia de un mes especifico 
  obtenerUltimoDiaMes(anio: number, mes: number): number {
    // Crear un objeto Date para el primer día del siguiente mes
    let primerDiaMesSiguiente = new Date(anio, mes, 1);
    // Restar 1 día al primer día del siguiente mes para obtener el último día del mes actual
    let ultimoDiaMes = new Date(primerDiaMesSiguiente.getTime() - 1);
    // Retornar el número del día del último día del mes
    return ultimoDiaMes.getDate();
  }

  // Obtener el nombre del mes
  obtenerNombreMes(numero: number): string | null {
    let lrCode = `${this.activeLang.lang}-${this.activeLang.reg}`;
    let miFecha = new Date();
    if (0 < numero && numero <= 12) {
      miFecha.setMonth(numero - 1, +1);
      const nombreMes = new Intl.DateTimeFormat(lrCode, { month: 'long' }).format(miFecha);
      return nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);
    } else {
      return null;
    }
  }

  //Regresar a la fecha del dia de hoy
  async hoy(): Promise<void> {
    this.crearTarea = false;
    //Asignar fecha al picker (Date.Now)
    let nuevaFecha = new Date();
    nuevaFecha.setFullYear(this.year, this.month - 1, this.today);
    this.datePicker = nuevaFecha;

    //marcar nueva fecha en el picker
    let nextMonthPicker = new Date(this.year, this.month - 1, this.today);
    this.calendars?.forEach(calendar => {
      calendar.activeDate = nextMonthPicker;
      calendar.selected = nextMonthPicker;
    });

    //Obtner dias del mes y semanas
    this.monthSelect = this.obtenerDiasMes(this.year, this.month, this.primerDiaSemana);
    this.semanas = this.addWeeks(this.monthSelect);

    //seleccionar nuevas fechas
    this.monthSelectView = this.month;
    this.yearSelect = this.year;
    this.daySelect = this.today;

    //semana
    //Copia de lista de semanas para no alterarla
    let semanasCopia = JSON.parse(JSON.stringify(this.semanas));
    //buscar el indice del dia con la fehca mas alta en la primera semana
    let indiceFechaAltaPrimerSemana = this.obtenerIndiceNumeroMayor(semanasCopia[0])
    //si la semana no esta completa (lunes = 1 y domingo = 7)
    if (indiceFechaAltaPrimerSemana != 6) {
      //cambiar la fehca de los dias del mes anterior
      for (let i = 0; i < indiceFechaAltaPrimerSemana + 1; i++) {
        semanasCopia[0][i].value = -1;
      }
    }
    let indiceFechaAltaultimaSemana = this.obtenerIndiceNumeroMayor(semanasCopia[semanasCopia.length - 1])
    //si la semana no esta completa (lunes = 1 y domingo = 7)
    if (indiceFechaAltaultimaSemana != 6) {
      //cambiar la fehca de los dias del mes anterior
      for (let i = indiceFechaAltaultimaSemana + 1; i < 7; i++) {
        semanasCopia[semanasCopia.length - 1][i].value = -1;
      }
    }
    //buscar en que semana está el dia de hoy (today) 
    for (let i = 0; i < semanasCopia.length; i++) {
      for (let j = 0; j < semanasCopia[i].length; j++) {
        if (this.today == semanasCopia[i][j].value) {
          this.indexWeekActive = i;
          break;
        }
      }
    }
    await this.getTareasCalendario(this.monthSelectView, this.yearSelect);
  }

  //Devuelve un mes dependiedo de las semanas
  //si hay dias en una semana que pertenecen a un mes distinto
  resolveMonth(indexDay: number): number {
    //si la semnaa seleccionada es 0 es la primer semana 
    // los dias anterirores son del mes anterrior 
    if (this.indexWeekActive == 0) {
      let incioMes = this.obtenerIndiceNumeroMenor(this.semanas[this.indexWeekActive]);
      if (indexDay < incioMes) {
        return this.monthSelectView == 1 ? 12 : this.monthSelectView - 1;
      } else {
        return this.monthSelectView;
      }
    } else if (this.indexWeekActive == this.semanas.length - 1) {
      //si la semana seleccionada es la utima 
      // los dias siguientes son del mes siguienete 
      let finMes = this.obtenerIndiceNumeroMayor(this.semanas[this.indexWeekActive]);
      if (indexDay > finMes) {
        return this.monthSelectView == 12 ? 1 : this.monthSelectView + 1;
      } else {
        return this.monthSelectView;
      }
    } else {
      return this.monthSelectView;
    }
  }

  //Devuelve un año dependiedo de las semanas
  //si hay dias en una semana que pertenecen a un año distinto
  resolveYear(indexDay: number): number {
    if (this.indexWeekActive == 0) {
      let incioMes = this.obtenerIndiceNumeroMenor(this.semanas[this.indexWeekActive]);
      if (indexDay < incioMes) {
        return this.monthSelectView == 1 ? this.yearSelect - 1 : this.yearSelect;
      } else {
        return this.yearSelect;
      }
    } else if (this.indexWeekActive == this.semanas.length - 1) {
      //si la semana seleccionada es la utima 
      // los dias siguientes son del mes siguienete 
      let finMes = this.obtenerIndiceNumeroMayor(this.semanas[this.indexWeekActive]);
      if (indexDay > finMes) {
        return this.monthSelectView == 12 ? this.yearSelect + 1 : this.yearSelect;
      } else {
        return this.yearSelect;
      }
    } else {
      return this.yearSelect;
    }
  }

  //Ver el calendario en vista de Semana
  seeMonth(): void {
    this.vistaActiva = this._translate.instant('crm.alertas.nombreMes');
    this.verDia = false;
    this.verMes = true;
    this.verSemana = false;
  }

  //mostrar las 24 horas del dia (formato 12h)
  hora(): void {
    this.horas.forEach(element => {
      element.visible = true
    });
  }

  //funcion para mostrar el rango de horas laborales
  hora8(): void {

    this.horas.forEach((objeto) => {
      if (objeto.hora24 >= this.horaInicio.hora24 && objeto.hora24 <= this.horaFin.hora24) {
        objeto.visible = true;
      } else {
        objeto.visible = false;
      }
    });
  }

  // muestra las tareas en el dia de su creacion
  tareaDia(day: number, month: number, year: number): TareaCalendarioInterface[] {
    let fechaBusqueda = `${day}/${month}/${year}`
    let fechaBusquedaFormateada = moment(fechaBusqueda, 'DD/MM/YYYY').format('YYYY-MM-DD');
    //Filtro tareas por fecha
    return this.tareas.filter(objeto => {
      let fechaObjeto = objeto.fecha_Ini.toString().split('T')[0]; // Extraer la fecha sin la hora
      return fechaObjeto === fechaBusquedaFormateada;
    });
  }

  // tareaDia() { }

  //Filtro de tareas por hora
  tareaHora(hora: number, tareas: TareaCalendarioInterface[]): TareaCalendarioInterface[] {
    //filtrar de lista
    return tareas.filter(objeto => {
      let fechaObjeto = new Date(objeto.fecha_Ini);
      let horaObjeto = fechaObjeto.getHours().toString();
      return horaObjeto === hora.toString();
    });
  }

  //Mostrar vista dia (24 horas)
  irAlDia(dia: DayInterface, indexDay: number, mes: number): void {
    this.hora() // 24 horas visibles
    //mostrar el dia
    this.verDia = true;
    this.verSemana = false;
    this.verMes = false;

    this.vistaActiva = this._translate.instant('crm.alertas.nombreDia');

    //Set new date
    // los dias anterirores son del mes anterrior 
    if (indexDay >= 0 && indexDay <= 6) { //primera semna rango dias

      let incioMes = this.obtenerIndiceNumeroMenor(this.semanas[0]);
      if (dia.indexWeek < incioMes) {

        //cambiar mes y año si es necesario
        if (this.monthSelectView == 1) {
          this.monthSelectView = 12;
          this.yearSelect--;
        } else {
          this.monthSelectView--;
        }
      }
    }

    //si la semana seleccionada es la utima 
    if (indexDay >= (this.monthSelect.length - 8) && indexDay >= this.semanas[this.semanas.length - 1].length - 1) { //ultima semana 
      // los dias siguientes son del mes siguienete 
      let finMes = this.obtenerIndiceNumeroMayor(this.semanas[this.semanas.length - 1]);
      if (dia.indexWeek > finMes) {
        //cambiar mes y año si es necesario
        if (this.monthSelectView == 12) {
          this.monthSelectView = 1;
          this.yearSelect++;
        } else {
          this.monthSelectView++;
        }
      }
    }
    //obtener dias del mes anterior
    this.monthSelect = this.obtenerDiasMes(this.yearSelect, this.monthSelectView, this.primerDiaSemana);
    //asiganr semanas del mes siguiente 
    this.semanas = this.addWeeks(this.monthSelect);
    //dia seleccionado
    this.daySelect = dia.value;
    //Set date in picker
    let nuevaFecha = new Date();
    nuevaFecha.setFullYear(this.yearSelect, this.monthSelectView - 1, this.daySelect);
    this.datePicker = nuevaFecha;

    //marcar fecha en calendario (picker)
    let nextMonthPicker = new Date(this.yearSelect, this.monthSelectView - 1, this.daySelect);
    this.calendars?.forEach(calendar => {
      calendar.activeDate = nextMonthPicker;
      calendar.selected = nextMonthPicker;
    });
  }

  //ir al dia desde ver semana
  irAlDiaSemana(dia: DayInterface, indexDay: number): void {
    this.hora() // 24 horas visibles

    //mostrar el dia
    this.verMes = false
    this.verSemana = false
    this.verDia = true
    this.vistaActiva = this._translate.instant('crm.alertas.nombreDia'); //mostrar el nombre de la vista activa de Dia

    if (this.indexWeekActive == 0) {
      let incioMes = this.obtenerIndiceNumeroMenor(this.semanas[this.indexWeekActive]);
      if (indexDay < incioMes) {
        //cambiar mes y año si es necesario
        if (this.monthSelectView == 1) {
          this.monthSelectView = 12;
          this.yearSelect--;
        } else {
          this.monthSelectView--;
        }
      }
    } else if (this.indexWeekActive == this.semanas.length - 1) {
      //si la semana seleccionada es la utima 
      // los dias siguientes son del mes siguienete 
      let finMes = this.obtenerIndiceNumeroMayor(this.semanas[this.indexWeekActive]);

      if (indexDay > finMes) {
        //cambiar mes y año si es necesario
        if (this.monthSelectView == 12) {
          this.monthSelectView = 1;
          this.yearSelect++;
        } else {
          this.monthSelectView++;
        }
      }
    }
    //obtener dias del mes anterior
    this.monthSelect = this.obtenerDiasMes(this.yearSelect, this.monthSelectView, this.primerDiaSemana);
    //asiganr semanas del mes siguiente 
    this.semanas = this.addWeeks(this.monthSelect);
    //Marcar dia
    this.daySelect = dia.value;

    //set new date in picker
    let nuevaFecha = new Date();
    nuevaFecha.setFullYear(this.yearSelect, this.monthSelectView - 1, this.daySelect);
    this.datePicker = nuevaFecha;

    //Marcar nueva fecha en calendario
    let nextMonthPicker = new Date(this.yearSelect, this.monthSelectView - 1, this.daySelect);
    this.calendars?.forEach(calendar => {
      //Asignar fecha seleccionada
      calendar.activeDate = nextMonthPicker;
      calendar.selected = nextMonthPicker;
    });
  }

  //Obtener tareas disponibles para calendario tareas
  async getTareasCalendario(mes: number, anio: number): Promise<void> {
    this.crearTarea = false;

    let anioInicial: number = mes == 1 ? anio - 1 : anio;
    let mesInicial: number = mes == 1 ? 12 : mes - 1;

    let anioFinal: number = mes == 12 ? anio + 1 : anio;
    let mesFinal: number = mes == 12 ? 1 : mes + 1;


    // Agregamos un cero delante si el número del mes es menor que 10
    let mesIniCero: string = mesInicial < 10 ? `0${mesInicial}` : mesInicial.toString();
    let mesFinCero: string = mesFinal < 10 ? `0${mesFinal}` : mesFinal.toString();


    let ultimoDia: number = this.obtenerUltimoDiaMes(anioFinal, mesFinal);

    let mesAnterior: string = `${anioInicial}${mesIniCero}01 00:00:00`;
    let mesSiguiente: string = `${anioFinal}${mesFinCero}${ultimoDia} 23:59:59`;

    //mostrar pantalla de carga
    this.isLoading = true
    //Consumo de api
    //Cargar y cambiar token y usuario
    let resTareasCalendario: ResApiInterface = await this._tareaService.getTareasCalendario(mesAnterior, mesSiguiente)
    //ocultar pantalla de carga
    this.isLoading = false;
    //Si el servico se ejecuta mal mostar mensaje
    if (!resTareasCalendario.status) {
      this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.salioMal'));
      console.error(resTareasCalendario.response);
      console.error(resTareasCalendario.storeProcedure);
      return
    }
    //Si se ejecuto bien, obtener la respuesta de apiRespuestaTareas
    this.tareas = resTareasCalendario.response;

  }

  obtenerHora(hora: number, dia: number, mes: number, anio: number) {
    this.tareasGlobalService.idPantalla = 2;
    this.tareasGlobalService.vistaDia = true;

    let fecha: Date = new Date();
    fecha.setDate(dia);
    fecha.setMonth(mes - 1);
    fecha.setFullYear(anio);
    fecha.setHours(hora);
    // fecha.setMinutes(0)

    if (this.isEqualDate(this.fechaHoy, fecha) && fecha.getHours() == this.fechaHoy.getHours()) {

      let fechaEnviar: Date = new Date();
      fechaEnviar.setDate(dia);
      fechaEnviar.setMonth(mes - 1);
      fechaEnviar.setFullYear(anio);
      fechaEnviar.setHours(hora);
      // fecha.setMinutes(0)

      this.tareasGlobalService.fechaIniCalendario = new Date(fechaEnviar);

    } else {

      let fechax: Date = new Date();
      fechax.setDate(dia);
      fechax.setMonth(mes - 1);
      fechax.setFullYear(anio);
      fechax.setHours(hora);
      fechax.setMinutes(0);
      fechax.setSeconds(0);

      this.tareasGlobalService.fechaIniCalendario = new Date(fechax);
    }

    //abrir crear tareas
    this.crearTarea = true;
    this.mostrarCalendario = false;
  }

  //ver pantalla de Home
  async backPageCalendario(value: boolean): Promise<void> {
    await this.getTareasCalendario(this.monthSelectView, this.yearSelect);
    this.tareasGlobalService.vistaDia = false;
    this.mostrarCalendario = value;
  }

  addTarea(tareaCalendario: TareaCalendarioInterface) {
    //agregar la taree creada a la lista de las tareas de ese dia
    this.tareas.push(tareaCalendario);
  }

  crearTareaVistaMes(dia: DayInterface, indexDay: number, mes: number, anio: number) {

    this.tareasGlobalService.idPantalla = 2;

    //guardar aqui la fecha seleccionada en el calendario vista por mes
    let enviarFecha: Date;

    // los dias anterirores son del mes anterrior 
    if (indexDay >= 0 && indexDay <= 6) { //primera semna rango dias

      let incioMes: number = this.obtenerIndiceNumeroMenor(this.semanas[0]);
      if (dia.indexWeek < incioMes) {
        //cambiar mes y año si es necesario
        if (mes == 1) {
          mes = 12;
          anio--;
        } else {
          mes--;
        }
      }
    }

    //si la semana seleccionada es la utima 
    if (indexDay >= (this.monthSelect.length - 7) && indexDay >= this.semanas[this.semanas.length - 1].length - 1) { //ultima semana 
      // los dias siguientes son del mes siguienete 
      let finMes: number = this.obtenerIndiceNumeroMayor(this.semanas[this.semanas.length - 1]);
      if (dia.indexWeek > finMes) {
        //cambiar mes y año si es necesario
        if (mes == 12) {
          mes = 1;
          anio++;
        } else {
          mes++;
        }
      }
    }
    //Set date in picker
    let nuevaFecha: Date = new Date();
    nuevaFecha.setFullYear(anio, mes - 1, dia.value);

    if (this.isEqualDate(this.fechaHoy, nuevaFecha)) {
      enviarFecha = nuevaFecha;
      this.tareasGlobalService.fechaIniCalendario = new Date(enviarFecha);
    } else {
      enviarFecha = new Date(anio, mes - 1, dia.value)
      this.tareasGlobalService.fechaIniCalendario = new Date(enviarFecha);
    }
    //abrir pantalla crear tareas
    this.crearTarea = true;
    this.mostrarCalendario = false;

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


  crearTareaSemana(dia: DayInterface, indexDay: number, mes: number, anio: number): void {

    this.tareasGlobalService.idPantalla = 2;
    //guardar aqui la fecha seleccionada en el calendario vista por semana
    let enviarFecha: Date;

    if (this.indexWeekActive == 0) {
      let incioMes: number = this.obtenerIndiceNumeroMenor(this.semanas[this.indexWeekActive]);
      if (indexDay < incioMes) {
        //cambiar mes y año si es necesario
        if (mes == 1) {
          mes = 12;
          anio--;
        } else {
          mes--;
        }
      }
    } else if (this.indexWeekActive == this.semanas.length - 1) {
      //si la semana seleccionada es la utima 
      // los dias siguientes son del mes siguienete 
      let finMes: number = this.obtenerIndiceNumeroMayor(this.semanas[this.indexWeekActive]);

      if (indexDay > finMes) {
        //cambiar mes y año si es necesario
        if (mes == 12) {
          mes = 1;
          anio++;
        } else {
          mes++;
        }
      }
    }
    //Set date in picker
    let nuevaFecha: Date = new Date();
    nuevaFecha.setFullYear(anio, mes - 1, dia.value);

    if (this.isEqualDate(this.fechaHoy, nuevaFecha)) {
      enviarFecha = nuevaFecha;
      this.tareasGlobalService.fechaIniCalendario = new Date(enviarFecha);
    } else {
      enviarFecha = new Date(anio, mes - 1, dia.value)
      this.tareasGlobalService.fechaIniCalendario = new Date(enviarFecha);
    }

    //abrir pantalla crear tareas
    this.crearTarea = true;
    this.mostrarCalendario = false;

  }

  verAjustes(): void {
    this.ajustes = true;
    this.tituloAjustes = true;
    this.dias = false;
    this.inicio = false;
    this.fin = false;
    this.picker = false;
  }

  verHoraInicio(): void {
    this.inicio = true;
    this.ajustes = false;
    this.dias = false;
    this.fin = false;
    this.tituloAjustes = false;
  }

  verHoraFin(): void {
    this.fin = true;
    this.ajustes = false;
    this.dias = false;
    this.inicio = false;
    this.tituloAjustes = false;

  }

  verDias(): void {
    this.dias = true;
    this.ajustes = false;
    this.inicio = false;
    this.fin = false;
    this.tituloAjustes = false;

  }


  verPiker(): void {
    this.picker = true;
    this.ajustes = false;
    this.inicio = false;
    this.fin = false;
    this.dias = false;
    this.tituloAjustes = true;
  }

  capitalizarTexto(texto: string): string {
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLocaleLowerCase();
  };

  //Obtener el lenguaje y region activo y mostrar los dias en el idioma acivo
  getLrCode(): string[] {
    let lrCode = `${this.activeLang.lang}-${this.activeLang.reg}`
    if (lrCode == 'es-GT') return diasEspaniol;
    if (lrCode == 'en-US') return diasIngles;
    return [];
  };

  setHoras(): void {
    PreferencesService.inicioLabores = this.inicioLabores.toString();
    PreferencesService.finLabores = this.finLabores.toString();

    this.horaInicio = horas[this.inicioLabores];
    this.horaFin = horas[this.finLabores];

    //Regresar a pantalla de ajustes y ocultar las demas
    this.refresh();

    if (this.verDia) {
      this.hora8();
    }
    this.verAjustes();
  };

  obtenerHorarioLaboral() {
    let getHoraInicio: string = PreferencesService.inicioLabores;
    if (getHoraInicio) {
      let hora: number = +getHoraInicio;
      this.horaInicio = this.horas[hora];
    } else {
      this.horaInicio = this.horas[indexHoraInicioDefault];
    }

    let getHoraFin: string = PreferencesService.finLabores;
    if (getHoraFin) {
      let hora: number = +getHoraFin;
      this.horaFin = this.horas[hora];
    } else {
      this.horaFin = this.horas[indexHoraFinDefault];
    }
  }

  cambiarPrimerDia(): void {
    PreferencesService.inicioSemana = this.primerDiaSemana.toString();
    this.refresh();
    this.verAjustes();
  };
}
