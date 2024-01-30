import { Component, Input, OnInit } from '@angular/core';
import { EventService } from 'src/app/services/event.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { Location } from '@angular/common';
import { ImpresoraFormatoInterface } from 'src/app/interfaces/impre-form.interface';
import { PrinterService } from 'src/app/services/printer.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TranslateService } from '@ngx-translate/core';
import { NotificationsService } from 'src/app/services/notifications.service';
import { DocumentService } from 'src/app/displays/prc_documento_3/services/document.service';
import { DocPrintModel } from 'src/app/interfaces/doc-print.interface';
import { FacturaService } from 'src/app/displays/prc_documento_3/services/factura.service';
import { UtilitiesService } from 'src/app/services/utilities.service';


(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-printer-configuration',
  templateUrl: './printer-configuration.component.html',
  styleUrls: ['./printer-configuration.component.scss'],
  providers: [
    PrinterService,
    DocumentService,
  ],

})
export class PrinterConfigurationComponent implements OnInit {

  impresoras: string[] = [];
  impresora?: string; //impresora para imprimir
  user: string = PreferencesService.user; //usuario de la sesion
  token: string = PreferencesService.token; //token de la sesion


  formatos: ImpresoraFormatoInterface[] = [
    {
      id: 1,
      nombre: "Ticket 80 mm (TMU)",
      checked: false
    },

  ]

  formato?: ImpresoraFormatoInterface = this.formatos[0]; //formato de impresion

  @Input() volver?: number;
  @Input() pantalla?: number;
  @Input() document?: DocPrintModel;

  vistaPrevia: boolean = false; //ver vista previa de configuraciones de la impresion
  imprimirNavegador: boolean = false; //para activar la impresion desde el navegador
  isLoading: boolean = false; //pantalla de carga
  copias: string = "1"; //cantidad de copias a imprimir
  readonly regresar: number = 8; //id de la pantalla
  verError: boolean = false; //ocultar y mostrar pantalla de error


  constructor(
    private _eventService: EventService,
    private _location: Location,
    private _printerService: PrinterService,
    private _translate: TranslateService,
    private _notificationService: NotificationsService,
  ) {

    //evento para regresar desde error 

    this._eventService.regresarDesdeImpresion$.subscribe((eventData) => {
      this.verError = false;
    });

  }

  ngOnInit(): void {


    if (!PreferencesService.copies) {
      this.copias = "1";
      PreferencesService.copies = this.copias;
    } else {
      this.copias = PreferencesService.copies;
    }

    if (!PreferencesService.localPrint) {
      this.imprimirNavegador = false;
    } else {
      this.imprimirNavegador = true;
    }


    if (!PreferencesService.vistaPrevia) {
      this.vistaPrevia = false;
    } else {
      this.vistaPrevia = true;
    }


    this.loadData();
  }


  preview() {
    if (this.vistaPrevia) {
      PreferencesService.vistaPrevia = "1";
    } else {
      PreferencesService.vistaPrevia = "";
    }
  }

  localPrint() {
    if (this.imprimirNavegador) {
      PreferencesService.localPrint = "1";
    } else {
      PreferencesService.localPrint = "";
    }
  }



  selectPrint() {
    PreferencesService.impresora = this.impresora!;
  }


  async loadData() {

    this.isLoading = true;
    let resApi: ResApiInterface = await this._printerService.getPrinters();

    this.isLoading = false;

    if (!resApi.status) {

      this.isLoading = false;


      let verificador = await this._notificationService.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.informe'),
          falso: this._translate.instant('pos.botones.aceptar'),
        }
      );

      if (!verificador) return;

      this.showError(resApi);

