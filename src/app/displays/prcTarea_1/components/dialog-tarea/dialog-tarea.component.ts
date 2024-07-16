import { Component, Inject } from '@angular/core';
import { CargarArchivosService } from 'src/app/services/archivo.service';
import { CrearTareasComentariosService } from 'src/app/services/crear-tarea-comentario.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { TareaCalendarioService } from '../../services/calendario.service';
import { ComentariosDetalle, DetalleInterfaceCalendario } from '../../interfaces/detalle.interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { TareaService } from 'src/app/displays/shrTarea_3/services/tarea.service';
import { TranslateService } from '@ngx-translate/core';
import { ComentarInterface, ComentarioInterface } from 'src/app/interfaces/comentario.interface';
import { LoginInterface } from 'src/app/interfaces/login.interface';
import { ObjetoInterface } from 'src/app/displays/shrTarea_3/interfaces/objetos-comentario.interface';
import { EstadoService } from 'src/app/displays/shrTarea_3/services/estado.service';
import { NivelPrioridadService } from 'src/app/displays/shrTarea_3/services/prioridad.service';
import { EstadoInterface } from 'src/app/displays/shrTarea_3/interfaces/estado-tarea.interface';
import { NivelPrioridadInterface } from 'src/app/displays/shrTarea_3/interfaces/prioridad-tarea.interface';
import { ActualizarEstadoInterface, ActualizarNivelPrioridadInterface } from 'src/app/displays/shrTarea_3/interfaces/actualizar-tarea.interface';
import { ActualizarTareaService } from 'src/app/services/actualizar-tarea.service';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';

@Component({
  selector: 'app-dialog-tarea',
  templateUrl: './dialog-tarea.component.html',
  styleUrls: ['./dialog-tarea.component.scss'],
  providers: [
    // inyeccion de servicios a utilizar
    NotificationsService,
    CargarArchivosService,
    CrearTareasComentariosService,
    TareaCalendarioService,
    TareaService,
    EstadoService,
    NivelPrioridadService,
    ActualizarTareaService
  ]
})
export class DialogTareaComponent {

  comentarios: ComentariosDetalle[] = [];
  selectedFiles: File[] = [];
  comentarioDesc: string = '';
  usuarioTarea: string = '';
  fechaHoy: Date = new Date();
  //mostrra y ocultar pantallas
  isLoading: boolean = false;

  estadosTarea: EstadoInterface[] = [];
  estadoTarea: EstadoInterface | null = null; //estado de la tarea

  prioridadesTarea: NivelPrioridadInterface[] = [];
  prioridadTarea: NivelPrioridadInterface | null = null;

  empresa: EmpresaInterface = PreferencesService.empresa;


  constructor(
    //Declaracion de variables privadas
    @Inject(MAT_DIALOG_DATA) public data: DetalleInterfaceCalendario,
    private _files: CargarArchivosService,
    private _widgetsService: NotificationsService,
    public dialogRef: MatDialogRef<DialogTareaComponent>,
    private _nuevoComentario: CrearTareasComentariosService,
    private _tareaService: TareaService,
    private _translate: TranslateService,
    private _estadoService: EstadoService,
    private _prioridad: NivelPrioridadService,
    private _actualizarTareaService: ActualizarTareaService,


  ) {
    //Nombre del usuario que inicio sesion.
    this.usuarioTarea = PreferencesService.user.toUpperCase();
    //comentarios de la tarea
    this.comentarios = data.comentarios

    this.getEstado();
    this.getNivelPrioridad();
  };

  async loadData() {

    this.comentarioDesc = '';
    this.selectedFiles = [];
    this.isLoading = true;

    await this.getEstado();
    await this.getNivelPrioridad();
    await this.getComentarios();

    this.isLoading = false;
  }

  async getComentarios() {
    this.isLoading = true;
    //Consumo de api
    let resComentarios: ResApiInterface = await this._tareaService.getComentarios(this.data.tarea.tarea)

    //Si el servico se ejecuta mal mostrar menaje
    if (!resComentarios.status) {
      this.isLoading = false;
      this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.salioMal'));
      console.error(resComentarios.response);
      console.error(resComentarios.storeProcedure);
      return
    }

    //Si se ejecuto bien, obtener la respuesta de apiComentarios
    let comentarios: ComentarioInterface[] = resComentarios.response

    //limpiar la lista para que no se vuelvan a repetir los comentarios
    this.comentarios = [];

    for (const comentario of comentarios) {
      let resFiles: ResApiInterface = await this._tareaService.getComentariosObjeto(comentario.tarea_Comentario, comentario.tarea)
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
      this.comentarios.push(itemComentario);

    }

    this.isLoading = false;
  }

  //cerrar dialogo
  closeDialog(): void {
    this.dialogRef.close();
  };

  onFilesSelected(event: any): void {
    this.selectedFiles = event.target.files;
  };

  eliminarArchivo(index: number) {
    if (index >= 0 && index < this.selectedFiles.length) {
      const newFiles = [...this.selectedFiles]; // Hacer una copia del array
      newFiles.splice(index, 1);
      this.selectedFiles = newFiles; // Asignar la nueva copia al array original
    }
  }

