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

  isLoading: boolean = false; //pantalla de carga
  readonly regresar: number = 4; //id de la pantalla
  // verError: boolean = false; //ocultar y mostrar pantalla de error

  volver: number = 2;//volver a resumen desde configurar impresora

  user: string = PreferencesService.user; //usuario de la sesion
  token: string = PreferencesService.token; //token de la sesion
  empresa: number = PreferencesService.empresa.empresa; //empresa de la sesion
  estacion: number = PreferencesService.estacion.estacion_Trabajo; //estacion de la sesion
  documento: number = this.facturaService.tipoDocumento!; //documento de la sesion
  serie: string = this.facturaService.serie!.serie_Documento; //serie de la sesion
  tipoCambio: number = PreferencesService.tipoCambio; //tipo cambio dispoible

  verVistaPrevia: boolean = false;

  consecutivoDoc: number = -1;
  docPrint?: DocPrintModel;

  constructor(
    //instancias de los servicios necesarios
    private _eventService: EventService,
    public facturaService: FacturaService,
    private _notificationService: NotificationsService,
    private _documentService: DocumentService,
    private _translate: TranslateService,
    private currencyPipe: CurrencyPipe,
    private _printService: PrinterService,
    public globalConvertService: GlobalConvertService,
    private _recpetionService: ReceptionService,
    private _printFormatService: PrintFormatService,
    private _felService: FelService,
    private _dataUserService: DataUserService,


  ) {

    //suscripcion a eventos del hijo (pantalla error)
    this._eventService.regresarResumen$.subscribe((eventData) => {
      this.facturaService.verError = false;
    });
    //regreesar desde configuracion de la impresora con vista previa activa
    this._eventService.regresarResumen$.subscribe((eventData) => {
      this.verVistaPrevia = false;
    });

  }
  ngOnInit(): void {
    // console.log(this.consecutivoDoc);

  }

  //Regresar al modulo de facturacion (tabs)
  goBack() {
    this._eventService.verDocumentoEvent(true);
  }


  //visualizar pantalla de error
  mostrarError(res: ResApiInterface) {

    //fecha actual
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

    //ver pantalla de error
    this.facturaService.verError = true;
  }

  //Confirmar documento
  async sendDoc() {
    //carga los pasos
    // this.facturaService.isStepLoading = true;
    // return

    //validar si es editar doc
    if (this.globalConvertService.editDoc) {
      this.modifyDoc();
      return;
    }


    //Si se permite fel entrar al proceso
    if (this.facturaService.valueParametro(349)) {
      // if (DataUserService.switchState) {
      //alerta FEL no disponible
      // this._notificationService.openSnackbar(this._translate.instant('pos.alertas.certificacionNoDisponible'));

      await this.sendDocument();

      //Empezar proceso FEL 
      this.felProcess();


    } else {
      //Enviar documento a tbl_documento estructura
      this.sendDocument()
    }



  }


  async felProcess() {

    //TODO:Asigna id del api en base de datos, el api es un maestr generico que devuleve cualquier token
    // let apiToken: number = 0;
    // let tokenFel: string = "";


    //TODO:Replece for value in database
    let uuidDoc = ''

    //TODO:Asiganr el api 
    let apiUse: string = "";

    //TODO:Reemplzar y parametrizar
    let certificador: number = 1;


    this.isLoading = true;


    //buscar documento, plantilla xml

    let resXMlCert: ResApiInterface = await this._felService.getDocXmlCert(
      this.user,
      this.token,
      this.consecutivoDoc,
    )


    if (!resXMlCert.status) {
      this.isLoading = false;
      this.showError(resXMlCert);
      return;
    }


    let templatesXMl: DocXMLInterface[] = resXMlCert.response;


    if (templatesXMl.length == 0) {

      //TODO: Translate}
      this.isLoading = false;
      resXMlCert.response = "No se pudo encontrar el docuemnto xml para certificar.";
      this.showError(resXMlCert);
      return;
    }


    uuidDoc = templatesXMl[0].d_Id_Unc;


    //buscar las credenciales del certificador
    let resCredenciales: ResApiInterface = await this._felService.getCredenciales(
      certificador,
      this.empresa,
      this.user,
      this.token,
    )


    if (!resCredenciales.status) {
      this.isLoading = false;
      this.showError(resCredenciales);
      return;
    }

    //TODO:Api que se va a usar debe buscarse y asignarse aqui 
    let credecniales: CredencialInterface[] = resCredenciales.response;

    for (let i = 0; i < credecniales.length; i++) {
      const element = credecniales[i];


      if (element.campo_Nombre == "apiUnificadaInfile") {

        apiUse = element.campo_Valor;
        break;

      }

    }

    // //buscar api en catalogo api 
    // let resApi: ResApiInterface = await this._felService.getApi(this.user, this.token, apiUse);

    // if (!resApi.status) {
    //   this.isLoading = false;
    //   this.showError(resApi);
    //   return;
    // }

    //apis encontradas
    // let apis: APIInterface[] = resApi.response;

    // //verificar que hay elemnetos en el catalogo de apis
    // if (apis.length == 0) {
    //   //TODO:Translate
    //   this.isLoading = false;
    //   resApi.response = `No se encontró el api con consecutivo ${apiUse}, verifica su existencia en el catalogo de apis.`

    //   this.showError(resApi);

    //   return;
    // }


    // //api que se va a usar
    // let api: APIInterface = apis[0];

    //buscar documento xml para porcesar

    // let resDocXml: ResApiInterface = await this._felService.getDocXml(this.user, this.token, uuidDoc);

    // if (!resDocXml.status) {
    //   this.isLoading = false;
    //   this.showError(resDocXml);
    //   return;
    // }

    // let docsXMl: DocXMLInterface[] = resDocXml.response;


    // //verificar que hay documentos que procesar
    // if (docsXMl.length == 0) {
    //   //TODO:Translate
    //   this.isLoading = false;
    //   resDocXml.response = `No se encontró el documento XML para procesar.`

    //   this.showError(resDocXml);

    //   return;
    // }


    // let docXml: DocXMLInterface = docsXMl[0];


    //TODO:Proceso para obtene el token de un api aqui
    //Omitido por falat de tiempo


    //Obtener parametros del api
    // let resParamsApi: ResApiInterface = await this._felService.getParamsApi(
    //   apiUse, this.user, this.token,
    // )


    // if (!resParamsApi.status) {
    //   this.isLoading = false;
    //   this.showError(resParamsApi);
    //   return;
    // }


    //Buscvar credenciales de infile
    let llaveApi: string = "";
    let llaveFirma: string = "";
    let usuarioApi: string = "";
    let usuarioFirma: string = "";

    for (let i = 0; i < credecniales.length; i++) {
      const element = credecniales[i];

      switch (element.campo_Nombre) {
        case "LlaveApi":
          llaveApi = element.campo_Valor;

          break;
        case "LlaveFirma":
          llaveFirma = element.campo_Valor;
          break;

        case "UsuarioApi":
          usuarioApi = element.campo_Valor;
          break;
        case "UsuarioFirma":
          usuarioFirma = element.campo_Valor;
          break;
        default:
          break;
      }

    }


    let paramFel: DataInfileInterface = {
      docXML: templatesXMl[0].xml_Contenido,
      identificador: uuidDoc,
      llaveApi: llaveApi,
      llaveFirma: llaveFirma,
      usuarioApi: usuarioApi,
      usuarioFirma: usuarioFirma,
    }


    let resCertDoc: ResApiInterface = await this._felService.postInfile(
      apiUse,
      paramFel,
      this.token,
    )


    if (!resCertDoc.status) {
      this.isLoading = false;
      this.showError(resCertDoc);
      return;
    }


    let doc: any = resCertDoc.response;

    let paramUpdate: ParamUpdateXMLInterface = {
      documento: doc,
      documentoCompleto: doc,
      usuario: this.user,
      uuid: uuidDoc,
    }


    //actualizar
    let resUpdateXml: ResApiInterface = await this._felService.postXmlUpdate(
      this.token,
      paramUpdate,
    )


    if (!resUpdateXml.status) {
      this.isLoading = false;
      this.showError(resUpdateXml);
      return;
    }

    this.isLoading = false;
    this._notificationService.openSnackbar("Documento creado y certificado correctamente.");

  }

  async showError(res: ResApiInterface) {


    let verificador = await this._notificationService.openDialogActions(
      {
        title: this._translate.instant('pos.alertas.salioMal'),
        description: this._translate.instant('pos.alertas.error'),
        verdadero: this._translate.instant('pos.botones.informe'),
        falso: this._translate.instant('pos.botones.aceptar'),
      }
    );

    if (!verificador) return;

    this.mostrarError(res);


  }

  async modifyDoc() {
    //TODO:Translate
    let verificador: boolean = await this._notificationService.openDialogActions(
      {
        title: "¿Estás seguro?",
        description: "Se aplicaran los cambios al documento.",
        verdadero: this._translate.instant('pos.botones.aceptar'),
        falso: this._translate.instant('pos.botones.cancelar'),
      }
    );

    if (!verificador) return;


    const partesFecha = this.globalConvertService.docOriginSelect!.fecha_Documento.toString().split('/');
    const dia = partesFecha[0];
    const mes = partesFecha[1];
    const anio = partesFecha[2];

    // Crea un objeto Date con el formato esperado ('YYYY-MM-DD')
    const fechaFormateada = new Date(`${anio}-${mes}-${dia}`);



    // Actualizar documento (ewncabezados)
    let docModify: UpdateDocInterface = {
      consecutivoInterno: this.globalConvertService.docOriginSelect!.consecutivo_Interno,
      cuentaCorrentista: this.facturaService.cuenta!.cuenta_Correntista,
      cuentaCorrentistaRef: this.facturaService.vendedor?.cuenta_Correntista,
      cuentaCuenta: this.facturaService.cuenta!.cuenta_Cta,
      documentoDireccion: this.facturaService.cuenta!.factura_Direccion,
      documentoNit: this.facturaService.cuenta!.factura_NIT,
      documentoNombre: this.facturaService.cuenta!.factura_Nombre,
      empresa: this.globalConvertService.docOriginSelect!.empresa,
      estacionTrabajo: this.globalConvertService.docOriginSelect!.estacion_Trabajo,
      fechaDocumento: fechaFormateada,
      fechaFin: this.facturaService.fechaFin,
      fechaHora: this.globalConvertService.docOriginSelect!.fecha_Hora,
      fechaIni: this.facturaService.fechaIni,
      localizacion: this.globalConvertService.docOriginSelect!.localizacion,
      mUser: this.user,
      observacion: this.facturaService.observacion,
      serieDocumento: this.globalConvertService.docOriginSelect!.serie_Documento,
      tipoDocumento: this.globalConvertService.docOriginSelect!.tipo_Documento,
      user: this.globalConvertService.docOriginSelect!.usuario,
      idDocumento: this.globalConvertService.docOriginSelect!.iD_Documento.toString(),
      referencia: this.globalConvertService.docOriginSelect!.referencia,
    }

    this.isLoading = true;
    let resUpdateEncabezado: ResApiInterface = await this._recpetionService.updateDocument(
      this.token,
      docModify,
    );

    if (!resUpdateEncabezado.status) {
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

      this.mostrarError(resUpdateEncabezado);

      return;
    }



    let refModify: UpdateRefInterface = {
      descripcion: this.facturaService.refDescripcion ?? "",
      empresa: this.globalConvertService.docOriginSelect!.empresa,
      fechaFin: this.facturaService.fechaRefFin!,
      fechaIni: this.facturaService.fechaRefIni!,
      mUser: this.user,
      observacion: this.facturaService.refObservacion ?? "",
      observacion2: this.facturaService.refContacto ?? "",
      observacion3: this.facturaService.refDireccionEntrega ?? "",
      referencia: this.globalConvertService.docOriginSelect!.referencia!,
      referenciaID: '92144684365752',//TODO:Preguntar
      tipoReferencia: this.facturaService.tipoReferencia?.tipo_Referencia ?? null,

    }

    let resRefUpdate: ResApiInterface = await this._recpetionService.updateRef(
      this.token,
      refModify,
    );

    if (!resRefUpdate.status) {
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

      this.mostrarError(resRefUpdate);

      return;
    }


    //TODO:continuar  con la logica de actualizar detalle

    //eliminar transacciones
    for (const eliminar of this.facturaService.transaccionesPorEliminar) {


      let transactionEliminar: NewTransactionInterface = {
        bodega: eliminar.bodega!.bodega,
        cantidad: eliminar.cantidad!,
        documentoConsecutivoInterno: this.globalConvertService.docOriginSelect!.consecutivo_Interno,
        empresa: this.globalConvertService.docOriginSelect!.empresa,
        estacionTrabajo: this.globalConvertService.docOriginSelect!.estacion_Trabajo,
        localizacion: this.globalConvertService.docOriginSelect!.localizacion,
        moneda: eliminar.precio!.moneda,
        monto: eliminar.total,
        montoMoneda: eliminar.total / this.tipoCambio,
        producto: eliminar.producto.producto,
        tipoCambio: this.tipoCambio,
        tipoPrecio: eliminar.precio!.id,
        tipoTransaccion: this.facturaService.resolveTipoTransaccion(eliminar.producto.tipo_Producto),
        transaccionConsecutivoInterno: eliminar.consecutivo,
        unidadMedida: eliminar.producto.unidad_Medida,
        usuario: this.user,
      }


      let resTransDelete: ResApiInterface = await this._recpetionService.anularTransaccion(
        this.token,
        transactionEliminar,
      );


      if (!resTransDelete.status) {

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

        this.mostrarError(resTransDelete);

        return;

      }



    }

    //lipiar lista de eliminados
    this.facturaService.transaccionesPorEliminar = [];


    let indexUpdate: number = 0;
    //Actualizar transacciones
    for (const actualizar of this.facturaService.traInternas) {

      if (actualizar.estadoTra != 0 && actualizar.consecutivo != 0) {

        ///Anular y actualizar
        let transactionActualizar: NewTransactionInterface = {
          bodega: actualizar.bodega!.bodega,
          cantidad: actualizar.cantidad!,
          documentoConsecutivoInterno: this.globalConvertService.docOriginSelect!.consecutivo_Interno,
          empresa: this.globalConvertService.docOriginSelect!.empresa,
          estacionTrabajo: this.globalConvertService.docOriginSelect!.estacion_Trabajo,
          localizacion: this.globalConvertService.docOriginSelect!.localizacion,
          moneda: actualizar.precio!.moneda,
          monto: actualizar.total,
          montoMoneda: actualizar.total / this.tipoCambio,
          producto: actualizar.producto.producto,
          tipoCambio: this.tipoCambio,
          tipoPrecio: actualizar.precio!.id,
          tipoTransaccion: this.facturaService.resolveTipoTransaccion(actualizar.producto.tipo_Producto),
          transaccionConsecutivoInterno: actualizar.consecutivo,
          unidadMedida: actualizar.producto.unidad_Medida,
          usuario: this.user,
        }


        let resTransDelete: ResApiInterface = await this._recpetionService.anularTransaccion(
          this.token,
          transactionActualizar,
        );


        if (!resTransDelete.status) {

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

          this.mostrarError(resTransDelete);

          return;

        }




        let resActualizarTransaccion: ResApiInterface = await this._recpetionService.insertarTransaccion(
          this.token,
          transactionActualizar,
        );


        if (!resActualizarTransaccion.status) {

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

          this.mostrarError(resActualizarTransaccion);

          return;

        }


        this.facturaService.traInternas[indexUpdate].consecutivo = resActualizarTransaccion.response;
        indexUpdate++;
      }
    }


    let indexInsert: number = 0;
    //insertar tranasacciones
    for (const nueva of this.facturaService.traInternas) {

      if (nueva.estadoTra != 0 && nueva.consecutivo == 0) {
        ///Nueva transaccion
        let transactionNueva: NewTransactionInterface = {
          bodega: nueva.bodega!.bodega,
          cantidad: nueva.cantidad!,
          documentoConsecutivoInterno: this.globalConvertService.docOriginSelect!.consecutivo_Interno,
          empresa: this.globalConvertService.docOriginSelect!.empresa,
          estacionTrabajo: this.globalConvertService.docOriginSelect!.estacion_Trabajo,
          localizacion: this.globalConvertService.docOriginSelect!.localizacion,
          moneda: nueva.precio!.moneda,
          monto: nueva.total,
          montoMoneda: nueva.total / this.tipoCambio,
          producto: nueva.producto.producto,
          tipoCambio: this.tipoCambio,
          tipoPrecio: nueva.precio!.id,
          tipoTransaccion: this.facturaService.resolveTipoTransaccion(nueva.producto.tipo_Producto),
          transaccionConsecutivoInterno: nueva.consecutivo,
          unidadMedida: nueva.producto.unidad_Medida,
          usuario: this.user,
        }

        let resActualizarTransaccion: ResApiInterface = await this._recpetionService.insertarTransaccion(
          this.token,
          transactionNueva,
        );


        if (!resActualizarTransaccion.status) {

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

          this.mostrarError(resActualizarTransaccion);

          return;

        }

        this.facturaService.traInternas[indexInsert].consecutivo = resActualizarTransaccion.response;
        indexInsert++;

      }

    }


    this.isLoading = false;

    this._notificationService.openSnackbar("Documento editado correctamente.");

  }


  async printCotizacion() {

    this.isLoading = true;

    let resCot: ResApiInterface = await this._printFormatService.getReportCotizacion(
      this.user,
      this.token,
      this.consecutivoDoc,
    );

    if (!resCot.status) {
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

      this.mostrarError(resCot);

      return;
    }

    this.isLoading = false;


    let dataPrint: CotizacionInterface[] = resCot.response;


    console.log(dataPrint);





  }

  async printDoc() {

    // //Verificar tipo de documento
    // if (this.facturaService.tipoDocumento == 20) {
    //   //Generar datos apra impresion de cotizacion

    //   this.printCotizacion();
    //   return;
    // }

    this.isLoading = true;

    let resEncabezado: ResApiInterface = await this._documentService.getEncabezados(
      this.user,
      this.token,
      this.consecutivoDoc!,
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

      this.mostrarError(resEncabezado);

      return;

    }

    let encabezados: EncabezadoPrintInterface[] = resEncabezado.response;

    let resDetalles: ResApiInterface = await this._documentService.getDetalles(
      this.user,
      this.token,
      this.consecutivoDoc!,
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

      this.mostrarError(resDetalles);

      return;

    }

    let detalles: DetallePrintInterface[] = resDetalles.response;

    let resPagos: ResApiInterface = await this._documentService.getPagos(
      this.user,
      this.token,
      this.consecutivoDoc!,
    );


    if (!resPagos.status) {

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

      this.mostrarError(resPagos);

      return;

    }

    this.isLoading = false;

    let pagos: PagoPrintInterface[] = resPagos.response;



    if (encabezados.length == 0) {
      let verificador = await this._notificationService.openDialogActions(
        {
          title: this._translate.instant('pos.alertas.salioMal'),
          description: this._translate.instant('pos.alertas.error'),
          verdadero: this._translate.instant('pos.botones.informe'),
          falso: this._translate.instant('pos.botones.aceptar'),
        }
      );

      if (!verificador) return;

      this.mostrarError(
        {
          response: this._translate.instant('pos.factura.sin_encabezados'),
          status: false,
          storeProcedure: resEncabezado.storeProcedure,
        }
      );

      return;
    }


    let encabezado: EncabezadoPrintInterface = encabezados[0];

    let empresa: Empresa = {
      direccion: encabezado.empresa_Direccion ?? "",
      nit: encabezado.empresa_Nit ?? "",
      nombre: encabezado.empresa_Nombre ?? "",
      razonSocial: encabezado.razon_Social ?? "",
      tel: encabezado.empresa_Telefono ?? "",
    }


    let isFel: boolean = this.facturaService.valueParametro(349);

    let documento: DocumentoData = {
      titulo: encabezado.tipo_Documento?.toUpperCase()!,
      descripcion: isFel ? this._translate.instant('pos.factura.fel') : this._translate.instant('pos.factura.documento_generico'),
      fechaCert: isFel ? encabezado.feL_fechaCertificacion : "",
      serie: isFel ? encabezado.feL_Serie : "",
      no: isFel ? encabezado.feL_numeroDocumento : "",
      autorizacion: isFel ? encabezado.feL_UUID : "",
      noInterno: `${encabezado.serie_Documento}-${encabezado.id_Documento}`,
    }

    let cuenta: ClienteInterface | undefined = this.facturaService.cuenta;


    let currentDate: Date = new Date();

    let cliente: Cliente = {
      correo: cuenta?.eMail ?? "",
      nombre: cuenta?.factura_Nombre ?? "",
      direccion: cuenta?.factura_Direccion ?? "",
      nit: cuenta?.factura_NIT ?? "",
      tel: cuenta?.telefono ?? "",
      fecha: currentDate,
    }

    let fechas: Fechas = {
      fechaInicio: this.facturaService.fechaIni!,
      fechaInicioRef: this.facturaService.fechaFin!,
      fechaFin: this.facturaService.fechaFin!,
      fechaFinRef: this.facturaService.fechaRefFin!,
    }

    let cargo: number = 0;
    let descuento: number = 0;
    let subtotal: number = 0;
    let total: number = 0;

    let items: Item[] = [];


    //TODO:Usar transacciones de la base de datos
    this.facturaService.traInternas.forEach(detail => {



      if (detail.cantidad == 0 && detail.total > 0) {
        //4 cargo
        cargo += detail.total;
      } else if (detail.cantidad == 0 && detail.total < 0) {
        //5 descuento
        descuento += detail.total;
      } else {
        //cualquier otro
        subtotal += detail.total;
      }

      items.push(
        {
          sku: detail.producto.producto_Id,
          descripcion: detail.producto.des_Producto,
          cantidad: detail.cantidad,
          unitario: this.currencyPipe.transform(detail.cantidad > 0 ? detail.precioCantidad! / detail.cantidad : detail.precioCantidad, ' ', 'symbol', '2.2-2')!,
          total: this.currencyPipe.transform(detail.total, ' ', 'symbol', '2.2-2')!,
          precioDia: this.currencyPipe.transform(detail.precioDia, ' ', 'symbol', '2.2-2')!,
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

    let pagosP: Pago[] = [];

    pagos.forEach(pago => {

      pagosP.push(
        {
          tipoPago: pago.fDes_Tipo_Cargo_Abono,
          monto: this.currencyPipe.transform(pago.monto, ' ', 'symbol', '2.2-2')!,
          pago: this.currencyPipe.transform((pago.monto + pago.cambio), ' ', 'symbol', '2.2-2')!,
          cambio: this.currencyPipe.transform(pago.cambio, ' ', 'symbol', '2.2-2')!,
        }
      );
    });


    let vendedor: string = "";

    if (this.facturaService.vendedores.length > 0) {
      vendedor = this.facturaService.vendedor!.nom_Cuenta_Correntista;
    }

    let certificador: Certificador;

    if (isFel) {
      certificador = {
        nit: encabezado.certificador_DTE_NIT!,
        nombre: encabezado.certificador_DTE_Nombre!,
      }
    }

    let mensajes: string[] = [
      //TODO: Mostrar frase
      // "**Sujeto a pagos trimestrales**",
      this._translate.instant('pos.factura.sin_devoluciones')
    ];

    let poweredBy: PoweredBy = {
      nombre: "Desarrollo Moderno de Software S.A.",
      website: "www.demosoft.com.gt",
    }

    let observaciones: ObservacionesRef = {
      descripcion: this.facturaService.refDescripcion ?? "",
      observacion: this.facturaService.refObservacion ?? "",
      observacion2: this.facturaService.refContacto ?? "",
      observacion3: this.facturaService.refDireccionEntrega ?? "",
    }

    this.docPrint = {
      noDoc: this.consecutivoDoc.toString(),
      refObservacones: observaciones,
      empresa: empresa,
      documento: documento,
      cliente: cliente,
      items: items,
      montos: montos,
      pagos: pagosP,
      vendedor: vendedor,
      certificador: certificador!,
      observacion: this.facturaService.observacion,
      mensajes: mensajes,
      poweredBy: poweredBy,
      fechas: fechas,
    }


    //Imprimir doc 

    if (this.facturaService.tipoDocumento! == 20) {
      //immmpirmir cotizacion

      const docDefinition = await this._printService.getPDFCotizacionAlfaYOmega(this.docPrint);
      pdfMake.createPdf(docDefinition).print();



      return;

    }

    const docDefinition = await this._printService.getPDFDocTMU(this.docPrint);

    pdfMake.createPdf(docDefinition).print();

    return;


    // //Verificar que ya se haya configurado antes 
    // if (!PreferencesService.port) {
    //   this.isLoading = true;

    //   let resStatus5000: ResApiInterface = await this._printService.getStatus("5000");

    //   if (!resStatus5000.status) {
    //     let resStatus5001: ResApiInterface = await this._printService.getStatus("5001");

    //     if (!resStatus5001.status) {

    //       this.isLoading = false;

    //       this._notificationService.openSnackbar(this._translate.instant('pos.alertas.sin_servicio_impresion'));


    //       const docDefinition = await this._printService.getPDFDocTMU(this.docPrint);

    //       pdfMake.createPdf(docDefinition).print();

    //       return;
    //     } else {

    //       PreferencesService.port = "5001";
    //     }

    //   } else {
    //     PreferencesService.port = "5000";
    //   }

    //   this.isLoading = false;


    //   this.verVistaPrevia = true;

    // } else {


    //   if (PreferencesService.localPrint) {
    //     this.isLoading = false;
    //     const docDefinition = await this._printService.getPDFDocTMU(this.docPrint);

    //     pdfMake.createPdf(docDefinition).print();

    //     return;
    //   }

    //   if (!PreferencesService.vistaPrevia) {

    //     this.isLoading = false;
    //     this.verVistaPrevia = true;
    //     return;

    //   }


    //   let resStatus: ResApiInterface = await this._printService.getStatus(PreferencesService.port);


    //   if (!resStatus.status) {


    //     this.isLoading = false;

    //     this._notificationService.openSnackbarAction(
    //       this._translate.instant('pos.alertas.sin_servicio_impresion'),
    //       this._translate.instant('pos.botones.imprimir'),
    //       async () => {
    //         const docDefinition = await this._printService.getPDFDocTMU(this.docPrint!);

    //         pdfMake.createPdf(docDefinition).print();
    //       }
    //     );


    //     return;
    //   }


    //   let isOnline: ResApiInterface = await this._printService.getStatusPrint(PreferencesService.impresora);


    //   if (!isOnline.status) {
    //     this.isLoading = false;

    //     this._notificationService.openSnackbar(`${PreferencesService.impresora}  ${this._translate.instant('pos.factura.no_disponible')}`);

    //     this._notificationService.openSnackbarAction(
    //       `${PreferencesService.impresora}  ${this._translate.instant('pos.factura.no_disponible')}`,
    //       this._translate.instant('pos.botones.imprimir'),
    //       async () => {
    //         const docDefinition = await this._printService.getPDFDocTMU(this.docPrint!);

    //         pdfMake.createPdf(docDefinition).print();
    //       }
    //     );


    //     return;

    //   }

    //   const docDefinition = await this._printService.getPDFDocTMU(this.docPrint);

    //   const pdfDocGenerator = pdfMake.createPdf(docDefinition);


    //   // return;
    //   pdfDocGenerator.getBlob(async (blob) => {
    //     // ...
    //     var pdfFile = new File([blob], 'ticket.pdf', { type: 'application/pdf' });

    //     this.isLoading = true;

    //     let resPrint: ResApiInterface = await this._printService.postPrint(
    //       pdfFile,
    //       PreferencesService.impresora,
    //       PreferencesService.copies
    //     );

    //     this.isLoading = false;


    //     if (!resPrint.status) {

    //       this.isLoading = false;

    //       let verificador = await this._notificationService.openDialogActions(
    //         {
    //           title: this._translate.instant('pos.alertas.salioMal'),
    //           description: this._translate.instant('pos.alertas.error'),
    //           verdadero: this._translate.instant('pos.botones.informe'),
    //           falso: this._translate.instant('pos.botones.aceptar'),
    //         }
    //       );

    //       if (!verificador) return;

    //       this.mostrarError(resPrint);

    //       return;

    //     }
    //     this._notificationService.openSnackbar(this._translate.instant('pos.factura.documento_procesado'));

    //   });

    // }


  }




  findTipoProducto(tipoTra: number) {

    let transacciones: TipoTransaccionInterface[] = this.facturaService.tiposTransaccion;



    //buscar tipo de trabsaccion dependientdo del tipo de producto
    for (let i = 0; i < transacciones.length; i++) {
      const element = transacciones[i];
      if (tipoTra == element.tipo) {
        //Devolver tipo de transaccion correspondiente al tipo de producto
        return element.tipo_Transaccion;
      }
    }

    //si no encontró el tipo de producto retorna 0
    return 0;
  }


  //Creacion del documnto en tbl_documento estructura
  async sendDocument() {

    // Generar dos números aleatorios de 7 dígitos cada uno?
    let randomNumber1: number = Math.floor(Math.random() * 9000000) + 1000000;
    let randomNumber2: number = Math.floor(Math.random() * 9000000) + 1000000;

    // Combinar los dos números para formar uno de 14 dígitos
    let strNum1: string = randomNumber1.toString();
    let strNum2: string = randomNumber2.toString();
    let combinedStr: string = strNum1 + strNum2;

    //ref id
    let combinedNum: number = parseInt(combinedStr, 10);

    //Cargo abono  para el documento
    let pagos: CargoAbono[] = [];
    //transacciones para el docummento
    let transacciones: Transaccion[] = [];

    //id transaccion
    let consecutivo: number = 1;

    //recorre transacciones
    this.facturaService.traInternas.forEach(transaccion => {

      //id padre
      let padre: number = consecutivo;

      //cargos
      let cargos: Transaccion[] = [];

      //descuentos
      let descuentos: Transaccion[] = [];

      //buscar cargos y descuentos
      transaccion.operaciones.forEach(operacion => {
        //agregar cargo
        if (operacion.cargo > 0) {

          //aumnetar id de la transaccion
          consecutivo++;

          //agregar cargos
          cargos.push(
            {
              D_Consecutivo_Interno: randomNumber1,
              Tra_Consecutivo_Interno: consecutivo,
              Tra_Consecutivo_Interno_Padre: padre,
              Tra_Bodega: transaccion.bodega!.bodega,
              Tra_Producto: transaccion.producto.producto,
              Tra_Unidad_Medida: transaccion.producto.unidad_Medida,
              Tra_Cantidad: 0,
              Tra_Tipo_Cambio: this.tipoCambio,
              Tra_Moneda: transaccion.precio!.moneda,
              Tra_Tipo_Precio: transaccion.precio!.precio ? transaccion.precio!.id : null,
              Tra_Factor_Conversion: !transaccion.precio!.precio ? transaccion.precio!.id : null,
              Tra_Tipo_Transaccion: this.facturaService.resolveTipoTransaccion(4),
              Tra_Monto: operacion.cargo,
              Tra_Monto_Dias: null,
            }
          );

        }

        //Agregar descuentos
        if (operacion.descuento < 0) {

          //aumnetar id de la transaccion
          consecutivo++;

          descuentos.push(
            {
              D_Consecutivo_Interno: randomNumber1,
              Tra_Consecutivo_Interno: consecutivo,
              Tra_Consecutivo_Interno_Padre: padre,
              Tra_Bodega: transaccion.bodega!.bodega,
              Tra_Producto: transaccion.producto.producto,
              Tra_Unidad_Medida: transaccion.producto.unidad_Medida,
              Tra_Cantidad: 0,
              Tra_Tipo_Cambio: this.tipoCambio,
              Tra_Moneda: transaccion.precio!.moneda,
              Tra_Tipo_Precio: transaccion.precio!.precio ? transaccion.precio!.id : null,
              Tra_Factor_Conversion: !transaccion.precio!.precio ? transaccion.precio!.id : null,
              Tra_Tipo_Transaccion: this.facturaService.resolveTipoTransaccion(3),
              Tra_Monto: operacion.descuento,
              Tra_Monto_Dias: null,

            }
          );
        }

      });

      //agregar transacion (que no sea cargo o descuento)
      transacciones.push(
        {
          D_Consecutivo_Interno: randomNumber1,
          Tra_Consecutivo_Interno: padre,
          Tra_Consecutivo_Interno_Padre: null,
          Tra_Bodega: transaccion.bodega!.bodega,
          Tra_Producto: transaccion.producto.producto,
          Tra_Unidad_Medida: transaccion.producto.unidad_Medida,
          Tra_Cantidad: transaccion.cantidad,
          Tra_Tipo_Cambio: this.tipoCambio,
          Tra_Moneda: transaccion.precio!.moneda,
          Tra_Tipo_Precio: transaccion.precio!.precio ? transaccion.precio!.id : null,
          Tra_Factor_Conversion: !transaccion.precio!.precio ? transaccion.precio!.id : null,
          Tra_Tipo_Transaccion: this.facturaService.resolveTipoTransaccion(transaccion.producto.tipo_Producto),
          Tra_Monto: transaccion.total,
          //TODO:veridificar monto por dias
          Tra_Monto_Dias: transaccion.precioDia,
        }

      );

      //agregar cargos al documento
      cargos.forEach(cargo => {
        transacciones.push(cargo);
      });


      //agegar descuentos   al documento
      descuentos.forEach(descuento => {
        transacciones.push(descuento);
      });

      //aumnetar id de la transaccion
      consecutivo++;

    });


    let consecutivoPago: number = 1;

    //agreagar cargo abono a la estructrura
    this.facturaService.montos.forEach(monto => {
      pagos.push(
        {
          Consecutivo_Interno: consecutivoPago,
          D_Consecutivo_Interno: randomNumber1,
          Tipo_Cargo_Abono: monto.payment.tipo_Cargo_Abono,
          Monto: monto.amount,
          Cambio: monto.difference,
          Tipo_Cambio: this.tipoCambio,
          Moneda: transacciones[0].Tra_Moneda,
          Monto_Moneda: monto.amount / this.tipoCambio,
          Referencia: monto.reference,
          Autorizacion: monto.authorization,
          Banco: monto.bank?.banco ?? null,
          Cuenta_Bancaria: monto.account?.cuenta_Bancaria ?? null,
        }
      );
      consecutivoPago++;
    });



    //total cargo abono
    let totalCA: number = 0;

    this.facturaService.montos.forEach(monto => {
      totalCA += monto.amount;
    });


    //Obtener fecha y hora actual
    let currentDate: Date = new Date();


    //Solucion para que las horas sean correctas
    //Modificar la hora segun la diferencia horaria 
    let fEntrega: Date = this.facturaService.fechaRefIni!;
    let fRecoger: Date = this.facturaService.fechaRefFin!;
    let fIni: Date = this.facturaService.fechaIni!;
    let fFin: Date = this.facturaService.fechaFin!;

    let diferenciaHoraria: number = fEntrega.getTimezoneOffset() / 60;


    if (diferenciaHoraria > 0) {
      //es positivo
      fEntrega.setHours(this.facturaService.fechaRefIni!.getHours() - diferenciaHoraria);
      fRecoger.setHours(this.facturaService.fechaRefFin!.getHours() - diferenciaHoraria);
      fIni.setHours(this.facturaService.fechaIni!.getHours() - diferenciaHoraria);
      fFin.setHours(this.facturaService.fechaFin!.getHours() - diferenciaHoraria);
    } else {
      fEntrega.setHours(this.facturaService.fechaRefIni!.getHours() + diferenciaHoraria)
      fRecoger.setHours(this.facturaService.fechaRefFin!.getHours() + diferenciaHoraria)
      fIni.setHours(this.facturaService.fechaIni!.getHours() + diferenciaHoraria)
      fFin.setHours(this.facturaService.fechaFin!.getHours() + diferenciaHoraria)
    }



    //documento estructura
    let doc: Documento = {
      Consecutivo_Interno: randomNumber1,
      Doc_Ref_Tipo_Referencia: this.facturaService.valueParametro(58) ? this.facturaService.tipoReferencia?.tipo_Referencia : null,
      Doc_Ref_Fecha_Ini: this.facturaService.valueParametro(381) ? fEntrega : null,
      Doc_Ref_Fecha_Fin: this.facturaService.valueParametro(382) ? fRecoger : null,
      Doc_Fecha_Ini: this.facturaService.valueParametro(44) ? fIni : null,
      Doc_Fecha_Fin: this.facturaService.valueParametro(44) ? fFin : null,
      Doc_Ref_Observacion_2: this.facturaService.valueParametro(385) ? this.facturaService.refContacto : null,
      Doc_Ref_Descripcion: this.facturaService.valueParametro(383) ? this.facturaService.refDescripcion : null,
      Doc_Ref_Observacion_3: this.facturaService.valueParametro(386) ? this.facturaService.refDireccionEntrega : null,
      Doc_Ref_Observacion: this.facturaService.valueParametro(384) ? this.facturaService.refObservacion : null,
      Doc_Tra_Monto: this.facturaService.total,
      Doc_CA_Monto: totalCA,
      Doc_ID_Certificador: 1, //TODO:Parametrizar
      Doc_Cuenta_Correntista_Ref: this.facturaService.vendedor?.cuenta_Correntista ?? null,
      Doc_ID_Documento_Ref: combinedNum,
      Doc_FEL_numeroDocumento: null,
      Doc_FEL_Serie: null,
      Doc_FEL_UUID: null,
      Doc_FEL_fechaCertificacion: null,
      Doc_Fecha_Documento: currentDate.toISOString(),
      Doc_Cuenta_Correntista: this.facturaService.cuenta!.cuenta_Correntista,
      Doc_Cuenta_Cta: this.facturaService.cuenta!.cuenta_Cta,
      Doc_Tipo_Documento: this.documento,
      Doc_Serie_Documento: this.serie,
      Doc_Empresa: this.empresa,
      Doc_Estacion_Trabajo: this.estacion,
      Doc_UserName: this.user,
      Doc_Observacion_1: this.facturaService.observacion,
      Doc_Tipo_Pago: 1, //TODO:preguntar
      Doc_Elemento_Asignado: 1, //TODO:Preguntar
      Doc_Transaccion: transacciones,
      Doc_Cargo_Abono: pagos,
    }

    //onjeto para el api
    let document: PostDocumentInterface = {
      estructura: JSON.stringify(doc),
      user: this.user,
    }

    this.isLoading = true;
    //consumo del servico para crear el documento
    let resDoc = await this._documentService.postDocument(this.token, document);

    this.isLoading = false;

    //Si algo salió mal mostrar error
    if (!resDoc.status) {

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

      this.mostrarError(resDoc);

      return;

    }


    this.consecutivoDoc = resDoc.response.data;


    //Si todo está correcto mostrar alerta

    if (!this.facturaService.valueParametro(349)) {

      this._notificationService.openSnackbar(this._translate.instant('pos.alertas.documentoCreado'));
    }

  }





}
