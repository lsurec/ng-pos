import { Component, Input, OnInit } from '@angular/core';
import { EventService } from 'src/app/services/event.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { Location } from '@angular/common';
import { ImpresoraFormatoInterface } from 'src/app/interfaces/impre-form.interface';
import { PrinterService } from 'src/app/services/printer.service';
import { HttpClient } from '@angular/common/http';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { TranslateService } from '@ngx-translate/core';
import { NotificationsService } from 'src/app/services/notifications.service';
import { DocumentService } from 'src/app/displays/prc_documento_3/services/document.service';
import { EncabezadoPrintInterface } from 'src/app/interfaces/encabezado-print.interface';
import { DetallePrintInterface } from 'src/app/interfaces/detalle-print.interface';


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

  formato: ImpresoraFormatoInterface = this.formatos[0]; //formato de impresion

  @Input() volver?: number;
  @Input() pantalla?: number;
  @Input() consecutivo?: number;

  vistaPrevia: boolean = false; //ver vista previa de configuraciones de la impresion
  imprimirNavegador: boolean = false; //para activar la impresion desde el navegador
  isLoading: boolean = false; //pantalla de carga
  copias: number = 1; //cantidad de copias a imprimir
  readonly regresar: number = 8; //id de la pantalla
  verError: boolean = false; //ocultar y mostrar pantalla de error


  constructor(
    private _eventService: EventService,
    private _location: Location,
    private _printerService: PrinterService,
    private _translate: TranslateService,
    private _notificationService: NotificationsService,
    private _documentService:DocumentService,

  ) {

    //evento para regresar desde error 

    this._eventService.regresarDesdeImpresion$.subscribe((eventData) => {
      this.verError = false;
    });

  }

  ngOnInit(): void {

    this.loadData();
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




  async imprimir() {

    if(!this.impresora && !this.formato){
      //TODO:Translate
      this._notificationService.openSnackbar("Selecciona una impresora y un formato para poder imprimir.");
    }


   
    const  docDefinition =  await this._printerService.getTestTemplate(); 

    const pdfDocGenerator = pdfMake.createPdf(docDefinition);

    pdfDocGenerator.getBlob(async (blob) => {
      // ...
      var pdfFile = new File([blob], 'ticket.pdf', { type: 'application/pdf' });

      this.isLoading = true;

      let resPrint: ResApiInterface = await this._printerService.postPrint(pdfFile, this.impresora!, 1);

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

      //TODO:Translate
      this._notificationService.openSnackbar("Documento procesado exitosamente.");
    });





  }




  async printDoc() {

    if(!this.impresora && !this.formato){
      //TODO:Translate
      this._notificationService.openSnackbar("Selecciona una impresora y un formato para poder imprimir.");
    }


    this.isLoading = true;
    
    let resEncabezado:ResApiInterface = await this._documentService.getEncabezados(
      this.user,
      this.token,
      this.consecutivo!,
    );
    
    if (!resEncabezado.status) {

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

      this.showError(resEncabezado);

      return;

    }

    let encabezados: EncabezadoPrintInterface[] = resEncabezado.response;

    let resDetalles: ResApiInterface = await this._documentService.getDetalles(
      this.user,
      this.token,
      this.consecutivo!,
    );

    if (!resDetalles.status) {

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

      this.showError(resDetalles);

      return;

    }

    let detalles: DetallePrintInterface[] = resDetalles.response;

    

    
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
      this.copias!--;
  
      if (this.copias! <= 0) {
        this.copias = 1;
      }
    }
  
    sumar() {
      this.copias!++;
    }
  
}
