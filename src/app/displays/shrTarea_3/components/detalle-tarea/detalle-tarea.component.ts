import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { CargarArchivosService } from 'src/app/services/archivo.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { TareaService } from '../../services/tarea.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { CrearTareasComentariosService } from 'src/app/services/crear-tarea-comentario.service';
import { LanguageInterface } from 'src/app/interfaces/language.interface';
import { indexDefaultLang, languagesProvider } from 'src/app/providers/languages.provider';
import { ComentarInterface, ComentarioInterface } from 'src/app/interfaces/comentario.interface';
import { InvitadoInterface } from '../../interfaces/invitado.interface';
import { ResponsablesInterface } from '../../interfaces/responsable.interface';
import { EstadoInterface } from '../../interfaces/estado-tarea.interface';
import { TareaInterface } from '../../interfaces/tarea-user.interface';
import { ComentariosDetalle, DetalleInterface } from '../../interfaces/detalle-tarea.interface';
import { MatSidenav } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog';
import { RefrescarService } from 'src/app/services/refrescar-tarea.service';
import { ThemeService } from 'src/app/services/theme.service';
import { GlobalTareasService } from 'src/app/services/tarea-global.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { TranslateService } from '@ngx-translate/core';
import { LoginInterface } from 'src/app/interfaces/login.interface';
import { ObjetoInterface } from '../../interfaces/objetos-comentario.interface';
import { ActualizarTareaComponent } from 'src/app/components/actualizar-tarea/actualizar-tarea.component';
import { NivelPrioridadInterface } from '../../interfaces/prioridad-tarea.interface';
import { ActualizarUsuariosComponent } from 'src/app/components/actualizar-usuarios/actualizar-usuarios.component';
import { EliminarUsuarioInterface } from '../../interfaces/eliminar-usuario.interface';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';

@Component({
  selector: 'app-detalle-tarea',
  templateUrl: './detalle-tarea.component.html',
  styleUrls: ['./detalle-tarea.component.scss'],
  providers: [
    // inyeccion de servicios a utilizar
    NotificationsService,
    CargarArchivosService,
    TareaService,
    UsuarioService,
    CrearTareasComentariosService,
  ]
})
export class DetalleTareaComponent {

  // comunicacion entre componentes
  @Output() newItemEvent = new EventEmitter<boolean>();
  //Idiomas disponibles para la aplicacion 
  activeLang!: LanguageInterface;
  languages: LanguageInterface[] = languagesProvider;

  //abirir y cerrar el mat expander
  desplegarDetalles: boolean = false;
  fechaHoy: Date = new Date();
  nuevoComentario!: ComentarioInterface;
  descripcionComentario: string = '';
  selectedFiles: File[] = [];

  usuariosInvitados!: InvitadoInterface[];
  usuariosResposables!: ResponsablesInterface[];
  estadoTarea!: EstadoInterface;
  //mostrar y ocultar pantallas
  isLoading: boolean = false;
  detalles: boolean = true;

  responsableActivo!: string;
  tareaDetalle?: TareaInterface;
  comentarios: ComentariosDetalle[] = [];
  invitados: InvitadoInterface[] = [];
  responsables: ResponsablesInterface[] = [];

  //Abrir/Cerrar SideNav
  @ViewChild('sidenav')
  sidenav!: MatSidenav;
  @ViewChild('sidenavend')
  sidenavend!: MatSidenav;

  usuarioTarea = PreferencesService.user;
  empresa: EmpresaInterface = PreferencesService.empresa;

  constructor(
    //declaracion de variables privadas
    private _dialog: MatDialog,
    private _usuarioService: UsuarioService,
    private _files: CargarArchivosService,
    private _widgetsService: NotificationsService,
    private _nuevoComentario: CrearTareasComentariosService,
    private _actualizar: RefrescarService,
    private _tareaService: TareaService,
    private themeService: ThemeService,
    private _translate: TranslateService,
    public tareasGlobalService: GlobalTareasService,

  ) {
    //obtener el idioma gardado en el servicio
    let getLanguage = PreferencesService.lang;
    if (!getLanguage) {
      //si no se encuentra asignar el idioma por defecto
      this.activeLang = languagesProvider[indexDefaultLang];
    } else {
      //si se encuentra asignar el idioma que esta guardado
      let getIndexLang: number = +getLanguage;
      this.activeLang = languagesProvider[getIndexLang];
    }

    this.fechaHoy = new Date();

    //nombre del usuario logueado.
  }

