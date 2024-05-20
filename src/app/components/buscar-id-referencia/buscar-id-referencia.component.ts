import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { IDReferenciaInterface } from 'src/app/displays/shrTarea_3/interfaces/id-referencia.interface';
import { IdReferenciaService } from 'src/app/displays/shrTarea_3/services/id-referencia.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { NotificationsService } from 'src/app/services/notifications.service';

@Component({
  selector: 'app-buscar-id-referencia',
  templateUrl: './buscar-id-referencia.component.html',
  styleUrls: ['./buscar-id-referencia.component.scss'],
  providers: [
    IdReferenciaService,
    NotificationsService
  ]
})
export class BuscarIdReferenciaComponent {
  referencias: IDReferenciaInterface[] = [];
  referenciaSeleccionada!: IDReferenciaInterface;

  searchIdReferencia: string = '';
  searchUser: string = ''; //variable que relizara la busqueda
  isLoading: boolean = false; //pantalla de carga
  busqueda: boolean = true; // pantalla de busqueda

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public dialogRef: MatDialogRef<BuscarIdReferenciaComponent>,
    private _referenciasService: IdReferenciaService,
    private _widgetsService: NotificationsService,
    private _translate: TranslateService,
  ) {

  }

  //cerrar dialogo
  closeDialog(): void {
    console.log("que pasa");

    this.dialogRef.close();

    console.log("y aqui");

  }

  enviar() {
    // this.usuariosResponsables = this.usuarios.filter(usuario => usuario.select)
    // this.dialogRef.close(this.usuariosResponsables);
  }


  timer: any; //temporizador

  onInputChange() {
    clearTimeout(this.timer); // Cancelar el temporizador existente
    this.timer = setTimeout(() => {
      this.buscarIdReferencia(); // Función de filtrado que consume el servicio
    }, 1000); // Establecer el período de retardo en milisegundos (en este caso, 1000 ms o 1 segundo)
  }

  async buscarIdReferencia(): Promise<void> {

    //Consumo de api
    this.isLoading = true;
    let resIdReferencia: ResApiInterface = await this._referenciasService.getIdReferencia(this.searchIdReferencia)

    //Si el servico se ejecuta mal mostrar menaje
    if (!resIdReferencia.status) {
      this.isLoading = false;
      this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.idReferencia'));
      console.error(resIdReferencia.response);
      console.error(resIdReferencia.storeProcedure);
      this.referencias = [];
      return
    }
    //Si se ejecuto bien, obtener la respuesta de Api Buscar usuarios
    this.referencias = resIdReferencia.response;
    if (this.referencias.length == 0) {
      this._widgetsService.openSnackbar(this._translate.instant('crm.alertas.idReferencia'));
    }
    this.isLoading = false;
  }
}
