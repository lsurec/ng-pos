import { CargoAbono, Documento, Transaccion } from '../../interfaces/doc-estructura.interface';
import { Component, OnInit } from '@angular/core';
import { DocumentService } from '../../services/document.service';
import { EventService } from 'src/app/services/event.service';
import { FacturaService } from '../../services/factura.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { PostDocumentInterface } from '../../interfaces/post-document.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { TranslateService } from '@ngx-translate/core';
import { Certificador, Cliente, DocPrintModel, DocumentoData, Empresa, Fechas, Item, Montos, ObservacionesRef, Pago, PoweredBy } from 'src/app/interfaces/doc-print.interface';
import { DetallePrintInterface } from 'src/app/interfaces/detalle-print.interface';
import { EncabezadoPrintInterface } from 'src/app/interfaces/encabezado-print.interface';
import { PagoPrintInterface } from 'src/app/interfaces/pago-print.interface';
import { ClienteInterface } from '../../interfaces/cliente.interface';
import { TipoTransaccionInterface } from '../../interfaces/tipo-transaccion.interface';
import { CurrencyPipe } from '@angular/common';
import { PrinterService } from 'src/app/services/printer.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import { GlobalConvertService } from 'src/app/displays/listado_Documento_Pendiente_Convertir/services/global-convert.service';
import { UpdateDocInterface } from 'src/app/displays/listado_Documento_Pendiente_Convertir/interfaces/update-doc.interface';
import { ReceptionService } from 'src/app/displays/listado_Documento_Pendiente_Convertir/services/reception.service';
import { UpdateRefInterface } from 'src/app/displays/listado_Documento_Pendiente_Convertir/interfaces/update-ref-interface';
import { NewTransactionInterface } from '../../interfaces/new-transaction.interface';
import { PrintFormatService } from '../../services/print-format.service';
import { CotizacionInterface } from '../../interfaces/cotizacion.interface';
import { FelService } from '../../services/fel.service';
import { APIInterface } from '../../interfaces/api.interface';
import { DocXMLInterface } from '../../interfaces/doc-xml.interface';
import { DataInfileInterface } from '../../interfaces/data.infile.interface';
import { CredencialInterface } from '../../interfaces/credencial.interface';
import { ParamUpdateXMLInterface } from '../../interfaces/param-update-xml.interface';
import { DataUserService } from '../../services/data-user.service';
import { TypeErrorInterface } from 'src/app/interfaces/type-error.interface';
import { RetryService } from 'src/app/services/retry.service';
import { DataFelInterface } from '../../interfaces/data-fel.interface';

@Component({
  selector: 'app-resumen-documento',
  templateUrl: './resumen-documento.component.html',
  styleUrls: ['./resumen-documento.component.scss'],
  providers: [
    DocumentService,
    CurrencyPipe,
    PrinterService,
    ReceptionService,
    PrintFormatService,
    FelService,
  ]
})
export class ResumenDocumentoComponent implements OnInit {
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  // isLoading: boolean = false; //pantalla de carga
  // readonly regresar: number = 4; //id de la pantalla
  // // verError: boolean = false; //ocultar y mostrar pantalla de error

  // volver: number = 2;//volver a resumen desde configurar impresora



  // constructor(
  //   //instancias de los servicios necesarios
  //   private _eventService: EventService,
  //   public facturaService: FacturaService,
  //   private _notificationService: NotificationsService,
  //   private _documentService: DocumentService,
  //   private _translate: TranslateService,
  //   private currencyPipe: CurrencyPipe,
  //   private _printService: PrinterService,
  //   public globalConvertService: GlobalConvertService,
  //   private _recpetionService: ReceptionService,
  //   private _printFormatService: PrintFormatService,
  //   private _felService: FelService,
  //   private _dataUserService: DataUserService,
  //   private _retryService: RetryService,

  // ) {

  //   //suscripcion a eventos del hijo (pantalla error)
  //   this._eventService.regresarResumen$.subscribe((eventData) => {
  //     this.facturaService.verError = false;
  //   });
  //   //regreesar desde configuracion de la impresora con vista previa activa
  //   this._eventService.regresarResumen$.subscribe((eventData) => {
  //     this.verVistaPrevia = false;
  //   });

  // }

  // ngOnInit(): void {
  //   // console.log(this.consecutivoDoc);

  // }

  // //Regresar al modulo de facturacion (tabs)
  // goBack() {
  //   this._eventService.verDocumentoEvent(true);
  // }

  // //visualizar pantalla de error
  // mostrarError(res: ResApiInterface) {

  //   //fecha actual
  //   let dateNow: Date = new Date();

  //   //Detalles del error
  //   let error = {
  //     date: dateNow,
  //     description: res.response,
  //     storeProcedure: res.storeProcedure,
  //     url: res.url,

  //   }

  //   //guardar error en preferencias
  //   PreferencesService.error = error;

  //   //ver pantalla de error
  //   this.facturaService.verError = true;
  // }






  // async showError(res: ResApiInterface) {

  //   let verificador = await this._notificationService.openDialogActions(
  //     {
  //       title: this._translate.instant('pos.alertas.salioMal'),
  //       description: this._translate.instant('pos.alertas.error'),
  //       verdadero: this._translate.instant('pos.botones.informe'),
  //       falso: this._translate.instant('pos.botones.aceptar'),
  //     }
  //   );

  //   if (!verificador) return;

  //   this.mostrarError(res);

  // }

  // async printCotizacion() {

  //   this.isLoading = true;

  //   let resCot: ResApiInterface = await this._printFormatService.getReportCotizacion(
  //     this.user,
  //     this.token,
  //     this.consecutivoDoc,
  //   );

  //   if (!resCot.status) {
  //     this.isLoading = false;

  //     let verificador = await this._notificationService.openDialogActions(
  //       {
  //         title: this._translate.instant('pos.alertas.salioMal'),
  //         description: this._translate.instant('pos.alertas.error'),
  //         verdadero: this._translate.instant('pos.botones.informe'),
  //         falso: this._translate.instant('pos.botones.aceptar'),
  //       }
  //     );

  //     if (!verificador) return;

  //     this.mostrarError(resCot);

  //     return;
  //   }

  //   this.isLoading = false;


  //   let dataPrint: CotizacionInterface[] = resCot.response;


  //   console.log(dataPrint);





  // }



  // findTipoProducto(tipoTra: number) {

  //   let transacciones: TipoTransaccionInterface[] = this.facturaService.tiposTransaccion;



  //   //buscar tipo de trabsaccion dependientdo del tipo de producto
  //   for (let i = 0; i < transacciones.length; i++) {
  //     const element = transacciones[i];
  //     if (tipoTra == element.tipo) {
  //       //Devolver tipo de transaccion correspondiente al tipo de producto
  //       return element.tipo_Transaccion;
  //     }
  //   }

  //   //si no encontró el tipo de producto retorna 0
  //   return 0;
  // }








}