  //TODO: ya envia valores booleanos
  ngOnInit() {
    // Con el subscribe escuchamos si la variable sufrió algún cambio7
    this.tareaDetalle = this.tareasGlobalService.tareaDetalles;
    this.loadData();
  }

  async loadData() {
    this.fechaHoy = new Date();
    // this.tareaEncontrada.tarea = task;
    this.isLoading = true;
    let resComentarios: ResApiInterface = await this._tareaService.getComentarios(this.tareaDetalle!.iD_Tarea);

    //Si el servico se ejecuta mal mostrar menaje
    if (!resComentarios.status) {
      this.isLoading = false;
      this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.salioMal'));
      console.error(resComentarios.response);
      console.error(resComentarios.storeProcedure);
      return
    }

    //Si se ejecuto bien, obtener la respuesta de apiComentarios
    let comentarios: ComentarioInterface[] = resComentarios.response;

    this.comentarios = [];

    for (const comentario of comentarios) {
      let resFiles: ResApiInterface = await this._tareaService.getComentariosObjeto(comentario.tarea_Comentario, comentario.tarea);
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
      this.comentarios.push(itemComentario);

    }

    //Consumo de api invitados
    let resInvitados: ResApiInterface = await this._usuarioService.getUsuariosInvitados(this.tareaDetalle!.iD_Tarea);
    //Si el servico se ejecuta mal mostar mensaje
    if (!resInvitados.status) {
      this.isLoading = false;
      this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.salioMal'));
      console.error(resInvitados.response);
      console.error(resInvitados.storeProcedure);
      return;
    };

    this.invitados = resInvitados.response;

    //Consumo de api invitados
    let resResponsables: ResApiInterface = await this._usuarioService.getUsuariosResponsables(this.tareaDetalle!.iD_Tarea);
    //Si el servico se ejecuta mal mostar mensaje
    this.isLoading = false;
    if (!resResponsables.status) {
      this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.salioMal'));
      console.error(resResponsables.response);
      console.error(resResponsables.storeProcedure);
      return;
    };

    this.responsables = resResponsables.response;


    console.log(this.responsables);
    
  }

  async refreshs() {
    this.isLoading = true;
    this._actualizar.tarea.next(true);

    this.descripcionComentario = '';
    this.isLoading = false;
  }

  timer: any;

  refresh() {
    // Establecer isLoading en true cuando comienza el temporizador
    this.isLoading = true;

    clearTimeout(this.timer); // Cancelar el temporizador existente
    this.timer = setTimeout(() => {
      // Código que se ejecutará después de que transcurra el temporizador (1 segundo en este caso)

      // Restablecer isLoading a false después de que se complete el temporizador
      this.isLoading = false;
    }, 1000); // Establecer el período de retardo en milisegundos (en este caso, 1000 ms o 1 segundo)
  }

  //regresar a la pantalla anterior.
  backPage(): void {
    this.newItemEvent.emit(true);
  }

  //Abrir cerrar Sidenav
  close(reason: string): void {
    this.sidenav.close();
    this.sidenavend.close();
  }

  horaZonaHoraria(fecha: Date) {

    let fechaRecibida: Date = fecha;
    //obtener diferencia horaria
    let diferenciaHoraria: number = fecha.getTimezoneOffset() / 60;

    if (diferenciaHoraria > 0) {
      //es positivo
      return fechaRecibida.setHours(fecha.getHours() - diferenciaHoraria);
    } else {
      return fechaRecibida.setHours(fecha.getHours() + diferenciaHoraria);
    }

  }

