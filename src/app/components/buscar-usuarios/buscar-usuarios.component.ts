import { Component, Inject } from '@angular/core';
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
export class BuscarUsuariosComponent {
  usuariosSeleccionados: BuscarUsuariosInterface[] = []; // Lista para almacenar los usuarios seleccionados
  usuarios: BuscarUsuariosInterface[] = [];
  usuariosResInv: BuscarUsuariosInterface[] = [];
  searchUser: string = ''; //variable que relizara la busqueda
  isLoading: boolean = false; //pantalla de carga
  busqueda: boolean = true; // pantalla de busqueda

  constructor(
    public dialogRef: MatDialogRef<BuscarUsuariosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BuscarUsuariosInterface[],
    @Inject(MAT_DIALOG_DATA) public buscar: number, // Puedes cambiar 
    private _usuarioService: UsuarioService,
    private _widgetsService: NotificationsService,
    private _translate: TranslateService,
    public tareasGlobalService: GlobalTareasService,
  ) {
    this.usuarios = data;
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
