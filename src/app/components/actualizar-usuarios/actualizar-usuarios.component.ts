import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DetalleInterface } from 'src/app/displays/shrTarea_3/interfaces/detalle-tarea.interface';
import { EnviarInvitadoInterface, InvitadoInterface, UsuarioInvitadoInterface } from 'src/app/displays/shrTarea_3/interfaces/invitado.interface';
import { EnviarResponsableInterface, ResponsablesInterface } from 'src/app/displays/shrTarea_3/interfaces/responsable.interface';
import { BuscarUsuariosInterface } from 'src/app/displays/shrTarea_3/interfaces/usuario.interface';
import { LanguageInterface } from 'src/app/interfaces/language.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { indexDefaultLang, languagesProvider } from 'src/app/providers/languages.provider';
import { NotificationsService } from 'src/app/services/notifications.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { GlobalTareasService } from 'src/app/services/tarea-global.service';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-actualizar-usuarios',
  templateUrl: './actualizar-usuarios.component.html',
  styleUrls: ['./actualizar-usuarios.component.scss'],
  providers: [
    NotificationsService,
    UsuarioService,
  ]
})
export class ActualizarUsuariosComponent implements AfterViewInit {

  //para seleciconar el valor del texto del input
  @ViewChild('usuarioInput') usuarioInput?: ElementRef;
  habilitarBotones: boolean = false;

  usuariosSeleccionados: BuscarUsuariosInterface[] = []; // Lista para almacenar los usuarios seleccionados
  usuariosResInv: BuscarUsuariosInterface[] = [];
  usuarioTarea: string = '';

  languages: LanguageInterface[] = languagesProvider;
  activeLang: LanguageInterface;
  searchUser: string = ''; //variable que relizara la busqueda
  isLoading: boolean = false; //pantalla de carga
  busqueda: boolean = true; // pantalla de busqueda
  tarea!: DetalleInterface;
  buscarResponsable: boolean = false;
  invitadosTarea: EnviarInvitadoInterface[] = [];
  usuariosInvitados: BuscarUsuariosInterface[] = [];
  responsable!: ResponsablesInterface;


  noAsignado!: string;

  constructor(
    private _translate: TranslateService,
    private _usuarioService: UsuarioService,
    private _widgetsService: NotificationsService,
    public dialogRef: MatDialogRef<ActualizarUsuariosComponent>,
    @Inject(MAT_DIALOG_DATA) public tareaActualizar: DetalleInterface,
    public tareasGlobalService: GlobalTareasService,

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
    this.usuarioTarea = PreferencesService.user;

    this.loadData();
  }

  loadData() {
    if (this.tareasGlobalService.idUsuarios == 1) {
      if (this.tarea.responsables.length > 0) {
        for (let index = 0; index < this.tarea.responsables.length; index++) {
          const element = this.tarea.responsables[index];
          if (element.estado.toLowerCase() == "activo") {
            this.responsable = element;
            break;
          }
        }
      }
    }
  }

  //cerrar dialogo
  closeDialog(): void {
    this.dialogRef.close();
  }

  timer: any; //temporizador

  // onInputChange() {
  //   clearTimeout(this.timer); // Cancelar el temporizador existente
  //   this.timer = setTimeout(() => {
  //     this.buscarUsuarios(); // Función de filtrado que consume el servicio
  //   }, 1000); // Establecer el período de retardo en milisegundos (en este caso, 1000 ms o 1 segundo)
  // }

  async buscarUsuarios(): Promise<void> {

    //Consumo de api
    this.isLoading = true;
    let resUsuario: ResApiInterface = await this._usuarioService.getUsuariosFiltro(this.searchUser)

    //Si el servico se ejecuta mal mostrar menaje
    if (!resUsuario.status) {
      this.isLoading = false;
      this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.usuarios'));
      console.error(resUsuario.response);
      console.error(resUsuario.storeProcedure);
      this.usuariosResInv = [];
      return
    }
    //Si se ejecuto bien, obtener la respuesta de Api Buscar usuarios
    this.usuariosResInv = resUsuario.response;
    this.isLoading = false;
  }

  async agregarInvitados() {
    this.usuariosSeleccionados = this.usuariosResInv.filter(usuario => usuario.select);

    let agregados: InvitadoInterface[] = [];
    let usuariosRepetidos: string[] = [];

    for (const usuarioInvitado of this.usuariosSeleccionados) {
      // Verificar si el usuario ya está en la lista de invitados
      if (this.tarea.invitados.some(inv => inv.userName === usuarioInvitado.userName)) {
        usuariosRepetidos.push(usuarioInvitado.userName);
        continue;
      }

      let invitado: EnviarInvitadoInterface = {
        tarea: this.tarea.tarea.iD_Tarea,
        user_Res_Invi: usuarioInvitado.userName,
        user: this.usuarioTarea,
      };

      this.isLoading = true;
      let resInvitado: ResApiInterface = await this._usuarioService.postUsuarioInvitado(invitado);

      this.isLoading = false;
      if (!resInvitado.status) {
        this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.invitadosNoActualizados'));
        console.error(resInvitado.response);
        console.error(resInvitado.storeProcedure);
        return;
      }

      let enviarInvitado: UsuarioInvitadoInterface[] = resInvitado.response;

      let enviar: InvitadoInterface = {
        tarea_UserName: enviarInvitado[0].tarea_UserName,
        eMail: usuarioInvitado.email,
        userName: usuarioInvitado.userName,
      };

      agregados.push(enviar);
    }

    if (usuariosRepetidos.length > 0) {
      this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.repetidos'));
      // Mostrar alerta de usuarios repetidos
    } else {
      // Continuar con la operación
      this.dialogRef.close(agregados);
      this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.invitadosActualizados'));

    }
  }

  enviar() {
    this.usuariosSeleccionados = this.usuariosResInv.filter(usuario => usuario.select)
    this.dialogRef.close(this.usuariosSeleccionados);
  }

  async asignarResponsable(usuario: BuscarUsuariosInterface) {

    //validar que no sea el mismo usuario
    if (usuario.email == this.responsable.t_UserName) {
      this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.asignado'));
      return;
    }

    let usuarioResponsable: EnviarResponsableInterface = {
      tarea: this.tarea.tarea.iD_Tarea,
      user_Res_Invi: usuario.userName,
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

    let responsableN: ResponsablesInterface = resResponsable.response[0];

    let responsableSeleccionado: ResponsablesInterface = {
      t_UserName: usuario.email,
      estado: "activo",
      userName: responsableN.userName,
      fecha_Hora: responsableN.fecha_Hora,
      m_UserName: responsableN.m_UserName,
      m_Fecha_Hora: responsableN.m_Fecha_Hora,
      dHm: responsableN.dHm,
      consecutivo_Interno: responsableN.consecutivo_Interno
    }
    this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.responsableAsignado'));
    this.dialogRef.close([responsableSeleccionado, usuario.name]);
  }

  ngAfterViewInit() {
    this.focusAndSelectText();
  }

  focusAndSelectText() {
    const inputElement = this.usuarioInput!.nativeElement;
    inputElement.focus();

    // Añade un pequeño retraso antes de seleccionar el texto
    setTimeout(() => {
      inputElement.setSelectionRange(0, inputElement.value.length);
    }, 0);
  }

  deshabilitarBotonesTemp() {
    this.timer = setTimeout(() => {
      this.habilitarBotones = true;
    }, 250);
  }


}