  ajustarFecha(fecha: Date): Date {

    console.log(fecha, "fecha");

    let fechaCambio: Date = new Date(fecha);
    console.log(fechaCambio, "fecha delcambio");

    const diferenciaHoraria: number = fechaCambio.getTimezoneOffset() / 60;

    console.log(diferenciaHoraria);
    console.log(
      fecha.setHours(fechaCambio.getHours() - diferenciaHoraria), "euuuuu"
    );


    if (diferenciaHoraria > 0) {
      fecha.setHours(fechaCambio.getHours() - diferenciaHoraria);

      return fecha;
    } else {
      fecha.setHours(fechaCambio.getHours() + diferenciaHoraria);
      return fecha;
    }

    return fecha;

    if (diferenciaHoraria > 0) {
      let fechaMenos = new Date(fecha.setHours(fecha.getHours() + diferenciaHoraria));
      return fechaMenos;
    } else {
      let fechaMas = new Date(fecha.setHours(fecha.getHours() - diferenciaHoraria));
      return fechaMas;
    }
  }

  //mostrar un mensaje de no disponible 
  //cuando la informacion de los detalles esta vacia
  //cuando la informacion de los detalles esta vacia
  resolveObject(objeto: any): string {
    if (objeto == null)
      return this._translate.instant('pos.home.noAsignado');
    return objeto;
  }

  async comentar() {

    if (!this.descripcionComentario) {
      this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.completarCamposTarea'));
      return;
    }

    //crear el objeto del comentario
    let comentar: ComentarInterface =
    {
      tarea: this.tareaDetalle!.iD_Tarea,
      userName: this.usuarioTarea,
      comentario: this.descripcionComentario,
    }

    this.isLoading = true;

    let resPrimerComentario: ResApiInterface = await this._nuevoComentario.postNuevoComentario(comentar);

    //Si el servico se ejecuta mal mostar mensaje
    if (!resPrimerComentario.status) {
      //ocultar carga
      this.isLoading = false;
      this._widgetsService.openSnackbar(this._translate.instant('pos.alertas.salioMal'));
      console.error(resPrimerComentario.response);
      console.error(resPrimerComentario.storeProcedure);
      return
    }
    //ID del comentario 
    let idComenario: number = resPrimerComentario.response.res;
    let urlFiles: string = this.empresa.absolutePathPicture;

    if (this.selectedFiles.length > 0) {

      let resFiles: ResApiInterface = await this._files.postFilesComment(
        this.selectedFiles,
        this.tareaDetalle!.iD_Tarea,
        idComenario,
        urlFiles
      );

      //Si el servico se ejecuta mal mostar mensaje
      if (!resFiles.status) {
        this.isLoading = false;
        this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.archivosNoCargados'));
        console.error(resFiles.response);
        console.error(resFiles.storeProcedure);
        return;
      };

      // this.isLoading = false;
    };

    //armar nuevo comentario
    let comentario: ComentarioInterface = {
      tarea_Comentario: idComenario,
      tarea: this.tareaDetalle!.iD_Tarea,
      comentario: this.descripcionComentario,
      fecha_Hora: new Date,
      userName: this.usuarioTarea,
      nameUser: this.usuarioTarea,
    }

    //objetos del comentario
    let archivos: ObjetoInterface[] = []

    for (let index = 0; index < this.selectedFiles.length; index++) {
      const element = this.selectedFiles[index];
      let archivo: ObjetoInterface = {
        objeto_Nombre: element.name,
        objeto_Size: '',
        objeto_URL: '',
        tarea_Comentario_Objeto: 1
      }
      archivos.push(archivo)
    }

    //crear comentario completo y enviarlo a la lista de los demas comentarios
    let comentarioDetalle: ComentariosDetalle = {
      comentario: comentario,
      files: archivos
    }


    //insertar el comentario en la lista de comentarios de la tarea.
    this.comentarios.push(comentarioDetalle);

    //Limoiar el comentario y la lista
    this.isLoading = false;
    this.descripcionComentario = '';
    this.selectedFiles = [];
    this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.comentarioCreado'));

  }

  eliminarArchivo(index: number) {
    if (index >= 0 && index < this.selectedFiles.length) {
      const newFiles = [...this.selectedFiles]; // Hacer una copia del array
      newFiles.splice(index, 1);
      this.selectedFiles = newFiles; // Asignar la nueva copia al array original
    }
  }