  async comentar() {

    if (!this.comentarioDesc) {
      this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.completarCamposTarea'));
      return;
    }

    //crear el objeto del comentario
    let comentar: ComentarInterface =
    {
      tarea: this.data.tarea.tarea,
      userName: this.usuarioTarea,
      comentario: this.comentarioDesc,
    };

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

      //Consumo de api files
      let resFiles: ResApiInterface = await this._files.postFilesComment(
        this.selectedFiles,
        this.data.tarea.tarea,
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
      tarea: this.data.tarea.tarea,
      comentario: this.comentarioDesc,
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
    this.comentarioDesc = '';
    this.selectedFiles = [];
    this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.comentarioCreado'));

  }

  //mostrar un mensaje de no disponible 
  //cuando la informacion de los detalles esta vacia
  resolveObject(objeto: any): string {
    if (objeto == null)
      return this._translate.instant('crm.alertas.noAsignado');
    return objeto;
  }


  async getEstado(): Promise<void> {
    this.isLoading = true;
    //Consumo de api
    let resEstados: ResApiInterface = await this._estadoService.getEstado();
    //Si el servico se ejecuta mal mostar mensaje
    if (!resEstados.status) {
      this.isLoading = false;

      this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.salioMal'));
      console.error(resEstados.response);
      console.error(resEstados.storeProcedure);
      return;
    };
    //Guardar Estados de la tarea
    this.estadosTarea = resEstados.response;

    for (let index = 0; index < this.estadosTarea.length; index++) {
      const element = this.estadosTarea[index];
      if (element.estado == this.data.tarea.estado) {
        this.estadoTarea = element;
        break;
      }
    }
    this.isLoading = false;

  };

  async nuevoEstadoTarea() {

    //validar que el estado seleccuinado no sea el mismo que el actual
    if (this.estadoTarea?.estado == this.data.tarea.estado) {
      this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.estadoIgual'));
      return;
    }

    let actualizacion: ActualizarEstadoInterface =
    {
      tarea: this.data.tarea.tarea,
      userName: this.usuarioTarea,
      estado: this.estadoTarea!.estado
    }
    this.isLoading = true;
    let resNuevoEstado: ResApiInterface = await this._actualizarTareaService.postNuevoEstado(actualizacion);

    this.isLoading = false;
    if (!resNuevoEstado.status) {
      this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.salioMal'));
      console.error(resNuevoEstado.response);
      console.error(resNuevoEstado.storeProcedure);
      return;
    };

    //crear el objeto del comentario
    let comentarioEstado: ComentarInterface =
    {
      tarea: this.data.tarea.tarea,
      userName: this.usuarioTarea,
      comentario: `Cambio de estado ( ${this.estadoTarea!.descripcion} ) realizado por usuario ${actualizacion.userName.toLowerCase()}`,
    }


    let comentario: ComentarioInterface = {
      tarea_Comentario: 0,
      tarea: comentarioEstado.tarea,
      comentario: comentarioEstado.comentario,
      fecha_Hora: new Date(),
      userName: comentarioEstado.userName,
      nameUser: comentarioEstado.userName
    }

    let comentarioDetalle: ComentariosDetalle = {
      comentario: comentario,
      files: [],
    }

    this.comentarios.push(comentarioDetalle);

    this.data.tarea.estado = this.estadoTarea!.estado;

    this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.estadoActualizado'));

  }

  //Obtener los niveles de prioridad asignables a la tarea
  async getNivelPrioridad(): Promise<void> {
    this.isLoading = true;
    //Consumo de api
    let resApi = await this._prioridad.getNivelPrioridad();
    //Si el servico se ejecuta mal mostar mensaje
    if (!resApi.status) {
      this.isLoading = false;
      this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.salioMal'));
      console.error(resApi.response);
      return;
    };
    //Guardar Niveles de prioridad de la tarea
    this.prioridadesTarea = resApi.response;

    for (let index = 0; index < this.prioridadesTarea.length; index++) {
      const element = this.prioridadesTarea[index];
      if (element.nivel_Prioridad == this.data.tarea.nivel_Prioridad) {
        this.prioridadTarea = element;
        break;
      }
    }
    this.isLoading = false;
  };

  async nuevoNivelPrioridad() {

    //validar que el nivel de prioridad seleccuinado no sea el mismo que el actual
    if (this.prioridadTarea?.nivel_Prioridad == this.data.tarea.nivel_Prioridad) {
      this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.estadoIgual'));
      return;
    }

    let actualizacion: ActualizarNivelPrioridadInterface =
    {
      tarea: this.data.tarea.tarea,
      userName: this.usuarioTarea,
      prioridad: this.prioridadTarea!.nivel_Prioridad
    }

    this.isLoading = true;
    let resNuevaPrioridadrioridad: ResApiInterface = await this._actualizarTareaService.postNuevoNivelPrioridad(actualizacion);

    this.isLoading = false;
    if (!resNuevaPrioridadrioridad.status) {
      this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.salioMal'));
      console.error(resNuevaPrioridadrioridad.response);
      console.error(resNuevaPrioridadrioridad.storeProcedure);
      return;
    };

    //crear el objeto del comentario
    let comentarioPrioridad: ComentarInterface =
    {
      tarea: this.data.tarea.tarea,
      userName: this.usuarioTarea,
      comentario: `Cambio de Nivel de Prioridad ( ${this.prioridadTarea!.descripcion} ) realizado por usuario ${actualizacion.userName.toLowerCase()}`,
    }


    let comentario: ComentarioInterface = {
      tarea_Comentario: 0,
      tarea: comentarioPrioridad.tarea,
      comentario: comentarioPrioridad.comentario,
      fecha_Hora: new Date(),
      userName: comentarioPrioridad.userName,
      nameUser: comentarioPrioridad.userName
    }

    let comentarioDetalle: ComentariosDetalle = {
      comentario: comentario,
      files: [],
    }

    this.comentarios.push(comentarioDetalle);


    this.data.tarea.nivel_Prioridad = this.prioridadTarea!.nivel_Prioridad;
    this.data.tarea.nom_Nivel_Prioridad = this.prioridadTarea!.nombre;


    this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.prioridadActualizada'));
  }

  formatText(text: string): string {
    return text.replace(/\n/g, '<br>');
  }
}
