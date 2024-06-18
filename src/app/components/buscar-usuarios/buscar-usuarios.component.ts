import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { BuscarUsuariosInterface } from 'src/app/displays/shrTarea_3/interfaces/usuario.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { NotificationsService } from 'src/app/services/notifications.service';
import { GlobalTareasService } from 'src/app/services/tarea-global.service';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-buscar-usuarios',
  templateUrl: './buscar-usuarios.component.html',
  styleUrls: ['./buscar-usuarios.component.scss'],
  providers: [
    UsuarioService,
  ]
})
export class BuscarUsuariosComponent implements OnInit {

  //para seleciconar el valor del texto del input
  @ViewChild('usuarioInput') usuarioInput?: ElementRef;

  searchUser: string = ''; //variable que relizara la busqueda
  usuarios: BuscarUsuariosInterface[] = []; //usuarios encontrados de la busqueda
  invitados: BuscarUsuariosInterface[] = []; //invitados
  busqueda: boolean = true; // pantalla de busqueda
  isLoading: boolean = false; //pantalla de carga
  habilitarBotones: boolean = false;
  timer: any; //temporizador

  usuariosSeleccionados: BuscarUsuariosInterface[] = [];

  constructor(
    public dialogRef: MatDialogRef<BuscarUsuariosComponent>,
    private _usuarioService: UsuarioService,
    private widgetsService: NotificationsService,
    private _translate: TranslateService,
    public tareasGlobalService: GlobalTareasService,
  ) {

  }

  ngOnInit(): void {
    this.deshabilitarBotonesTemp();
  }

  //cerrar dialogo
  closeDialog(): void {
    this.dialogRef.close();
  }

  enviar() {
    this.usuariosSeleccionados = this.usuarios.filter(usuario => usuario.select)
    this.dialogRef.close(this.usuariosSeleccionados);
  }

  async buscarUsuarios(): Promise<void> {

    if (this.searchUser.length == 0) {
      this.widgetsService.openSnackbar(this._translate.instant('pos.alertas.ingreseCaracter'));
      return;
    }

    //Consumo de api
    this.isLoading = true;
    let resUsuario: ResApiInterface = await this._usuarioService.getUsuariosFiltro(this.searchUser)

    //Si el servico se ejecuta mal mostrar menaje
    if (!resUsuario.status) {
      this.isLoading = false;
      this.widgetsService.openSnackbar(this._translate.instant('crm.alertas.usuarios'));
      console.error(resUsuario.response);
      console.error(resUsuario.storeProcedure);
      this.usuarios = [];
      return
    }
    //Si se ejecuto bien, obtener la respuesta de Api Buscar usuarios
    this.usuarios = resUsuario.response;
    this.isLoading = false;
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