      return;

    }

    this.impresoras = resApi.response;


    for (let i = 0; i < this.impresoras.length; i++) {
      const impresora = this.impresoras[i];
      if (PreferencesService.impresora == impresora) {
        this.impresora = impresora;
        break;
      }

    }



  }




  async printTest() {

    if (!this.impresora && !this.formato) {
      this._notificationService.openSnackbar(this._translate.instant('pos.factura.selecciona_impresora_formato'));
    }


    this.isLoading = true;

    let isOnline: ResApiInterface = await this._printerService.getStatusPrint(this.impresora!);


    if (!isOnline.status) {
      this.isLoading = false;

      this._notificationService.openSnackbar(`${this.impresora!}  ${this._translate.instant('pos.factura.no_disponible')}`);
      return;

    }


    const docDefinition = await this._printerService.getTestTemplate();

    const pdfDocGenerator = pdfMake.createPdf(docDefinition);

    pdfDocGenerator.getBlob(async (blob) => {
      // ...
      var pdfFile = new File([blob], 'ticket.pdf', { type: 'application/pdf' });

      //TODO:copias
      let resPrint: ResApiInterface = await this._printerService.postPrint(pdfFile, this.impresora!, PreferencesService.copies);

      this.isLoading = false;


      if (!resPrint.status) {

        this.isLoading = false;

        let verificador = await this._notificationService.openDialogActions(
          {
            title: this._translate.instant('pos.alertas.salioMal'),
            description: this._translate.instant('pos.alertas.error'),
            verdadero: this._translate.instant('pos.botones.informe'),
            falso: this._translate.instant('pos.botones.aceptar'),
          }
        );

        if (!verificador) return;

        this.showError(resPrint);

        return;

      }

      this._notificationService.openSnackbar(this._translate.instant('pos.factura.documento_procesado'));

    });





  }




  async printDoc() {

    this.isLoading = true;


    let resStatus: ResApiInterface = await this._printerService.getStatus(PreferencesService.port);

    if (!resStatus.status) {
      this.isLoading = false;
      this._notificationService.openSnackbar(this._translate.instant('pos.alertas.sin_servicio_impresion'));

      const docDefinition = await this._printerService.getReport(this.document!);

      pdfMake.createPdf(docDefinition).print();

      return;


    }

    if (!this.impresora && !this.formato) {
      this.isLoading = false;

      this._notificationService.openSnackbar(this._translate.instant('pos.factura.selecciona_impresora_formato'));

    }



    let isOnline: ResApiInterface = await this._printerService.getStatusPrint(this.impresora!);


    if (!isOnline.status) {
      this.isLoading = false;

      this._notificationService.openSnackbar(`${this.impresora!} ${this._translate.instant('pos.factura.no_disponible')}`);
      return;

    }

    const docDefinition = await this._printerService.getReport(this.document!);




    const pdfDocGenerator = pdfMake.createPdf(docDefinition);

    // pdfMake.createPdf(docDefinition).open();

    // return;
    pdfDocGenerator.getBlob(async (blob) => {
      // ...
      var pdfFile = new File([blob], 'ticket.pdf', { type: 'application/pdf' });

      this.isLoading = true;

      let resPrint: ResApiInterface = await this._printerService.postPrint(
        pdfFile,
        this.impresora!,
        PreferencesService.copies
      );

      this.isLoading = false;


      if (!resPrint.status) {

        this.isLoading = false;

        let verificador = await this._notificationService.openDialogActions(
          {
            title: this._translate.instant('pos.alertas.salioMal'),
            description: this._translate.instant('pos.alertas.error'),
            verdadero: this._translate.instant('pos.botones.informe'),
            falso: this._translate.instant('pos.botones.aceptar'),
          }
        );

        if (!verificador) return;

        this.showError(resPrint);

        return;

      }

      this._notificationService.openSnackbar(this._translate.instant('pos.factura.documento_procesado'));

    });


  }



  showError(res: ResApiInterface) {

    // fecha actual
    let dateNow: Date = new Date();

    //Detalles del error
    let error = {
      date: dateNow,
      description: res.response,
      storeProcedure: res.storeProcedure,
      url: res.url,

    }

    //guardar error en preferencias
    PreferencesService.error = error;

    this.verError = true;

  }


  //regresar a home
  goBack() {

    switch (this.volver) {
      case 1:
        //desde home
        this._eventService.regresarHomedesdeImpresorasEvent(true);
        break;

      case 2:
        //desde resumen del documento     
        this._eventService.regresarResumenEvent(true);
        break;
      default:
        this._location.back();
        break;
    }
  }

  restar() {

    //verifica que la cantidad sea numerica
    if (UtilitiesService.convertirTextoANumero(this.copias) == null) {
      this._notificationService.openSnackbar(this._translate.instant('pos.alertas.cantidadPositiva'));
      return;
    }

    //cantidad numerica
    let cantidad = UtilitiesService.convertirTextoANumero(this.copias);


    //disminuir cantidad en 1
    cantidad!--;

    //si es menor o igual a uno, volver a 1 y mostrar
    if (cantidad! <= 1) {
      cantidad = 1;
    }

    //guarda la nueva cantidad
    this.copias = cantidad!.toString();

    PreferencesService.copies = this.copias;

  }

  sumar() {

    //verifica que la cantidad sea numerica
    if (UtilitiesService.convertirTextoANumero(this.copias) == null) {
      this._notificationService.openSnackbar(this._translate.instant('pos.alertas.cantidadPositiva'));
      return;
    }

    //canitdad en numero
    let cantidad = UtilitiesService.convertirTextoANumero(this.copias);

    //aumentar cantidad
    cantidad!++;

    //nueva cantidad
    this.copias = cantidad!.toString();

    PreferencesService.copies = this.copias;


  }

  changeCopies() {

    //verificar que la cantidad sea numerica
    if (UtilitiesService.convertirTextoANumero(this.copias) == null) {
      this._notificationService.openSnackbar(this._translate.instant('pos.alertas.cantidadPositiva'));
      return;
    }

    //calcular total de la trnsaccion

    PreferencesService.copies = this.copias;

  }

}
