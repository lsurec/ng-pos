import { Component } from '@angular/core';
import { GlobalConvertService } from '../../services/global-convert.service';
import { components } from 'src/app/providers/componentes.provider';
import { EventService } from 'src/app/services/event.service';
import { ReceptionService } from '../../services/reception.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { NotificationsService } from 'src/app/services/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { PrintConvertInterface } from '../../interfaces/print-convert.interface';
import { ClienteInterface } from 'src/app/displays/prc_documento_3/interfaces/cliente.interface';
import { Empresa, DocumentoData, Cliente, Item, Montos, Pago, Certificador, PoweredBy, DocPrintModel } from 'src/app/interfaces/doc-print.interface';
import { CurrencyPipe } from '@angular/common';
import { PrinterService } from 'src/app/services/printer.service';
import * as pdfMake from 'pdfmake/build/pdfmake';

@Component({
  selector: 'app-details-dest-docs',
  templateUrl: './details-dest-docs.component.html',
  styleUrls: ['./details-dest-docs.component.scss'],
  providers: [
    CurrencyPipe,
    ReceptionService,
    PrinterService,
  ]
})
export class DetailsDestDocsComponent {


  user: string = PreferencesService.user;
  token: string = PreferencesService.token;

  constructor(
    public globalConvertSrevice: GlobalConvertService,
    private _receptionService: ReceptionService,
    private _notificationsService: NotificationsService,
    private _translate: TranslateService,
    private currencyPipe: CurrencyPipe,
    private _printService: PrinterService,

  ) {

  }


  async loadData() {
    this.globalConvertSrevice.detialsDocDestination = [];

    this.globalConvertSrevice.isLoading = true;

    let res: ResApiInterface = await this._receptionService.getDetallesDocDestino(
      this.token,
      this.user,
      this.globalConvertSrevice.docDestinoSelect!.documento,
      this.globalConvertSrevice.docDestinoSelect!.tipoDocumento,
      this.globalConvertSrevice.docDestinoSelect!.serieDocumento,
      this.globalConvertSrevice.docDestinoSelect!.empresa,
      this.globalConvertSrevice.docDestinoSelect!.localizacion,
      this.globalConvertSrevice.docDestinoSelect!.estacion,
      this.globalConvertSrevice.docDestinoSelect!.fechaReg,
    )

    this.globalConvertSrevice.isLoading = false;

    if (!res.status) {
      this.showError(res);
      return;
    }

    this.globalConvertSrevice.detialsDocDestination = res.response;
  }

  async loadOrigin() {

    this.globalConvertSrevice.docsOrigin = [];


    let res: ResApiInterface = await this._receptionService.getPendindgDocs(
      this.user,
      this.token,
      this.globalConvertSrevice.docSelect!.tipo_Documento,
      this.globalConvertSrevice.formatStrFilterDate(this.globalConvertSrevice.fechaInicial!),
      this.globalConvertSrevice.formatStrFilterDate(this.globalConvertSrevice.fechaFinal!),
    );


    if (!res.status) {
      this.globalConvertSrevice.isLoading = false;

      this.showError(res);

      return;

    }

    this.globalConvertSrevice.docsOrigin = res.response;
  }


  async printDoc() {
    this.globalConvertSrevice.isLoading = true;

    let res: ResApiInterface = await this._receptionService.getDataPrint(
      this.token,
      this.user,
      this.globalConvertSrevice.docDestinoSelect!.documento,
      this.globalConvertSrevice.docDestinoSelect!.tipoDocumento,
      this.globalConvertSrevice.docDestinoSelect!.serieDocumento,
      this.globalConvertSrevice.docDestinoSelect!.empresa,
      this.globalConvertSrevice.docDestinoSelect!.localizacion,
      this.globalConvertSrevice.docDestinoSelect!.estacion,
      this.globalConvertSrevice.docDestinoSelect!.fechaReg,

    );


    if (!res.status) {
      this.globalConvertSrevice.isLoading = false;

      this.showError(res);

      return;

    }

    let printData: PrintConvertInterface[] = res.response;


    if (printData.length == 0) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.sinDatosImprimir'));
      return;
    }


