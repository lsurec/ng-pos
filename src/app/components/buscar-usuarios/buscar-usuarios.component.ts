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

  listaTemporal: BuscarUsuariosInterface[] = [];

  constructor(
    public dialogRef: MatDialogRef<BuscarUsuariosComponent>,
    private _usuarioService: UsuarioService,
    private widgetsService: NotificationsService,
    private _translate: TranslateService,
    public tareasGlobalService: GlobalTareasService,
    @Inject(MAT_DIALOG_DATA) public data: BuscarUsuariosInterface[],
  ) {
    //asignar los usuarios que ya han sido selecciondos 
    this.invitados = data;
  }

  ngOnInit(): void {
    this.deshabilitarBotonesTemp();
  }

  //cerrar dialogo
  closeDialog(): void {
    this.dialogRef.close();
  }

  enviar() {
    // Asumiendo que 'this.invitados' y 'this.usuarios' son listas de objetos usuario,
    // y cada usuario tiene una propiedad única como 'id'.
    let usuariosDuplicados: BuscarUsuariosInterface[] = [];

    this.listaTemporal.forEach(usuario => {
      usuario.select = true; // Aseguramos que select esté en true
      // Verificar si el usuario ya está en la lista de invitados
      if (this.invitados.some(invitado => invitado.userName === usuario.userName)) {
        // Si el usuario ya está invitado, agregar a la lista de duplicados
        usuariosDuplicados.push(usuario);
      } else {
        // Agregar a la lista de invitados si no está duplicado
        this.invitados.push(usuario);
      }
    });
    // Si hay usuarios duplicados, mostrar la notificación
    if (usuariosDuplicados.length > 0) {
      this.widgetsService.openSnackbar("Uno o más usuarios duplicados no se agregaron.");
    }

    // Cerrar el diálogo con los usuarios seleccionados
    this.dialogRef.close(this.listaTemporal);
  }


  async buscarUsuarios(): Promise<void> {

    if (this.searchUser.length == 0) {
      this.widgetsService.openSnackbar(this._translate.instant('pos.alertas.ingreseCaracter'));
      return;
    }

    // Consumo de API
    this.isLoading = true;
    let resUsuario: ResApiInterface = await this._usuarioService.getUsuariosFiltro(this.searchUser);

    // Si el servicio se ejecuta mal, mostrar mensaje
    if (!resUsuario.status) {
      this.isLoading = false;
      this.widgetsService.openSnackbar(this._translate.instant('crm.alertas.usuarios'));
      console.error(resUsuario.response);
      console.error(resUsuario.storeProcedure);
      this.usuarios = [];
      return;
    }

    // Si se ejecutó bien, obtener la respuesta de la API Buscar usuarios
    this.usuarios = resUsuario.response;

    if (this.tareasGlobalService.buscarUsuarios == 2) {
      // Validar si hay invitados
      if (this.invitados.length > 0) {
        // Recorrer la lista de usuarios y marcar los seleccionados
        this.usuarios.forEach(usuario => {
          this.invitados.forEach(invitado => {
            if (usuario.email === invitado.email || usuario.userName === invitado.userName || usuario.name === invitado.name) {
              usuario.select = true;
            }
          });
        });
      }

      //validar si hay invitados en la lista temporal

      if (this.listaTemporal.length > 0) {
        // Recorrer la lista de usuarios y marcar los seleccionados
        this.usuarios.forEach(usuario => {
          this.listaTemporal.forEach(invitado => {
            if (usuario.email === invitado.email || usuario.userName === invitado.userName || usuario.name === invitado.name) {
              usuario.select = true;
            }
          });
        });
      }
    }

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

  seleccionar(usuario: BuscarUsuariosInterface) {
    if (usuario.select) {
      // Verificar si ya está en la listaTemporal
      const index = this.listaTemporal.findIndex(u => u.userName.toLowerCase() == usuario.userName.toLowerCase());
      if (index === -1) {
        // Si no está, lo agregamos
        this.listaTemporal.push(usuario);
      }
    } else {
      // Si se desmarca, lo eliminamos de la listaTemporal
      const index = this.listaTemporal.findIndex(u => u.userName.toLowerCase() == usuario.userName.toLowerCase());
      if (index !== -1) {
        this.listaTemporal.splice(index, 1);
      }
    }
  }


}
