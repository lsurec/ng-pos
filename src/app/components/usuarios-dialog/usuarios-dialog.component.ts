import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { BuscarUsuariosInterface } from 'src/app/displays/shrTarea_3/interfaces/usuario.interface';
import { LanguageInterface } from 'src/app/interfaces/language.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { indexDefaultLang, languagesProvider } from 'src/app/providers/languages.provider';
import { NotificationsService } from 'src/app/services/notifications.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-usuarios-dialog',
  templateUrl: './usuarios-dialog.component.html',
  styleUrls: ['./usuarios-dialog.component.scss'],
  providers: [
    UsuarioService,
    NotificationsService
  ]
})
export class UsuariosDialogComponent {

  usuariosSeleccionados: BuscarUsuariosInterface[] = []; // Lista para almacenar los usuarios seleccionados
  usuarios: BuscarUsuariosInterface[] = [];
  usuariosResInv: BuscarUsuariosInterface[] = [];

  languages: LanguageInterface[] = languagesProvider;
  activeLang: LanguageInterface;
  searchUser: string = ''; //variable que relizara la busqueda
  isLoading: boolean = false; //pantalla de carga
  busqueda: boolean = true; // pantalla de busqueda

  constructor(
    public dialogRef: MatDialogRef<UsuariosDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BuscarUsuariosInterface[],
    @Inject(MAT_DIALOG_DATA) public buscar: number, // Puedes cambiar 
    private _usuarioService: UsuarioService,
    private _widgetsService: NotificationsService,
    private _translate: TranslateService,
  ) {
    this.usuarios = data;
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
  }

  //cerrar dialogo
  closeDialog(): void {
    this.dialogRef.close();
  }

  enviar() {
    this.usuariosSeleccionados = this.usuariosResInv.filter(usuario => usuario.select)
    this.dialogRef.close(this.usuariosSeleccionados);
  }

  timer: any; //temporizador

  onInputChange() {
    clearTimeout(this.timer); // Cancelar el temporizador existente
    this.timer = setTimeout(() => {
      this.buscarUsuarios(); // Función de filtrado que consume el servicio
    }, 1000); // Establecer el período de retardo en milisegundos (en este caso, 1000 ms o 1 segundo)
  }

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

}