    let encabezado: PrintConvertInterface = printData[0];



    let empresa: Empresa = {
      direccion: encabezado.empresa_Direccion ?? "",
      nit: encabezado.empresa_Nit ?? "",
      nombre: encabezado.empresa_Nombre ?? "",
      razonSocial: encabezado.razon_Social ?? "",
      tel: encabezado.empresa_Telefono ?? "",
    }



    let documento: DocumentoData = {
      titulo: encabezado.tipo_Documento?.toUpperCase()!,
      descripcion: this._translate.instant('pos.factura.documento_generico'),
      fechaCert: "",
      serie: "",
      no: "",
      autorizacion: "",
      noInterno: `${encabezado.serie_Documento}-${encabezado.id_Documento}`,
    }


    let currentDate: Date = new Date();

    let cliente: Cliente = {
      nombre: encabezado?.documento_Nombre ?? "",
      direccion: encabezado?.documento_Direccion ?? "",
      nit: encabezado?.documento_Nit ?? "",
      tel: encabezado?.documento_Telefono ?? "",
      fecha: currentDate,
    }

    let cargo: number = 0;
    let descuento: number = 0;
    let subtotal: number = 0;
    let total: number = 0;

    let items: Item[] = [];


    printData.forEach(detail => {


      if ((detail.cantidad ?? 0) == 0 && (detail.monto ?? 0) > 0) {
        //4 cargo
        cargo += detail.monto ?? 0;
      } else if (detail.cantidad == 0 && (detail.monto ?? 0) < 0) {
        //5 descuento
        descuento += (detail.monto ?? 0);
      } else {
        //cualquier otro
        subtotal += (detail.monto ?? 0);
      }

      items.push(
        {
          descripcion: detail.des_Producto ?? "",
          cantidad: detail.cantidad ?? 0,
          unitario: this.currencyPipe.transform((detail.cantidad ?? 0) > 0 ? (detail.monto ?? 0) / (detail.cantidad ?? 0) : detail.monto, ' ', 'symbol', '2.2-2')!,
          total: this.currencyPipe.transform(detail.monto, ' ', 'symbol', '2.2-2')!,
        }
      );
    });

    total += (subtotal + cargo) + descuento;

    let montos: Montos = {
      subtotal: this.currencyPipe.transform(subtotal, ' ', 'symbol', '2.2-2')!,
      cargos: this.currencyPipe.transform(cargo, ' ', 'symbol', '2.2-2')!,
      descuentos: this.currencyPipe.transform(descuento, ' ', 'symbol', '2.2-2')!,
      total: this.currencyPipe.transform(total, ' ', 'symbol', '2.2-2')!,
      totalLetras: encabezado.monto_Letras!.toUpperCase(),
    }


    let vendedor: string = encabezado.atendio ?? "";


    let certificador: Certificador;

    let mensajes: string[] = [
      //TODO: Mostrar frase
      // "**Sujeto a pagos trimestrales**",
      this._translate.instant('pos.factura.sin_devoluciones')
    ];

    let poweredBy: PoweredBy = {
      nombre: "Desarrollo Moderno de Software S.A.",
      website: "www.demosoft.com.gt",
    }


    this.globalConvertSrevice.docPrint = {
      empresa: empresa,
      documento: documento,
      cliente: cliente,
      items: items,
      montos: montos,
      pagos: [],
      vendedor: vendedor,
      certificador: certificador!,
      observacion: encabezado.observacion_1 ?? "",
      mensajes: mensajes,
      poweredBy: poweredBy,
    }