  onFilesSelected(event: any) {
    this.selectedFiles = event.target.files;
  }

  getColor(estado: string): string {
    if (estado.toLowerCase() === 'activo' && this.themeService.isDarkTheme == false) {
      return '#000';
    } else {
      if (estado.toLowerCase() === 'activo' && this.themeService.isDarkTheme == true) {
        return '#fff';
      }
      return 'gray';

      // Puedes manejar otros estados o devolver un color por defecto
    }
  }

  getFontWeight(estado: string): string {
    if (estado.toLowerCase() === 'activo' && this.themeService.isDarkTheme == false) {
      return 'bold';
    } else {
      if (estado.toLowerCase() === 'activo' && this.themeService.isDarkTheme == true) {
        return 'normal';
      }
      // Puedes manejar otros estados o devolver un valor por defecto
      return 'normal';
    }
  }

  //abrir dialgo y selecionar responsables
  actualizarTarea(): void {
    this.tareasGlobalService.idActualizar = 1;

    let tarea: DetalleInterface = {
      tarea: this.tareaDetalle!,
      comentarios: this.comentarios,
      invitados: this.usuariosInvitados,
      responsables: this.usuariosResposables
    }

    tarea.tarea = this.tareaDetalle!;
    tarea.comentarios = this.comentarios;
    tarea.invitados = this.invitados;
    tarea.responsables = this.responsables;

    let estado = this._dialog.open(ActualizarTareaComponent, { data: tarea })
    estado.afterClosed().subscribe(result => {
      if (result) {
        let nuevoComentario: ComentarInterface = result[1];

        let comentario: ComentarioInterface = {
          tarea_Comentario: 0,
          tarea: nuevoComentario.tarea,
          comentario: nuevoComentario.comentario,
          fecha_Hora: new Date(),
          userName: nuevoComentario.userName,
          nameUser: nuevoComentario.userName
        }

        let comentarioDetalle: ComentariosDetalle = {
          comentario: comentario,
          files: [],
        }

        this.comentarios.push(comentarioDetalle);

        let nuevoEstado: EstadoInterface = result[0];

        tarea.tarea.estado_Objeto = nuevoEstado.estado;
        tarea.tarea.tarea_Estado = nuevoEstado.descripcion;
      };
    });
  };

  actualizarPrioridad() {

    this.tareasGlobalService.idActualizar = 2;

    let tarea: DetalleInterface = {
      tarea: this.tareaDetalle!,
      comentarios: this.comentarios,
      invitados: this.usuariosInvitados,
      responsables: this.usuariosResposables
    }

    tarea.tarea = this.tareaDetalle!;
    tarea.comentarios = this.comentarios;
    tarea.invitados = this.invitados;
    tarea.responsables = this.responsables;

    let estado = this._dialog.open(ActualizarTareaComponent, { data: tarea })
    estado.afterClosed().subscribe(result => {
      if (result) {
        let nuevoComentario: ComentarInterface = result[1];

        let comentario: ComentarioInterface = {
          tarea_Comentario: 0,
          tarea: nuevoComentario.tarea,
          comentario: nuevoComentario.comentario,
          fecha_Hora: new Date(),
          userName: nuevoComentario.userName,
          nameUser: nuevoComentario.userName
        }

        let comentarioDetalle: ComentariosDetalle = {
          comentario: comentario,
          files: [],
        }

        this.comentarios.push(comentarioDetalle);

        let nuevaPrioridad: NivelPrioridadInterface = result[0];

        tarea.tarea.nivel_Prioridad = nuevaPrioridad.nivel_Prioridad;
        tarea.tarea.nom_Nivel_Prioridad = nuevaPrioridad.nombre;
      }
    });

  }

