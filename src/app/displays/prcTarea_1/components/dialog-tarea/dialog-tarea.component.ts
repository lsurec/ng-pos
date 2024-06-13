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
    TareaService
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
  detalles: boolean = true;

  constructor(
    //Declaracion de variables privadas
    @Inject(MAT_DIALOG_DATA) public data: DetalleInterfaceCalendario,
    private _files: CargarArchivosService,
    private _widgetsService: NotificationsService,
    public dialogRef: MatDialogRef<DialogTareaComponent>,
    private _nuevoComentario: CrearTareasComentariosService,
    private _tareaService: TareaService,
    private _translate: TranslateService,
    private _calendarioService: TareaCalendarioService,
  ) {
    //Nombre del usuario que inicio sesion.
    this.usuarioTarea = PreferencesService.user.toUpperCase();
    //comentarios de la tarea
    this.comentarios = data.comentarios
  };

  async loadData() {
    this.isLoading = true;
    this.detalles = false;
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
    this.comentarioDesc = '';
    this.selectedFiles = [];
    this.isLoading = false;
    this.detalles = true;
  }

  //cerrar dialogo
  closeDialog(): void {
    this.dialogRef.close();
  };

  onFilesSelected(event: any): void {
    this.selectedFiles = event.target.files;
  };

  removeFile(index: number) {
    if (index >= 0 && index < this.selectedFiles.length) {
      const newFiles = [...this.selectedFiles]; // Hacer una copia del array
      newFiles.splice(index, 1);
      this.selectedFiles = newFiles; // Asignar la nueva copia al array original
    }
  }
  
  validarComentario(): void {
    if (this.comentarioDesc.length === 0) {
      this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.completarCamposTarea'));
    } else {
      this.comentar();
    };
  };

  //Crear nuevo comentario 
  async comentar(): Promise<void> {
    //crear el objeto del comentario
    let comentarioN: ComentarInterface =
    {
      tarea: this.data.tarea.tarea,
      userName: this.usuarioTarea,
      comentario: this.comentarioDesc,
    };
    //cargar pantalla
    this.isLoading = true;
    this.detalles = false;

    //Consumo de api
    let resNuevoComentario: ResApiInterface = await this._nuevoComentario.postNuevoComentario(comentarioN)

    //Si el servico se ejecuta mal mostar mensaje
    if (!resNuevoComentario.status) {
      //ocultar carga
      this.isLoading = false;
      this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.salioMal'));
      console.error(resNuevoComentario.response);
      console.error(resNuevoComentario.storeProcedure);
      return
    }

    let idComenario: LoginInterface = resNuevoComentario.response;


    //armar nuevo comentario
    let comentario: ComentarioInterface = {
      tarea_Comentario: +idComenario.message,
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
    };

    //insertar el comentario en la lista de comentarios de la tarea.
    this.comentarios.push(comentarioDetalle);

    //lista de archivos esta vacia:
    if (this.selectedFiles.length == 0) {
      this.isLoading = false;
      this.detalles = true;
      this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.comentarioCreado'));
      return;
    }

    //Consumo de api files
    let resFiles: ResApiInterface = await this._files.postFilesComment(this.selectedFiles, this.data.tarea.tarea, comentarioDetalle.comentario.tarea_Comentario);

    //Si el servico se ejecuta mal mostar mensaje
    this.isLoading = false;
    if (!resFiles.status) {
      this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.archivosNoCargados'));
      console.error(resFiles.response);
      console.error(resFiles.storeProcedure);
      return;
    }

    //mostrar el ID del comentario creado correctamente
    this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.comentarioCreado'));
    this.comentarioDesc = '';
    this.selectedFiles = [];
    this.detalles = true;

  };

  //mostrar un mensaje de no disponible 
  //cuando la informacion de los detalles esta vacia
  resolveObject(objeto: any): string {
    if (objeto == null)
      return this._translate.instant('crm.alertas.noAsignado');
    return objeto;
  }

}