    //Verificar que ya se haya configurado antes 
    if (!PreferencesService.port) {

      let resStatus5000: ResApiInterface = await this._printService.getStatus("5000");

      if (!resStatus5000.status) {
        let resStatus5001: ResApiInterface = await this._printService.getStatus("5001");

        if (!resStatus5001.status) {

          this.globalConvertSrevice.isLoading = false;


          this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.sin_servicio_impresion'));


          const docDefinition = await this._printService.getReport(this.globalConvertSrevice.docPrint);

          pdfMake.createPdf(docDefinition).print();

          return;
        } else {

          PreferencesService.port = "5001";
        }

      } else {
        PreferencesService.port = "5000";
      }

      this.globalConvertSrevice.isLoading = false;


      this.globalConvertSrevice.mostrarImpresion();

    } else {


      if (PreferencesService.localPrint) {
        this.globalConvertSrevice.isLoading = false;

        const docDefinition = await this._printService.getReport(this.globalConvertSrevice.docPrint);

        pdfMake.createPdf(docDefinition).print();

        return;
      }

      if (!PreferencesService.vistaPrevia) {
        this.globalConvertSrevice.isLoading = false;


        this.globalConvertSrevice.mostrarImpresion();
        return;

      }


      let resStatus: ResApiInterface = await this._printService.getStatus(PreferencesService.port);


      if (!resStatus.status) {

        this.globalConvertSrevice.isLoading = false;


        this._notificationsService.openSnackbarAction(
          this._translate.instant('pos.alertas.sin_servicio_impresion'),
          this._translate.instant('pos.botones.imprimir'),
          async () => {
            const docDefinition = await this._printService.getReport(this.globalConvertSrevice.docPrint!);

            pdfMake.createPdf(docDefinition).print();
          }
        );


        return;
      }


      let isOnline: ResApiInterface = await this._printService.getStatusPrint(PreferencesService.impresora);


      if (!isOnline.status) {
        this.globalConvertSrevice.isLoading = false;


        this._notificationsService.openSnackbar(`${PreferencesService.impresora}  ${this._translate.instant('pos.factura.no_disponible')}`);

        this._notificationsService.openSnackbarAction(
          `${PreferencesService.impresora}  ${this._translate.instant('pos.factura.no_disponible')}`,
          this._translate.instant('pos.botones.imprimir'),
          async () => {
            const docDefinition = await this._printService.getReport(this.globalConvertSrevice.docPrint!);

            pdfMake.createPdf(docDefinition).print();
          }
        );


        return;

      }

      const docDefinition = await this._printService.getReport(this.globalConvertSrevice.docPrint);

      const pdfDocGenerator = pdfMake.createPdf(docDefinition);


      // return;
      pdfDocGenerator.getBlob(async (blob) => {
        // ...
        var pdfFile = new File([blob], 'ticket.pdf', { type: 'application/pdf' });


        let resPrint: ResApiInterface = await this._printService.postPrint(
          pdfFile,
          PreferencesService.impresora,
          PreferencesService.copies
        );

        this.globalConvertSrevice.isLoading = false;


        if (!resPrint.status) {

          this.globalConvertSrevice.isLoading = false;

          this.showError(resPrint);

          return;

        }
        this._notificationsService.openSnackbar(this._translate.instant('pos.factura.documento_procesado'));

      });

    }


    this.globalConvertSrevice.isLoading = false;



  }


  async showError(res: ResApiInterface) {

    let verificador = await this._notificationsService.openDialogActions(
      {
        title: this._translate.instant('pos.alertas.salioMal'),
        description: this._translate.instant('pos.alertas.error'),
        verdadero: this._translate.instant('pos.botones.informe'),
        falso: this._translate.instant('pos.botones.aceptar'),
      }
    );

    if (!verificador) return;

    let dateNow: Date = new Date(); //fecha del error

    //Crear error
    let error: ErrorInterface = {
      date: dateNow,
      description: res.response,
      storeProcedure: res.storeProcedure,
      url: res.url,
    }

    PreferencesService.error = error;

    this.globalConvertSrevice.mostrarError(13);

    return;
  }




}