  // //Formato fecha
  // dateFormat(fecha: Date): string {
  //   let date = new Date(fecha); //nueva fecha
  //   let day = date.getDate(); //dia
  //   let month = date.getMonth() + 1; //mes (+1 para que sea del 1 al 12)
  //   let year = date.getFullYear(); //año
  //   //retorna la fecha en la 00/00/0000
  //   return `${day}/${month}/${year}`
  // }

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
    return `${day}/${month}/${year}     ${formatTime(date)}`;
  }

  verFechas() {
    console.log("----------Inicio-------------");
    console.log(this.tareaDetalle!.fecha_Inicial);
    console.log(this.tareaDetalle!.tarea_Fecha_Ini);
    console.log("------------Fin--------------");
    console.log(this.tareaDetalle!.fecha_Inicial);
    console.log(this.tareaDetalle!.tarea_Fecha_Fin);
    console.log("------------------------------");

  }

  cambiarResponsable(): void {

    this.tareasGlobalService.idUsuarios = 1;

    let tarea: DetalleInterface = {
      tarea: this.tareaDetalle!,
      comentarios: this.comentarios,
      invitados: this.usuariosInvitados,
      responsables: this.usuariosResposables
    }

    tarea.tarea = this.tareaDetalle!;
    tarea.comentarios = this.comentarios;
    tarea.invitados = this.invitados;
    tarea.responsables = this.responsables;

    let usuario = this._dialog.open(ActualizarUsuariosComponent, { data: tarea })
    usuario.afterClosed().subscribe(result => {
      if (result) {

        for (let index = 0; index < this.responsables.length; index++) {
          const element = this.responsables[index];
          if (element.estado.toLowerCase() == 'activo') {
            this.responsables[index].estado = 'inactivo';
            break;
          }
        }
        let responsable: ResponsablesInterface = result[0];
        //insertar registro al principio de  la lista de los responsales
        this.responsables.unshift(responsable);
        tarea.tarea.usuario_Responsable = result[1];
      };
    });
  };

  cambiarInvitados() {
    this.tareasGlobalService.idUsuarios = 2;
    let tarea: DetalleInterface = {
      tarea: this.tareaDetalle!,
      comentarios: this.comentarios,
      invitados: this.usuariosInvitados,
      responsables: this.usuariosResposables
    }

    tarea.tarea = this.tareaDetalle!;
    tarea.comentarios = this.comentarios;
    tarea.invitados = this.invitados;
    tarea.responsables = this.responsables;

    let usuario = this._dialog.open(ActualizarUsuariosComponent, { data: tarea })
    usuario.afterClosed().subscribe(result => {
      if (result) {
        let invitados: InvitadoInterface[] = result;
        let invitadosSet = new Set(this.invitados.map(invitado => invitado.userName));

        invitados.forEach(element => {
          // Verificar si el userName del elemento ya está presente en el conjunto
          if (!invitadosSet.has(element.userName)) {
            this.invitados.push(element);
            invitadosSet.add(element.userName);
          }
        });
      }
    });

  }

  async eliminarInvitado(usuario: InvitadoInterface, index: number) {

    let verificador = await this._widgetsService.openDialogActions(
      {
        title: this._translate.instant('crm.alertas.eliminarInvitado'),
        description: this._translate.instant('crm.alertas.mensajeEliminarInvitado'),
        verdadero: this._translate.instant('pos.botones.aceptar'),
        falso: this._translate.instant('pos.botones.cancelar')
      }
    );

    if (!verificador) return;

    let eliminar: EliminarUsuarioInterface = {
      tarea: 0,
      user_Res_Invi: "",
      user: "ds",
    }

    this.isLoading = true;
    let resEliminarInvitado: ResApiInterface = await this._usuarioService.postEliminarInvitado(eliminar, usuario.tarea_UserName);

    //Si el servico se ejecuta mal mostrar menaje
    this.isLoading = false;
    if (!resEliminarInvitado.status) {
      this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.invitadosNoActualizados'));
      console.error(resEliminarInvitado.response);
      console.error(resEliminarInvitado.storeProcedure);
      return
    };

    this.invitados.splice(index, 1);
    this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.invitadosActualizados'));

  }

  removeFile(index: number) {
    if (index >= 0 && index < this.selectedFiles.length) {
      const newFiles = [...this.selectedFiles]; // Hacer una copia del array
      newFiles.splice(index, 1);
      this.selectedFiles = newFiles; // Asignar la nueva copia al array original
    }
  }

}
