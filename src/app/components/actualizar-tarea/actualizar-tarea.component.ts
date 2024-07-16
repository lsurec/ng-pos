import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ActualizarDetalleTareaInterface, ActualizarEstadoInterface, ActualizarNivelPrioridadInterface } from 'src/app/displays/shrTarea_3/interfaces/actualizar-tarea.interface';
import { DetalleInterface } from 'src/app/displays/shrTarea_3/interfaces/detalle-tarea.interface';
import { EstadoInterface } from 'src/app/displays/shrTarea_3/interfaces/estado-tarea.interface';
import { NivelPrioridadInterface } from 'src/app/displays/shrTarea_3/interfaces/prioridad-tarea.interface';
import { EstadoService } from 'src/app/displays/shrTarea_3/services/estado.service';
import { NivelPrioridadService } from 'src/app/displays/shrTarea_3/services/prioridad.service';
import { ComentarInterface } from 'src/app/interfaces/comentario.interface';
import { LanguageInterface } from 'src/app/interfaces/language.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { indexDefaultLang, languagesProvider } from 'src/app/providers/languages.provider';
import { ActualizarTareaService } from 'src/app/services/actualizar-tarea.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { GlobalTareasService } from 'src/app/services/tarea-global.service';

@Component({
  selector: 'app-actualizar-tarea',
  templateUrl: './actualizar-tarea.component.html',
  styleUrls: ['./actualizar-tarea.component.scss'],
  providers: [
    EstadoService,
    NivelPrioridadService,
    NotificationsService,
    ActualizarTareaService,
  ]
})
export class ActualizarTareaComponent {

  languages: LanguageInterface[] = languagesProvider;
  activeLang: LanguageInterface;

  estadosTarea: EstadoInterface[] = [];
  estadoTarea: EstadoInterface | null = null; //estado de la tarea

  prioridadesTarea: NivelPrioridadInterface[] = [];
  prioridadTarea: NivelPrioridadInterface | null = null;

  usuarioTarea: string = PreferencesService.user; //Usuario de la sesion
  isLoading: boolean = false; //pantalla de carga 
  tarea!: DetalleInterface;

  constructor(
    private _estadoService: EstadoService,
    private _translate: TranslateService,
    private _widgetsService: NotificationsService,
    private _actualizarTareaService: ActualizarTareaService,
    public dialogRef: MatDialogRef<ActualizarTareaComponent>,
    @Inject(MAT_DIALOG_DATA) public buscar: number,
    @Inject(MAT_DIALOG_DATA) public tareaActualizar: DetalleInterface,
    public tareasGlobalService: GlobalTareasService,
    private _prioridad: NivelPrioridadService,

  ) {
    this.tarea = tareaActualizar;
    //Buscar el idioma guardado en le servicio
    let getLanguage = PreferencesService.lang;
    if (!getLanguage) {
      //sino se encuentra asignar el idioma por defecto
      this.activeLang = languagesProvider[indexDefaultLang];
    } else {
      //si se encuentra asignar el idioma seleccionado
      let getIndexLang: number = +getLanguage;
      this.activeLang = languagesProvider[getIndexLang];
    }
    this.usuarioTarea = PreferencesService.user.toUpperCase();

    this.loadData();

  }

  loadData() {
    if (this.tareasGlobalService.idActualizar == 1) {
      this.getEstado();
    }

    if (this.tareasGlobalService.idActualizar == 2) {

      this.getNivelPrioridad();
    }
  }

  //cerrar dialogo
  closeDialog(): void {
    this.dialogRef.close();
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
      if (element.estado == this.tarea.tarea.estado_Objeto) {
        this.estadoTarea = element;
        break;
      }
    }
    this.isLoading = false;

  };

  async nuevoEstadoTarea() {
    //validar que el estado seleccuinado no sea el mismo que el actual
    if (this.estadoTarea?.estado == this.tarea.tarea.estado_Objeto) {
      // this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.estadoIgual'));
      return;
    }

    let actualizacion: ActualizarEstadoInterface =
    {
      tarea: this.tarea.tarea.iD_Tarea,
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
    let comentario: ComentarInterface =
    {
      tarea: this.tarea.tarea.iD_Tarea,
      userName: this.usuarioTarea,
      comentario: `Cambio de estado ( ${this.estadoTarea!.descripcion} ) realizado por usuario ${actualizacion.userName.toLowerCase()}`,
    }

    this.dialogRef.close([this.estadoTarea, comentario]);
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
      if (element.nivel_Prioridad == this.tarea.tarea.nivel_Prioridad) {
        this.prioridadTarea = element;
        break;
      }
    }
    this.isLoading = false;
  };

  async nuevoNivelPrioridad() {

    //validar que el nivel de prioridad seleccuinado no sea el mismo que el actual
    if (this.prioridadTarea?.nivel_Prioridad == this.tarea.tarea.nivel_Prioridad) {
      // this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.estadoIgual'));
      return;
    }

    let actualizacion: ActualizarNivelPrioridadInterface =
    {
      tarea: this.tarea.tarea.iD_Tarea,
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
    let comentario: ComentarInterface =
    {
      tarea: this.tarea.tarea.iD_Tarea,
      userName: this.usuarioTarea,
      comentario: `Cambio de Nivel de Prioridad ( ${this.prioridadTarea!.descripcion} ) realizado por usuario ${actualizacion.userName.toLowerCase()}`,
    }

    this.dialogRef.close([this.prioridadTarea, comentario]);

    this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.prioridadActualizada'));
  }

}
