import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
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
  ]
})
export class BuscarIdReferenciaComponent implements OnInit {
  //para seleciconar el valor del texto del input
  @ViewChild('inputSearch') inputSearch?: ElementRef;
  enableButtons: boolean = false;

  referencias: IDReferenciaInterface[] = [];

  searchIdReferencia: string = '';
  isLoading: boolean = false; //pantalla de carga

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public dialogRef: MatDialogRef<BuscarIdReferenciaComponent>,
    private _referenciasService: IdReferenciaService,
    private widgetsService: NotificationsService,
    private translate: TranslateService,
  ) {

  }


  ngOnInit(): void {
    this.deshabilitarBotonesTemp();
  }

  //cerrar dialogo
  closeDialog(): void {
    this.dialogRef.close();
  }

  timer: any; //temporizador

  async buscarIdReferencia(): Promise<void> {

    if (this.searchIdReferencia.length == 0) {
      this.widgetsService.openSnackbar(this.translate.instant('pos.alertas.ingreseCaracter'));
      return;
    }
    //Consumo de api
    this.isLoading = true;
    let resIdReferencia: ResApiInterface = await this._referenciasService.getIdReferencia(this.searchIdReferencia)

    //Si el servico se ejecuta mal mostrar menaje
    if (!resIdReferencia.status) {
      this.isLoading = false;
      this.widgetsService.openSnackbar(this.translate.instant('crm.alertas.idReferencia'));
      console.error(resIdReferencia.response);
      console.error(resIdReferencia.storeProcedure);
      this.referencias = [];
      return
    }
    //Si se ejecuto bien, obtener la respuesta de Api Buscar usuarios
    this.referencias = resIdReferencia.response;
    if (this.referencias.length == 0) {
      this.widgetsService.openSnackbar(this.translate.instant('crm.alertas.idReferencia'));
    }
    this.isLoading = false;
  }

  focusAndSelectText() {
    const inputElement = this.inputSearch!.nativeElement;
    inputElement.focus();

    // Añade un pequeño retraso antes de seleccionar el texto
    setTimeout(() => {
      inputElement.setSelectionRange(0, inputElement.value.length);
    }, 0);
  }

  deshabilitarBotonesTemp() {
    this.timer = setTimeout(() => {
      this.enableButtons = true;
    }, 250);
  }
}
